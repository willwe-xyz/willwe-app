// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.3;

import "./interfaces/IMembrane.sol";
import "./interfaces/IFun.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @title Membrane
/// @author parseb (original), Assistant (refactored)
contract Membranes is IMembrane {
    mapping(uint256 => Membrane) membraneById;
    IFun public willWe;

    error membraneNotFound();
    error Membrane__EmptyFieldOnMembraneCreation();
    error Membrane__UnauthorizedWillWeSet();

    event WillWeSet(address willWeAddress);
    event MembraneCreated(address creator, uint256 membraneId, string CID);

    /// @notice creates membrane. Used to control and define.
    /// @notice To be read and understood as: Given this membrane, of each of the tokens_[x], the user needs at least balances_[x].
    /// @param tokens_ ERC20 or ERC721 token addresses array. Each is used as a constituent item of the membrane and condition for
    /// @param tokens_ at [x] can also be a user address that is whitelisted or blacklisted. for whitelist uint256(uint160(address of user)). any other (0) for blacklist.
    /// @param tokens_ at [x] if it is willwe address the balancce_ at [x] is the node id of which the user is required to already be a member of
    /// @param tokens_ belonging or not. Membership is established by a chain of binary claims whereby
    /// @param tokens_ the balance of address checked needs to satisfy all balances_ of all tokens_ stated as benchmark for belonging
    /// @param balances_ amounts required of each of tokens_. The order of required balances needs to map to token addresses.
    /// @param meta_ anything you want. Preferably stable CID for reaching aditional metadata such as an IPFS hash of type string.
    function createMembrane(address[] memory tokens_, uint256[] memory balances_, string memory meta_)
        public
        virtual
        returns (uint256 id)
    {
        if (tokens_.length != balances_.length) revert Membrane__EmptyFieldOnMembraneCreation();
        if (bytes(meta_).length == 0) revert Membrane__EmptyFieldOnMembraneCreation();
        Membrane memory M;
        M.tokens = tokens_;
        M.balances = balances_;
        M.meta = meta_;
        M.createdAt = block.timestamp;
        id = uint256(keccak256(abi.encode(M)));
        membraneById[id] = M;

        emit MembraneCreated(msg.sender, id, meta_);
    }

    function setInitWillWe() external {
        if (address(willWe) != address(0)) revert Membrane__UnauthorizedWillWeSet();
        willWe = IFun(msg.sender);
        emit WillWeSet(msg.sender);
    }

    /// @inheritdoc IMembrane
    function gCheck(address who_, uint256 membraneID_) public view returns (bool s) {
        Membrane memory M = membraneById[membraneID_];
        s = true;
        for (uint256 i = 0; i < M.tokens.length; i++) {
            if (M.tokens[i] == address(willWe)) {
                s = s && willWe.isMember(who_, M.balances[i]);
                continue;
            }

            if (M.tokens[i] == who_) {
                if (M.balances[i] == uint256(uint160(who_))) return true;
                return false;
            }

            if (M.tokens[i].code.length == 0) continue;

            try IERC20(M.tokens[i]).balanceOf(who_) returns (uint256 balance) {
                s = s && (balance >= M.balances[i]);
            } catch {
                continue;
            }

            if (!s) break;
        }
    }

    function getMembraneById(uint256 id_) public view returns (Membrane memory) {
        return membraneById[id_];
    }
}
