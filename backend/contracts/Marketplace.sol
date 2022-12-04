// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Marketplace is ReentrancyGuard, ERC721Holder {
    address payable _owner;
    uint256 private _listingFee = 0.1 ether;

    using Counters for Counters.Counter;
    Counters.Counter private _allNFTsListed;
    Counters.Counter private _itemsSold;
    Counters.Counter private _diggerMachineSmallDistributed;
    
    struct ListedToken {
        uint256 itemId; //starts at 1
        uint256 tokenId; //starts at 1
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
    
    mapping (uint256 => ListedToken) private _tokenList;
    mapping (address => Counters.Counter) private _tokensForAddress;


    constructor() {
        _owner = payable(msg.sender);
    }


    function getMarketplaceOwner() public view returns(address) {
        return _owner;
    }

    function getAllTokens() public view returns(ListedToken[] memory) {
        ListedToken[] memory allItems = new ListedToken[](_allNFTsListed.current());
        for (uint a = 0; a < _allNFTsListed.current(); a++) {
            uint i = a + 1;
            allItems[a] = _tokenList[i];
        }
        return allItems;
    }

    function getNumberOfSoldItems() public view returns(uint256) {
        return _itemsSold.current();
    }

    function deliverDiggerMachineSmall(address dmsContract, uint256 tokenId) public payable {
        createMarketItem(dmsContract, tokenId, 0);
    }


    function createMarketItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
        ) public payable nonReentrant {
        require(msg.sender == _owner, "You are not the marketplace owner");
        require(price >= 0, "Price must be positive");
        
        _allNFTsListed.increment();
        uint itemId = _allNFTsListed.current();
        _tokenList[itemId] = ListedToken(
            itemId,
            tokenId,
            nftContractAddress,
            payable(address(0)),
            payable(msg.sender),
            price,
            false
        );

        _tokensForAddress[nftContractAddress].increment();
        IERC721(nftContractAddress).safeTransferFrom(msg.sender, address(this), tokenId); //transfer minted NFT to marketplace
    
        emit TokenListed(itemId, tokenId, nftContractAddress, address(0), msg.sender, price, false);
    }

    
    function getAllNFTsNotSold() public view returns (ListedToken[] memory) {
        uint256 totalItemCount = _allNFTsListed.current();
        uint256 itemsNotSold = _allNFTsListed.current() - _itemsSold.current();
        uint index = 0;

        ListedToken[] memory items = new ListedToken[](itemsNotSold);
        for (uint a = 0; a < totalItemCount; a++) {
            uint i = a + 1;
            uint currentItemId = _tokenList[i].itemId;
            ListedToken storage currentItem = _tokenList[currentItemId];

            if (currentItem.owner == address(0)) {
                items[index] = currentItem;
                index += 1;
            }
        }

        return items;
    }

    function fetchNFTsFromContractAddress(
        address nftContractAddress
    ) public view returns (ListedToken[] memory) {
        //ListedToken[] memory availableItems = getAllNFTsNotSold();
        uint256 numberOfTokensOfThisContractAddress = _tokensForAddress[nftContractAddress].current();
        ListedToken[] memory items = new ListedToken[](numberOfTokensOfThisContractAddress);
        uint256 index = 0;

        for (uint a = 0; a < _allNFTsListed.current(); a++) {
            uint i = a + 1;
            ListedToken memory currentItem = _tokenList[i];
            if (currentItem.tokenAddress == nftContractAddress) {
                items[index] = currentItem;
                index++;
            }
        }
        return items;
    }

    function sellToken(
        address nftContract,
        uint tokenId
    ) public payable nonReentrant {
        ListedToken[] memory availableItemsToSell = fetchNFTsFromContractAddress(nftContract);
        // fetch the unbought items
        ListedToken memory itemToSell;

        for (uint i = 0; i < availableItemsToSell.length; i++) {
            ListedToken memory currentItem = availableItemsToSell[i];
            if (currentItem.tokenId == tokenId) {
                itemToSell = currentItem;
                break;
            }
        }
        uint256 price = itemToSell.price;
        uint256 itemToSellItemId = itemToSell.itemId;
        require (msg.value == price, "Price is not correct");

        itemToSell.seller.transfer(msg.value); // the seller receives the money
        ERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId); // transfer the NFT ownership to buyer (in the contract)
        
        _tokenList[itemToSellItemId].owner = payable(msg.sender); // transfer the NFT ownership to buyer (in marketplace)
        _tokenList[itemToSellItemId].sold = true; // set the value to sold
        _itemsSold.increment();
        //payable(_owner).transfer(_listingFee); // the marketplace owner gets paid on each transaction
    }
}