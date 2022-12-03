// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract DiggerMachineLarge is ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _nextTokenId; // token id of the next minted Token
    address _marketplace;
    uint128 constant MAX_TOKENS_TO_MINT = 50; // 50000


    constructor(address marketplaceAddress) ERC721("Digger Machine Large", "DML") {
        _marketplace = marketplaceAddress;
        _nextTokenId.increment();
    }

    // OVERRIDES FOR DOUBLE INHERITANCE ...........
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    // ............................................


    function getOwner(uint tokenId) public view returns (address) {
        return _ownerOf(tokenId);
    }

    
    function mintToken(string memory uri) public returns (uint256) {
        require(_nextTokenId.current() <= MAX_TOKENS_TO_MINT, "All the large Digger machines have been minted");

        uint256 mintedTokenId = _nextTokenId.current();
        _safeMint(msg.sender, mintedTokenId);
        _setTokenURI(mintedTokenId, uri);
        _setApprovalForAll(msg.sender, _marketplace, true);
        _nextTokenId.increment();
        return mintedTokenId;
    }
}