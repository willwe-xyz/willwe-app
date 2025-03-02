/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.25;

import {Receiver} from "solady/accounts/Receiver.sol";
import {IPowerProxy} from "../interfaces/IPowerProxy.sol";

/**
 * @dev This abstract contract provides a fallback function that delegates all calls to another contract using the EVM
 * instruction `delegatecall`. We refer to the second contract as the _implementation_ behind the proxy, and it has to
 * be specified by overriding the virtual {_implementation} function.
 *
 * Additionally, delegation to the implementation can be triggered manually through the {_fallback} function, or to a
 * different contract through the {_delegate} function.
 *
 * The success and return data of the delegated call will be returned back to the caller of the proxy.
 */

/// @author Michael Elliot <mike@makerdao.com>
/// @author Joshua Levine <joshua@makerdao.com>
/// @author Nick Johnson <arachnid@notdot.net>
/// @author OpenZeppelin OpenZeppelin.com
/// ---------------------------------------
/// @author parseb.eth @ github.com/parseb

/// @notice A simple authenticated proxy. A mashup of (MakerDAO) MulticallV2 and simple (OpenZeppelin) proxy.
contract PowerProxy is Receiver {
    address public owner;
    address public implementation;

    /// @notice EIP 127 signature store
    mapping(bytes32 => bool) isSignedHash;

    /// @notice Stores execution authorisation type.
    uint8 public immutable allowedAuthType;

    constructor(address proxyOwner_, uint8 consensusType_) {
        owner = proxyOwner_;
        allowedAuthType = consensusType_;
    }

    struct Call {
        address target;
        bytes callData;
        uint256 value;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    error noFallback();
    error NotOwner();
    error Multicall2();

    function tryAggregate(bool requireSuccess, Call[] calldata calls) public returns (Result[] memory returnData) {
        if (msg.sender != owner && msg.sender != address(this)) revert NotOwner();
        returnData = new Result[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);

            if (requireSuccess && (!success)) revert Multicall2();

            returnData[i] = Result(success, ret);
        }
    }

    function setImplementation(address implementation_) external {
        if (msg.sender != owner) revert NotOwner();
        if (implementation_ != implementation) implementation = implementation_;
    }

    function setOwner(address owner_) external {
        if (msg.sender != owner) revert NotOwner();
        owner = owner_;
    }

    function setSignedHash(bytes32 hash_) external {
        if (msg.sender != owner) revert NotOwner();
        isSignedHash[hash_] = !isSignedHash[hash_];
    }

    function isValidSignature(bytes32 hash_, bytes calldata _signature) external view returns (bytes4) {
        if (isSignedHash[hash_]) return 0x1626ba7e;
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external payable override receiverFallback {
        if (implementation == address(0)) revert noFallback();

        address i;
        assembly {
            i := sload(implementation.slot)
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), i, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
