const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let marketplaceAddress;
  let marketplace;
  let listingPrice;
  let sellingPrice;
  let dmsNFT;
  let dmsAddress;

  beforeEach(async function() {
    const marketplaceFactory = await ethers.getContractFactory("Marketplace");
    marketplace = await marketplaceFactory.deploy();
    await marketplace.deployed();
    marketplaceAddress = marketplace.address;
    
    const diggerMachineSmallFactory = await ethers.getContractFactory("DiggerMachineSmall");
    dmsNFT = await diggerMachineSmallFactory.deploy(marketplaceAddress);
    await dmsNFT.deployed();
    dmsAddress = dmsNFT.address;

    listingPrice = await marketplace.getListingPrice();
    sellingPrice = ethers.utils.parseUnits("0.01", "ether"); // arbitrary value, just for testing
  })

  it("Sould mint 10 NFT and add them to listed items", async function () {
    let dmsTokenId = await dmsNFT.getTokenID();
    expect(dmsTokenId).to.equal(1)

    for (var i = 1; i < 11; i+=1) {
      await dmsNFT.mintToken("www.token.com");
      await marketplace.createMarketItem(dmsAddress, i, sellingPrice, {value: listingPrice});
    }

    const tokensListedReadyToBeSold = await marketplace.fetchAllListedNFTsNotSold();
    expect(tokensListedReadyToBeSold.length).to.equal(10);

    tokensListedReadyToBeSold.forEach(nft => {
      expect(nft.owner).to.equal('0x0000000000000000000000000000000000000000');
    });
  })
})