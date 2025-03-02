// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {SignatureChecker} from "openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol";
import {Address} from "openzeppelin-contracts/contracts/utils/Address.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";
import {SignatureQueue, SQState, MovementType, Movement, Call, LatentMovement} from "./interfaces/IExecution.sol";
import {IFun} from "./interfaces/IFun.sol";
import {IPowerProxy} from "./interfaces/IPowerProxy.sol";
import {PowerProxy} from "./components/PowerProxy.sol";
import {Receiver} from "solady/accounts/Receiver.sol";

/// @title Execution
/// @author parseb
contract Execution is Receiver {
    using Address for address;
    using Strings for string;

    address public WillToken;
    IFun public WillWe;
    bytes32 public lastSalt;

    bytes4 internal constant EIP1271_MAGICVALUE = 0x1626ba7e;
    bytes4 internal constant EIP1271_MAGIC_VALUE_LEGACY = 0x20c13b0b;

    bytes32 public constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant MOVEMENT_TYPEHASH = keccak256(
        "Movement(uint8 category,address initiatior,address exeAccount,uint256 viaNode,uint256 expiresAt,string description,bytes executedPayload)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;

    error EXE_UninitQueue();
    error EXE_ExpiredMovement();
    error EXE_InvalidQueue();
    error EXE_EmptyUnallowed();
    error EXE_NotNodeMember();
    error EXE_AlreadyInitialized();
    error EXE_UnavailableState();
    error EXE_ExpiredQueue();
    error EXE_NotExeAccOwner();
    error EXE_AlreadyHasEndpoint();
    error EXE_NoMembersForNode();
    error EXE_NoMovementType();
    error EXE_AlreadySigned();
    error EXE_LenErr();
    error EXE_AlreadyInit();
    error EXE_OnlyWillWe();
    error EXE_NoSignatures();
    error EXE_SQInvalid();
    error EXE_NoType();
    error EXE_NoDescription();
    error EXE_ZeroLen();
    error EXE_A0sig();
    error EXE_OnlyMore();
    error EXE_OnlySigner();
    error EXE_exeQFail();
    error EXE_InProgress();
    error EXE_ActionIndexMismatch();
    error EXE_BadOwnerOrAuthType();

    /// events
    event NewMovementCreated(uint256 indexed nodeId, address initiator, bytes32 movementHash, string description);
    event WillWeSet(address implementation);
    event NewSignaturesSubmitted(bytes32 indexed queueHash);
    event QueueExecuted(uint256 indexed nodeId, bytes32 indexed queueHash);
    event SignatureRemoved(uint256 indexed nodeId, bytes32 indexed queueHash, address signer);
    event LatentActionRemoved(uint256 indexed nodeId, bytes32 indexed actionHash, uint256 index);

    /// @notice signature by hash
    mapping(bytes32 hash => SignatureQueue SigQueue) getSigQueueByHash;

    /// @notice initialized actions from node [node -> latentActionsOfNode[] | [0] valid start index, prevs. 0]
    mapping(uint256 => bytes32[]) latentActions;

    /// @notice stores node that owns a particular execution engine
    mapping(address exeAccount => uint256 endpointOwner) engineOwner;

    /// @notice any one agent is allowed to have only one endpoint
    /// @notice stores agent signatures to prevent double signing  | ( uint256(hash) - uint256(_msgSender()  ) - signer can be simple or composed agent
    mapping(uint256 agentPlusNode => bool) hasEndpointOrInteraction;

    constructor(address WillToken_) {
        WillToken = WillToken_;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("WillWe.xyz")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function setWillWe(address implementation) external {
        if (address(WillWe) == address(0)) WillWe = IFun(implementation);
        if (msg.sender == WillToken) WillWe = IFun(implementation);
        emit WillWeSet(implementation);
    }

    function startMovement(
        uint8 typeOfMovement,
        uint256 nodeId,
        uint256 expiresInDays,
        address executingAccount,
        string memory description,
        bytes memory data
    ) external returns (bytes32 movementHash) {
        if (typeOfMovement > 2 || typeOfMovement == 0) revert EXE_NoMovementType();
        if (!WillWe.isMember(msg.sender, nodeId)) revert EXE_NotNodeMember();

        if (((typeOfMovement * nodeId * expiresInDays) == 0)) revert EXE_EmptyUnallowed();
        if (bytes(description).length < 8) revert EXE_NoDescription();

        if (executingAccount == address(0)) {
            executingAccount = createNodeEndpoint(nodeId, typeOfMovement);
            engineOwner[executingAccount] = nodeId;
        } else {
            if (!(engineOwner[executingAccount] == nodeId)) revert EXE_NotExeAccOwner();
            if (
                IPowerProxy(executingAccount).owner() != address(this)
                    || IPowerProxy(executingAccount).allowedAuthType() != typeOfMovement
            ) revert EXE_BadOwnerOrAuthType();
        }

        Movement memory M;
        M.initiatior = msg.sender;
        M.viaNode = nodeId;
        M.description = description;
        M.executedPayload = data;
        M.exeAccount = executingAccount;
        M.expiresAt = (expiresInDays * 1 days) + block.timestamp;
        M.category = typeOfMovement == 1 ? MovementType.AgentMajority : MovementType.EnergeticMajority;

        movementHash = hashMovement(M);
        latentActions[nodeId].push(movementHash);

        SignatureQueue memory SQ;
        SQ.state = SQState.Initialized;
        SQ.Action = M;

        if (getSigQueueByHash[movementHash].state != SQState.None) revert EXE_AlreadyInitialized();
        getSigQueueByHash[movementHash] = SQ;

        emit NewMovementCreated(nodeId, msg.sender, movementHash, description);
    }

    function executeQueue(bytes32 queueHash) external virtual returns (bool success) {
        SignatureQueue memory SQ = validateQueue(queueHash);

        if (SQ.state != SQState.Valid) revert EXE_InvalidQueue();
        if (SQ.Action.expiresAt <= block.timestamp) revert EXE_ExpiredMovement();

        Movement memory M = SQ.Action;

        SQ.state = SQState.Executed;
        getSigQueueByHash[queueHash] = SQ;

        (success,) = (SQ.Action.exeAccount).call(M.executedPayload);
        if (!success) revert EXE_exeQFail();

        emit QueueExecuted(SQ.Action.viaNode, queueHash);
    }

    function submitSignatures(bytes32 queueHash, address[] memory signers, bytes[] memory signatures) external {
        SignatureQueue memory SQ = getSigQueueByHash[queueHash];

        if (signatures.length < SQ.Sigs.length) revert EXE_OnlyMore();
        if (signers.length * signatures.length == 0) revert EXE_ZeroLen();
        if (signers.length != signatures.length) revert EXE_LenErr();

        bytes32 digest = getEIP712MessageHash(queueHash);

        uint256 validCount;
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == address(0)) continue;

            if (hasEndpointOrInteraction[uint256(queueHash) - uint160(signers[i])]) {
                continue;
            }

            if (!(WillWe.isMember(signers[i], SQ.Action.viaNode))) {
                continue;
            }

            if (!SignatureChecker.isValidSignatureNow(signers[i], digest, signatures[i])) continue;

            hasEndpointOrInteraction[uint256(queueHash) - uint160(signers[i])] = true;
            validCount++;
        }

        if (validCount > 0) {
            uint256 newSize = SQ.Signers.length + validCount;
            address[] memory newSigners = new address[](newSize);
            bytes[] memory newSignatures = new bytes[](newSize);

            for (uint256 i = 0; i < SQ.Signers.length; i++) {
                newSigners[i] = SQ.Signers[i];
                newSignatures[i] = SQ.Sigs[i];
            }

            uint256 j = SQ.Signers.length;
            for (uint256 i = 0; i < signers.length; i++) {
                if (hasEndpointOrInteraction[uint256(queueHash) - uint160(signers[i])]) {
                    newSigners[j] = signers[i];
                    newSignatures[j] = signatures[i];
                    j++;
                }
            }

            getSigQueueByHash[queueHash].Signers = newSigners;
            getSigQueueByHash[queueHash].Sigs = newSignatures;
        }
        emit NewSignaturesSubmitted(queueHash);
    }

    function removeSignature(bytes32 queueHash, uint256 index, address signer) external {
        SignatureQueue memory SQ = getSigQueueByHash[queueHash];

        if (SQ.Signers[index] != signer) revert EXE_OnlySigner();
        delete SQ.Sigs[index];
        delete SQ.Signers[index];
        getSigQueueByHash[queueHash] = SQ;
        hasEndpointOrInteraction[uint256(queueHash) - uint160(signer)] = false;

        emit SignatureRemoved(SQ.Action.viaNode, queueHash, signer);
    }

    function removeLatentAction(bytes32 actionHash, uint256 index) external {
        SignatureQueue memory SQ = getSigQueueByHash[actionHash];
        if (SQ.Action.expiresAt > block.timestamp) SQ.state = SQState.Stale;
        if (SQ.state == SQState.Initialized || SQ.state == SQState.Valid) revert EXE_InProgress();
        if (latentActions[SQ.Action.viaNode][index] != actionHash) revert EXE_ActionIndexMismatch();
        delete latentActions[SQ.Action.viaNode][index];
        if (uint256(latentActions[SQ.Action.viaNode][0]) > index) latentActions[SQ.Action.viaNode][0] = bytes32(index);
        getSigQueueByHash[actionHash] = SQ;

        emit LatentActionRemoved(SQ.Action.viaNode, actionHash, index);
    }

    function createEndpointForOwner(address origin, uint256 nodeId, address owner)
        external
        returns (address endpoint)
    {
        if (msg.sender != address(WillWe)) revert EXE_OnlyWillWe();
        if (hasEndpointOrInteraction[nodeId + uint160(bytes20(owner))]) revert EXE_AlreadyHasEndpoint();
        hasEndpointOrInteraction[nodeId + uint160(bytes20(owner))] = true;

        endpoint = spawnNodeEndpoint(owner, 3);
        WillWe.localizeEndpoint(endpoint, nodeId, owner);
    }

    function createInitWillWeEndpoint(uint256 nodeId_) external returns (address endpoint) {
        if (msg.sender != address(WillWe)) revert EXE_OnlyWillWe();
        endpoint = createNodeEndpoint(nodeId_, 2);
    }

    function createNodeEndpoint(uint256 nodeId_, uint8 consensusType_) private returns (address endpoint) {
        endpoint = spawnNodeEndpoint(address(this), consensusType_);
        engineOwner[endpoint] = nodeId_;
        WillWe.localizeEndpoint(endpoint, nodeId_, address(this));
    }

    function spawnNodeEndpoint(address proxyOwner_, uint8 authType) private returns (address) {
        lastSalt = nextSalt();
        return address(new PowerProxy{salt: lastSalt}(proxyOwner_, authType));
    }

    function validateQueue(bytes32 sigHash) private returns (SignatureQueue memory SQM) {
        SQM = getSigQueueByHash[sigHash];
        if (SQM.Action.expiresAt <= block.timestamp) {
            SQM.state = SQState.Stale;
            getSigQueueByHash[sigHash] = SQM;
        }
        if (!isQueueValid(sigHash)) revert EXE_SQInvalid();

        SQM.state = SQState.Valid;
        getSigQueueByHash[sigHash] = SQM;
    }

    function isQueueValid(bytes32 sigHash) public view returns (bool) {
        SignatureQueue memory SQM = getSigQueueByHash[sigHash];

        if (SQM.Action.category == MovementType.Revert) return false;
        if (SQM.state == SQState.Valid) return true;
        if (SQM.state != SQState.Initialized) return false;
        if (SQM.Signers.length == 0) return false;
        if (SQM.Signers.length != SQM.Sigs.length) return false;

        uint256 i;
        uint256 power;
        address[] memory signers = SQM.Signers;
        bytes[] memory signatures = SQM.Sigs;

        bytes32 digest = getEIP712MessageHash(sigHash);

        for (i; i < signatures.length; ++i) {
            if (signers[i] == address(0)) continue;

            if (!SignatureChecker.isValidSignatureNow(signers[i], digest, signatures[i])) return false;

            power = (SQM.Action.category == MovementType.EnergeticMajority)
                ? power + WillWe.balanceOf(signers[i], SQM.Action.viaNode)
                : power + 1;
        }

        if (power > 0) {
            if (SQM.Action.category == MovementType.EnergeticMajority) {
                return (power > ((WillWe.totalSupply(SQM.Action.viaNode) / 2)));
            }
            if (SQM.Action.category == MovementType.AgentMajority) {
                return (power > ((WillWe.allMembersOf(SQM.Action.viaNode).length / 2)));
            }
        }
        return false;
    }

    function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4) {
        if (getSigQueueByHash[_hash].state == SQState.Valid) return EIP1271_MAGICVALUE;
        return 0x00000000;
    }

    /// @notice retrieves the node or agent that owns the execution account
    /// @param endpointAddress execution account for which to retrieve owner
    /// @dev in case of user-driven endpoints the returned value is uint160(address of endpoint creator)
    function endpointOwner(address endpointAddress) public view returns (uint256) {
        return engineOwner[endpointAddress];
    }

    function getSigQueue(bytes32 hash_) public view returns (SignatureQueue memory) {
        return getSigQueueByHash[hash_];
    }

    function getLatentMovements(uint256 nodeId) public view returns (LatentMovement[] memory latentMovements) {
        bytes32[] memory nodeActions = latentActions[nodeId];
        latentMovements = new LatentMovement[](nodeActions.length);

        for (uint256 i = 0; i < nodeActions.length; i++) {
            SignatureQueue memory sq = getSigQueueByHash[nodeActions[i]];
            latentMovements[i] = LatentMovement({movement: sq.Action, signatureQueue: sq, movementHash: nodeActions[i]});
        }
    }

    function nextSalt() public view returns (bytes32) {
        return keccak256(abi.encodePacked(block.prevrandao, block.timestamp, block.chainid, lastSalt));
    }

    /**
     * @dev Returns the hash of a Movement struct using EIP-712 typed data hashing
     * @param movement The Movement struct to hash
     * @return The hash of the movement
     */
    function hashMovement(Movement memory movement) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                MOVEMENT_TYPEHASH,
                movement.category,
                movement.initiatior,
                movement.exeAccount,
                movement.viaNode,
                movement.expiresAt,
                keccak256(bytes(movement.description)),
                keccak256(movement.executedPayload)
            )
        );
    }

    /**
     * @dev Creates an EIP-712 compatible message hash from a movement hash
     * @param movementHash The hash of the movement
     * @return The EIP-712 message hash
     */
    function getEIP712MessageHash(bytes32 movementHash) public view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, movementHash));
    }

    /**
     * @dev Returns the digest to sign based on a complete Movement struct
     * This is the function frontend should use when preparing signatures
     * @param movement The Movement struct to sign
     * @return The EIP-712 digest that should be signed
     */
    function getDigestToSign(Movement memory movement) public view returns (bytes32) {
        bytes32 movementHash = hashMovement(movement);
        return getEIP712MessageHash(movementHash);
    }
}
