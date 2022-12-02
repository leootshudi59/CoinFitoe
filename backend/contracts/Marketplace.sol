// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Marketplace is ReentrancyGuard, ERC721Holder {
    address payable _owner;

    using Counters for Counters.Counter;
    Counters.Counter private _allNFTsListed;
    Counters.Counter private _itemsSold;
    
    uint256 _listingPrice = 0.001 gwei;

    struct ListedToken {
        uint256 itemId;
        uint256 tokenId;
        address tokenAddress;
        address payable owner;
        address payable seller;
        uint256 price;
        bool sold;
    }

    event TokenListed (
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address indexed tokenAddress,
        address owner,
        address seller,
        uint256 price,
        bool sold
    );
    
    mapping (uint256 => ListedToken) private tokenList;


    constructor() {
        _owner = payable(msg.sender);
    }


    function getListingPrice() public view returns (uint256) {
        return _listingPrice;
    }

    function createMarketItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
        ) public payable nonReentrant {
        require(msg.sender == _owner, "You are not the marketplace owner");
        require(msg.value == _listingPrice, "Not enough money sent to list NFT");
        require(price >= 0, "Price must be positive");

        uint itemId = _allNFTsListed.current();
        tokenList[itemId] = ListedToken(
            itemId,
            tokenId,
            nftContractAddress,
            payable(address(0)),
            payable(msg.sender),
            price,
            false
        );
        _allNFTsListed.increment();

        IERC721(nftContractAddress).safeTransferFrom(msg.sender, address(this), tokenId); //transfer minted NFT to marketplace
    
        emit TokenListed(itemId, tokenId, nftContractAddress, address(0), msg.sender, price, false);
    }

    
    function fetchAllListedNFTsNotSold() public view returns (ListedToken[] memory) {
        uint256 totalItemCount = _allNFTsListed.current();
        uint256 itemsNotSold = _allNFTsListed.current() - _itemsSold.current();
        uint index = 0;

        ListedToken[] memory items = new ListedToken[](itemsNotSold);
        for (uint a = 0; a < totalItemCount; a++) {
            uint i = a + 1;
            uint currentItemId = tokenList[i].itemId;
            ListedToken storage currentItem = tokenList[currentItemId];

            if (currentItem.owner == address(0)) {
                items[index] = currentItem;
                index += 1;
            }
        }

        return items;
    }
}