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
    Counters.Counter private _diggerMachineSmallDistributed;
    
    uint constant MAX_DIGGERMACHINESMALL_TO_MINT = 50;

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
    mapping (address => Counters.Counter) private _tokensForAddress;


    constructor() {
        _owner = payable(msg.sender);
    }

    function createDMS(address dmsContract, uint256 tokenId) public payable {
        require (
            _diggerMachineSmallDistributed.current() < MAX_DIGGERMACHINESMALL_TO_MINT,
            "All the small Digger machines have been created");

        createMarketItem(dmsContract, tokenId, 0);
    }


    function createMarketItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
        ) public payable nonReentrant {
        require(msg.sender == _owner, "You are not the marketplace owner");
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

        _tokensForAddress[nftContractAddress].increment();
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

    function fetchNFTsFromContractAddress(
        address nftContractAddress
    ) public view returns (ListedToken[] memory) {
        ListedToken[] memory availableItems = fetchAllListedNFTsNotSold();
        uint256 numberOfTokensOfThisContractAddress = _tokensForAddress[nftContractAddress].current();
        ListedToken[] memory items = new ListedToken[](numberOfTokensOfThisContractAddress);
        uint256 index = 0;

        for (uint i = 0; i < availableItems.length; i += 1) {
            ListedToken memory currentItem = availableItems[i];
            if (currentItem.tokenAddress == nftContractAddress) {
                items[index] = currentItem;
                index++;
            }
        }
        return items;
    }

    function sellToken(
        address nftContract
    ) public {
        ListedToken[] memory availableItemsToSell = fetchNFTsFromContractAddress(nftContract);

    }
}