// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Radar is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    address _marketplace;

    constructor(address marketplaceAddress) ERC721("Radar", "RAD") {
        _marketplace = marketplaceAddress;
        _tokenId.increment();
    }

    function getTokenID() public view returns (uint256) {
        return _tokenId.current();
    }
    
    function mintToken(string memory tokenURI) public returns (uint256) {
        uint256 mintedTokenId = _tokenId.current();
        _safeMint(msg.sender, mintedTokenId);
        _setTokenURI(mintedTokenId, tokenURI);
        _setApprovalForAll(msg.sender, _marketplace, true);
        _tokenId.increment();
        return mintedTokenId;
    }
}