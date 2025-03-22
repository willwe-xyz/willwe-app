// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.3;

import {ERC1155} from "solady/tokens/ERC1155.sol";

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IExecution.sol";
import {NodeState} from "./interfaces/IExecution.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";
import {PureUtils} from "./components/PureUtils.sol";
import "./interfaces/IMembrane.sol";

///////////////////////////////////////////////
//////////////////////////////////////////////
/// @title Fungido
/// @author Bogdan A. | parseb
////////////////////////////////////////////
contract Fungido is ERC1155, PureUtils {
    using Strings for uint256;

    uint256 entityCount;
    address public executionAddress;
    address public Will;

    IMembrane M;
    /// @notice stores the total supply of each id | id -> supply
    mapping(uint256 => uint256) totalSupplyOf;

    /// @notice gets children of parent entity given its id | parent => [child...]
    mapping(uint256 => uint256[]) childrenOf;

    /// @notice parent of instance chain | is root if parent is 0
    mapping(uint256 => uint256) parentOf;

    /// @notice inflation per second | entityID -> [ inflationpersec | last modified | last minted ]
    mapping(uint256 => uint256[3]) inflSec;

    /// @notice membrane being used by entity | entityID ->  [ membrane id | last Timestamp]
    mapping(uint256 => uint256[2]) inUseMembraneId;

    /// @notice members of node || user address -> user endpoints || root id -> all derrived subnodes ids
    mapping(uint256 => address[]) members;

    /// @notice stores a users option for change and node state [ wanted value, lastExpressedAt ]
    mapping(bytes32 NodeXUserXValue => uint256[3] valueAtTime) public options;

    /// @notice tax rate on withdrawals as share in base root value token (default: 0.01%)
    mapping(address => uint256) taxRate;

    address[2] public control;
    address impersonatingAddress;

    string public name;
    string public symbol;
    bool useBefore;

    constructor(address executionAddr, address membranes) {
        taxRate[address(0)] = 100_0;
        executionAddress = executionAddr;
        Will = IExecution(executionAddr).WillToken();
        M = IMembrane(membranes);

        name = "WillWe.xyz";
        symbol = "WILL";

        useBefore = true;
    }

    ////////////////////////////////////////////////
    //////______ERRORS______///////////////////////

    error BaseOrNonFungible();
    error AlreadyMember();
    error NodeNotFound();
    error Unqualified();
    error MintE20TransferFailed();
    error BurnE20TransferFailed();
    error UnregisteredFungible();
    error EOA();
    error RootExists();
    error NodeAlreadyExists();
    error UnsupportedTransfer();
    error NotMember();
    error MembershipOp();
    error No();
    error Endpoint();
    error ExecutionOnly();
    error NoControl();
    error Unautorised();
    error SignalOverflow();
    error InsufficientAmt();
    error IncompleteSign();
    error isControled();
    error Disabled();
    error Overreach();

    ////////////////////////////////////////////////
    //////________EVENTS________///////////////////

    event SelfControlAtAddress(address AgencyLocus);
    event NewRootNode(uint256 indexed rootNodeId);
    event NewNode(uint256 indexed newId, uint256 indexed parentId, address indexed creator);
    event MemberRemoved(address indexed userAddress, uint256 indexed nodeId);
    event Burned(address indexed fromAddressOrNode, uint256 indexed nodeId, uint256 amount);
    event Minted(address indexed fromAddressOrNode, uint256 indexed nodeId, uint256 amount);
    event SharesGenerated(uint256 indexed nodeId, uint256 amount);
    event InflationRateChanged(uint256 indexed nodeId, uint256 oldInflationRate, uint256 newInflationRate);
    event MembraneChanged(uint256 indexed nodeId, uint256 previousMembrane, uint256 newMembrane);
    ////////////////////////////////////////////////
    //////________MODIFIER________/////////////////

    /// @notice sets address in control of fiscal policy
    /// @notice can chenge token specific tax rates, should be an endpoint
    /// @notice two step function
    /// @param newController address of new controller
    function setControl(address newController) external {
        if (msg.sender != control[0]) revert NoControl();
        if (control[1] == newController) {
            control[0] = control[1];
            delete control[1];
        } else {
            control[1] = newController;
        }
    }

    //// @notice initializes control address default to Will and creates an endpoint for it
    //// @return address of agency of controling extremity
    function initSelfControl() external returns (address) {
        if (control[0] != address(0)) revert isControled();
        control[0] = IExecution(executionAddress).createInitWillWeEndpoint(this.spawnNode(toID(Will)));

        M.setInitWillWe();
        emit SelfControlAtAddress(control[0]);
        return control[0];
    }

    ////////////////////////////////////////////////
    //////______EXTERNAL______/////////////////////

    /// @notice spawns core Node for a token
    /// @notice acts as port for token value
    /// @notice nests all token specific contexts
    /// @param fungible20_ address of ERC20 token
    function spawnRootNode(address fungible20_) public virtual returns (uint256 fID) {
        if (fungible20_.code.length == 0) revert EOA();

        fID = toID(fungible20_);
        if (parentOf[fID] != 0) revert RootExists();

        _localizeNode(fID, fID);
        ++entityCount;

        emit NewRootNode(fID);
    }

    /// @notice creates new context nested under a parent node id
    /// @notice agent spawning a new underlink needs to be a member in containing context
    /// @param fid_ context node id
    function spawnNode(uint256 fid_) public virtual returns (uint256 newID) {
        if (parentOf[fid_] == 0) spawnRootNode(toAddress(fid_));
        if (!isMember(_msgSender(), fid_) && (parentOf[fid_] != fid_)) revert NotMember();
        if (totalSupplyOf[fid_] == type(uint256).max) revert Endpoint();

        ++entityCount;

        newID = fid_ - block.timestamp - entityCount - (block.prevrandao % 1000000000);
        _setApprovalForAll(toAddress(newID), address(this), true);
        _localizeNode(newID, fid_);
        if (msg.sender != address(this)) _giveMembership(_msgSender(), newID);

        emit NewNode(newID, fid_, msg.sender);
    }
    /// @notice spawns Node with an enforceable membership mechanism and creates new membrane
    /// @param fid_ context (parent) node
    /// @param tokens_ array of token addresses for membrane conditions
    /// @param balances_ array of required balances for each token
    /// @param meta_ metadata string (e.g. IPFS hash) for membrane details
    /// @param inflationRate_ rate for new Node token shares in gwei per second

    function spawnNodeWithMembrane(
        uint256 fid_,
        address[] memory tokens_,
        uint256[] memory balances_,
        string memory meta_,
        uint256 inflationRate_
    ) public virtual returns (uint256 newID) {
        uint256 membraneID = M.createMembrane(tokens_, balances_, meta_);
        newID = spawnNode(fid_);
        inUseMembraneId[newID][0] = membraneID;
        inUseMembraneId[newID][1] = block.timestamp;
        inflSec[newID][0] = inflationRate_ == 0 ? 1_000 gwei : inflationRate_ * 1 gwei;
        emit MembraneChanged(newID, 0, membraneID);
        emit InflationRateChanged(newID, 0, inflSec[newID][0]);
    }

    /// @notice mints membership to calling address if it satisfies membership conditions
    /// @param fid_ node for which to mint membership
    function mintMembership(uint256 fid_) public virtual {
        if (parentOf[fid_] == 0) revert NodeNotFound();
        if (parentOf[fid_] == fid_) revert BaseOrNonFungible();
        if (totalSupplyOf[fid_] == type(uint256).max) revert Endpoint();
        if (isMember(_msgSender(), fid_)) revert AlreadyMember();
        if (!M.gCheck(_msgSender(), getMembraneOf(fid_))) revert Unqualified();

        _giveMembership(_msgSender(), fid_);
    }

    /// @notice mints amount of specified fid
    /// @notice requires an equal deposit of parent fid or root to be added to target reserve
    /// @param fid_ id to target for mint of kind
    /// @param amount_ amout to be minted
    function mint(uint256 fid_, uint256 amount_) public virtual {
        if (parentOf[fid_] == 0) revert UnregisteredFungible();
        _mint(_msgSender(), fid_, amount_, abi.encodePacked("fungible"));
    }

    /// @notice mints the specified amount of target fid
    /// @notice transfers the amount specified of erc 20 and mints all fids on path to target root
    /// @param target_ id to target for mint of kind
    /// @param amount_ amout to be minted
    function mintPath(uint256 target_, uint256 amount_) external {
        uint256[] memory fidPath = getFidPath(target_);
        uint256 i;
        for (i; i < fidPath.length; ++i) {
            mint(fidPath[i], amount_);
        }
        if (i > 0) mint(target_, amount_);
    }

    /// @notice burn the amount of targeted node id
    /// @param fid_ id of node
    /// @param amount_ amount to burn
    function burn(uint256 fid_, uint256 amount_) public virtual returns (uint256 topVal) {
        if (parentOf[fid_] == 0) revert BaseOrNonFungible();
        topVal = parentOf[fid_] == fid_ ? amount_ : inParentDenomination(amount_, fid_);
        if (parentOf[fid_] != fid_) {
            this.safeTransferFrom(toAddress(fid_), _msgSender(), parentOf[fid_], topVal, abi.encodePacked("burn"));
        } else {
            uint256 taxAmount = taxRate[toAddress(fid_)] == 0 ? taxRate[address(0)] : taxRate[toAddress(fid_)];
            taxAmount = amount_ / taxAmount;
            uint256 refundAmount = amount_ - taxAmount;
            if (amount_ <= refundAmount) revert No();

            if (
                !(
                    IERC20(toAddress(fid_)).transfer(Will, taxAmount)
                        && IERC20(toAddress(fid_)).transfer(_msgSender(), refundAmount)
                )
            ) revert BurnE20TransferFailed();
        }
        _burn(_msgSender(), fid_, amount_);
    }

    function burnPath(uint256 target_, uint256 amount) external {
        if (parentOf[target_] == 0) revert BaseOrNonFungible();

        uint256[] memory paths = getFidPath(target_);
        uint256 x;
        for (uint256 i; i < paths.length; ++i) {
            x = paths.length - 1 - i;
            if (balanceOf(_msgSender(), target_) < amount) revert InsufficientAmt();
            amount = burn(target_, amount);
            target_ = paths[x];
        }
        burn(target_, amount);
    }

    //// @notice enforces membership conditions on target
    //// @param target agent subject
    //// @param fid_ entity of belonging
    function membershipEnforce(address target, uint256 fid_) public virtual returns (bool s) {
        if (balanceOf(target, membershipID(fid_)) != 1) revert NotMember();
        if (target == _msgSender()) {
            _burn(target, membershipID(fid_), 1);
            return true;
        }

        s = !M.gCheck(target, getMembraneOf(fid_));
        fid_ = membershipID(fid_);

        if (s) _burn(target, fid_, 1);
        emit MemberRemoved(target, fid_);
    }

    /// @notice mints the inflation of a specific context token
    /// @notice increases ratio of reserve to context denomination
    /// @param node identifier of node context
    function mintInflation(uint256 node) public virtual returns (uint256 amount) {
        if (parentOf[node] == node) return 0;
        amount = (block.timestamp - inflSec[node][2]) * inflSec[node][0];
        if (amount == 0) return 0;
        inflSec[node][2] = block.timestamp;

        _mint(address(uint160(node)), node, amount, abi.encodePacked("inflation"));
        emit SharesGenerated(node, amount);
    }

    function _giveMembership(address to, uint256 id) private {
        members[id].push(to);

        _mint(to, membershipID(id), 1, abi.encodePacked(to, "membership", id));
    }

    function localizeEndpoint(address endpoint_, uint256 endpointParent_, address owner_) external {
        if (msg.sender != executionAddress) revert ExecutionOnly();
        if (isMember(owner_, endpointParent_)) {
            members[toID(owner_)].push(endpoint_);
            members[toID(owner_) + endpointParent_].push(endpoint_);
            totalSupplyOf[toID(endpoint_)] = type(uint256).max;
        }
        _localizeNode(toID(endpoint_), endpointParent_);
    }

    function _localizeNode(uint256 newID, uint256 parentId) internal {
        if (parentOf[newID] != 0) revert NodeAlreadyExists();
        parentOf[newID] = parentId;
        if (parentId != newID) {
            childrenOf[parentId].push(newID);
            members[getFidPath(parentId)[0]].push(toAddress(newID));
            if (totalSupplyOf[newID] == type(uint256).max) return;
            inflSec[newID][0] = 1_000 gwei;
            inflSec[newID][2] = block.timestamp;
        }
    }

    //// @notice sets default or specific tax policy preference
    /// @notice default is 100_0 0.1%. custom range 1-100_00 basis points
    //// @param rootToken_ address (root node) for which to change tax rate
    /// @param taxRate_ share retained at full exit withdrawal expressed as basis points (default 0.01% or 100)
    function taxPolicyPreference(address rootToken_, uint256 taxRate_) external {
        if (_msgSender() != control[0]) revert Unautorised();
        if (taxRate_ == 1) revert Overreach();
        taxRate[rootToken_] = taxRate_;
    }

    /////////////////////////////////////////////////
    //////______ VIEW __________////////////////////

    /// @notice calculates and returns the value of a number of context tokens in terms of its root reserve
    /// @param target_ target node and its context token
    /// @param amount how many of to price
    function asRootValuation(uint256 target_, uint256 amount) public view returns (uint256) {
        uint256[] memory paths = getFidPath(target_);
        uint256 x;
        for (uint256 i; i < paths.length; ++i) {
            x = paths.length - 1 - i;
            target_ = paths[x];
            if (parentOf[target_] == target_) break;
            amount = inParentDenomination(amount, target_);
        }
        return amount;
    }

    /// @notice calculates the value of a number of context tokens in terms of reserve token
    /// @notice reserve token is allways smaller
    /// @param id_ target node by id and its context token
    /// @param amt_ how many of to price
    /// @return inParentVal max price of inputs at current minted inflation
    function inParentDenomination(uint256 amt_, uint256 id_) public view returns (uint256 inParentVal) {
        inParentVal = totalSupplyOf[id_] == 0 ? 0 : amt_ * balanceOf(toAddress(id_), parentOf[id_]) / totalSupplyOf[id_];
    }

    /// @notice retrieves token path id array from root to target id
    /// @param fid_ target fid to trace path to from root
    /// @return fids lineage in chronologic order
    function getFidPath(uint256 fid_) public view returns (uint256[] memory fids) {
        uint256 fidCount = 1;
        uint256 parent = parentOf[fid_];
        while (parent >= (fid_ + 1)) {
            if (parent == parentOf[parent]) break;
            ++fidCount;
            parent = parentOf[parent];
        }
        fids = new uint256[](fidCount);

        delete parent;
        for (parent; parent < fidCount; ++parent) {
            fids[fidCount - parent - 1] = parentOf[fid_];
            fid_ = parentOf[fid_];
        }
    }

    ////////////////////////////////////////////////
    //////________OVERRIDE________/////////////////

    function _useAfterTokenTransfer() internal view override returns (bool) {
        return false;
    }

    function _useBeforeTokenTransfer() internal view override returns (bool) {
        return useBefore;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        if (msg.sig == this.membershipEnforce.selector) {
            return;
        }
        for (uint256 i; ids.length > i;) {
            uint256 currentID = ids[i];
            uint256 currentAmt = amounts[i];
            if ((from != address(0) && to != address(0)) && (parentOf[currentID] == 0)) revert UnsupportedTransfer();

            if (currentID < 10 ether) {
                if (
                    !(
                        (msg.sig != this.mintMembership.selector) || (msg.sig != this.membershipEnforce.selector)
                            || (msg.sig != this.spawnRootNode.selector) || (msg.sig != this.spawnNodeWithMembrane.selector)
                            || (msg.sig != this.spawnNode.selector)
                    )
                ) revert MembershipOp();

                return;
            }

            if (msg.sig == this.mint.selector || msg.sig == this.mintPath.selector) {
                if (parentOf[currentID] == currentID) {
                    if (!IERC20(toAddress(currentID)).transferFrom(to, address(this), currentAmt)) {
                        revert MintE20TransferFailed();
                    }
                } else {
                    useBefore = false;
                    safeTransferFrom(_msgSender(), toAddress(currentID), parentOf[currentID], currentAmt, msg.data[0:1]);
                    useBefore = true;
                }
            }

            unchecked {
                ++i;
            }
        }
    }

    function _mint(address to, uint256 id, uint256 amount, bytes memory data) internal override {
        super._mint(to, id, amount, data);
        totalSupplyOf[id] += amount;
        emit Minted(to, id, amount);
    }

    function _burn(address from, uint256 id, uint256 amount) internal override {
        totalSupplyOf[id] -= amount;

        if (parentOf[id] > id && id > 10 ether) {
            mintInflation(id);
            super._burn(_msgSender(), id, amount);
            return;
        } else {
            super._burn(from, id, amount);
        }
        emit Burned(from, id, amount);
    }

    function _msgSender() internal view virtual returns (address) {
        if (msg.sender == Will) return address(this);
        return msg.sender;
    }

    function toAddress(uint256 x) public pure returns (address) {
        return x > type(uint160).max ? address(0) : address(uint160(x));
    }

    function toID(address x) public pure returns (uint256) {
        return uint256(uint160(x));
    }

    ////////////////////////////////////////////////
    //////____VIEW____/////////////////////////////

    /// @notice checks if provided address who is member in where id
    /// @param whoabout_ you care about them dont you
    /// @param whereabout_ you abouting about where exactly
    function isMember(address whoabout_, uint256 whereabout_) public view returns (bool) {
        if (balanceOf(whoabout_, membershipID(whereabout_)) >= 1) return true;
    }

    function getMembraneOf(uint256 fid_) public view returns (uint256) {
        return inUseMembraneId[fid_][0];
    }

    function allMembersOf(uint256 fid_) public view returns (address[] memory) {
        return members[fid_];
    }

    function getChildrenOf(uint256 fid_) public view returns (uint256[] memory) {
        return childrenOf[fid_];
    }

    function getParentOf(uint256 fid_) public view returns (uint256) {
        return parentOf[fid_];
    }

    function membershipID(uint256 fid_) public pure returns (uint256) {
        if (fid_ > 90 ether) return fid_ % 10 ether;
        return fid_;
    }

    function inflationOf(uint256 nodeId) external view returns (uint256) {
        return inflSec[nodeId][0];
    }

    function totalSupply(uint256 nodeId) external view returns (uint256) {
        return totalSupplyOf[nodeId];
    }

    ////////////////////////////////////////////////
    //////____MISC____/////////////////////////////

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256 id_) public view virtual override returns (string memory) {
        return string(abi.encodePacked("https://willwe.xyz/metadata/", id_.toString()));
    }

    function setApprovalForAll(address operator, bool isApproved) public override {
        revert Disabled();
    }

    ////////////////////////////////////////////////
    //////____eth_call____/////////////////////////////

    /// @notice returns a node's data given its identifier
    /// @param nodeId node identifier
    /// @dev for eth_call
    function getNodeData(uint256 nodeId) private view returns (NodeState memory NodeData) {
        /// Node identifier
        NodeData.basicInfo[0] = nodeId.toString();
        /// Current inflation rate per second
        NodeData.basicInfo[1] = inflSec[nodeId][0].toString();
        /// Reserve balance - amount of tokens held in parent's reserve
        NodeData.basicInfo[2] = balanceOf(toAddress(nodeId), parentOf[nodeId]).toString();
        /// Budget balance - amount of tokens held in node's own account
        NodeData.basicInfo[3] = balanceOf(toAddress(nodeId), nodeId).toString();
        /// Root valuation of node's budget (denominated in root token)
        NodeData.basicInfo[4] = (asRootValuation(nodeId, balanceOf(toAddress(nodeId), nodeId))).toString();
        /// Root valuation of node's reserve (denominated in root token)
        NodeData.basicInfo[5] = (asRootValuation(nodeId, balanceOf(toAddress(nodeId), parentOf[nodeId]))).toString();
        /// Active membrane identifier
        NodeData.basicInfo[6] = (inUseMembraneId[nodeId][0]).toString();
        /// Redistribution eligibility rate from parent per second in root valuation
        NodeData.basicInfo[7] = (
            asRootValuation(parentOf[nodeId], options[keccak256(abi.encodePacked(nodeId, parentOf[nodeId]))][0])
        ).toString();

        /// Timestamp of last redistribution
        NodeData.basicInfo[8] = inflSec[nodeId][2].toString();
        /// Balance of user
        /// basicInfo[9];
        /// Endpoint of user for node if any
        /// basicInfo[10];

        /// total supply of node token
        NodeData.basicInfo[11] = totalSupplyOf[nodeId].toString();

        /// Membrane Metadata CID
        NodeData.membraneMeta = M.getMembraneById(inUseMembraneId[nodeId][0]).meta;
        /// Array of member addresses
        NodeData.membersOfNode = members[nodeId];

        NodeData.movementEndpoints = members[toID(executionAddress) + nodeId];
        /// Array of direct children node IDs
        NodeData.childrenNodes = uintArrayToStringArray(childrenOf[nodeId]);
        /// Path from root token to node ID (ancestors)
        NodeData.rootPath = uintArrayToStringArray(getFidPath(nodeId));
    }

    function getNodes(uint256[] memory nodeIds) external view returns (NodeState[] memory nodes) {
        nodes = new NodeState[](nodeIds.length);
        for (uint256 i = 0; i < nodeIds.length; i++) {
            nodes[i] = getNodeData(nodeIds[i]);
        }
    }

    ///
    function getAllNodesForRoot(address rootAddress, address userIfAny)
        external
        view
        returns (NodeState[] memory nodes)
    {
        uint256 rootId = toID(rootAddress);
        nodes = new NodeState[](members[rootId].length);
        for (uint256 i = 0; i < members[rootId].length; i++) {
            nodes[i] = getNodeData(toID(members[rootId][i]), userIfAny);
        }
    }

    /// @notice Returns the array containing signal info for each child node in given originator and parent context
    /// @param signalOrigin address of originator
    /// @param parentNodeId node id for which originator has expressed
    function getUserNodeSignals(address signalOrigin, uint256 parentNodeId)
        external
        view
        returns (uint256[2][] memory UserNodeSignals)
    {
        uint256[] memory childNodes = childrenOf[parentNodeId];
        UserNodeSignals = new uint256[2][](childNodes.length);

        for (uint256 i = 0; i < childNodes.length; i++) {
            // Include the signalOrigin (user's address) in the signalKey
            bytes32 userTargetedPreference = keccak256(abi.encodePacked(signalOrigin, parentNodeId, childNodes[i]));

            // Store the signal value and the timestamp (assuming options[userKey] structure)
            UserNodeSignals[i][0] = options[userTargetedPreference][0]; // Signal value
            UserNodeSignals[i][1] = options[userTargetedPreference][1]; // Last updated timestamp
        }

        return UserNodeSignals;
    }

    function getNodeData(uint256 nodeId, address user) public view returns (NodeState memory nodeData) {
        nodeData = getNodeData(nodeId);
        if (user == address(0)) return nodeData;
        nodeData.basicInfo[9] = balanceOf(user, nodeId).toString();
        uint256 userEndpointId = toID(user) + nodeId;
        if (members[userEndpointId].length > 0) {
            nodeData.basicInfo[10] = Strings.toHexString(members[userEndpointId][0]);
        }
        nodeData.signals = new UserSignal[](1);
        nodeData.signals[0].MembraneInflation = new string[2][](childrenOf[nodeId].length);
        nodeData.signals[0].lastRedistSignal = new string[](childrenOf[nodeId].length);

        for (uint256 i = 0; i < childrenOf[nodeId].length; i++) {
            nodeData.signals[0].MembraneInflation[i][1] = inflSec[nodeId][0].toString();

            bytes32 userKey = keccak256(abi.encodePacked(user, nodeId, childrenOf[nodeId][i]));
            nodeData.signals[0].lastRedistSignal[i] = options[userKey][0].toString();
        }
    }
}
