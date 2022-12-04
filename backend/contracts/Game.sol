// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Game is ReentrancyGuard, ERC721Holder {
    address payable _owner;

    using Counters for Counters.Counter;
    Counters.Counter private _numberOfPlayers;

    constructor() {
        _owner = payable(msg.sender);
    }


    function getNumberOfPlayer() public view returns (uint256) {
        return _numberOfPlayers.current();
    }
}