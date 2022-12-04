const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTs", () => {
  let sellingPrice;

  async function deployTokenFixture() {
    const MarketplaceFactory = await ethers.getContractFactory(
      "Marketplace"
    );
    const DiggerMachineSmallFactory = await ethers.getContractFactory(
      "DiggerMachineSmall"
    );
    const DiggerMachineLargeFactory = await ethers.getContractFactory(
      "DiggerMachineLarge"
    );
    const DiggerMachineCaterpillarFactory = await ethers.getContractFactory(
      "DiggerMachineCaterpillar"
    );

    const [owner, addr1, addr2] = await ethers.getSigners();

    const Marketplace = await MarketplaceFactory.deploy();
    const marketplaceAddress = Marketplace.address;

    const DiggerMachineSmallToken = await DiggerMachineSmallFactory.deploy(marketplaceAddress);
    const diggerMachineSmallAddress = DiggerMachineSmallToken.address;

    const DiggerMachineLargeToken = await DiggerMachineLargeFactory.deploy(marketplaceAddress);
    const diggerMachineLargeAddress = DiggerMachineLargeToken.address;

    const DiggerMachineCaterpillarToken = await DiggerMachineCaterpillarFactory.deploy(marketplaceAddress);
    const diggerMachineCaterpillarAddress = DiggerMachineCaterpillarToken.address;

    await Marketplace.deployed();
    await DiggerMachineSmallToken.deployed();
    await DiggerMachineLargeToken.deployed();
    await DiggerMachineCaterpillarToken.deployed();

    return {
      Marketplace,
      marketplaceAddress,
      DiggerMachineSmallToken,
      diggerMachineSmallAddress,
      DiggerMachineLargeToken,
      diggerMachineLargeAddress,
      DiggerMachineCaterpillarToken,
      diggerMachineCaterpillarAddress,
      owner,
      addr1,
      addr2,
    };
  }

  context("initialisation", function() {
    it("Should mint 2 of each digger machine NFTs and the owner should be the address that deployed the contracts", async () => {
      const {
        DiggerMachineSmallToken,
        DiggerMachineLargeToken,
        DiggerMachineCaterpillarToken,
        owner,
      } = await loadFixture(deployTokenFixture);
  
      await DiggerMachineSmallToken.mintToken("www.token1.com");
      await DiggerMachineSmallToken.mintToken("www.token2.com");
      const smallSupply = await DiggerMachineSmallToken.totalSupply();
      expect(smallSupply).to.equal(2);
  
      expect(await DiggerMachineSmallToken.balanceOf(owner.address)).to.equal(2);
      for (var i = 1; i <= smallSupply; i++) {
        expect(await DiggerMachineSmallToken.getOwner(i)).to.equal(owner.address);
      }
  
      await DiggerMachineLargeToken.mintToken("www.token1.com");
      await DiggerMachineLargeToken.mintToken("www.token2.com");
      const largeSupply = await DiggerMachineLargeToken.totalSupply();
      expect(largeSupply).to.equal(2);
  
      expect(await DiggerMachineLargeToken.balanceOf(owner.address)).to.equal(2);
      for (var i = 1; i <= largeSupply; i++) {
        expect(await DiggerMachineLargeToken.getOwner(i)).to.equal(owner.address);
      }
  
      await DiggerMachineCaterpillarToken.mintToken("www.token1.com");
      await DiggerMachineCaterpillarToken.mintToken("www.token2.com");
      const caterpillarSupply = await DiggerMachineCaterpillarToken.totalSupply();
      expect(caterpillarSupply).to.equal(2);
  
      expect(await DiggerMachineCaterpillarToken.balanceOf(owner.address)).to.equal(2);
      for (var i = 1; i <= caterpillarSupply; i++) {
        expect(await DiggerMachineCaterpillarToken.getOwner(i)).to.equal(owner.address);
      }
    });

    it("Should generate an empty marketplace and the owner should be the address that deployed the marketplace", async () => {
      const { Marketplace, owner } = await loadFixture(deployTokenFixture);

      const marketplaceItems = await Marketplace.getAllTokens();
      expect(marketplaceItems.length).to.equal(0);
      expect(await Marketplace.getMarketplaceOwner()).to.equal(owner.address);
    });
  })

  context("listing", function() {
    beforeEach(async function() {
      const {
        DiggerMachineSmallToken,
        DiggerMachineLargeToken,
        owner,
      } = await loadFixture(deployTokenFixture);

      await DiggerMachineSmallToken.mintToken("www.token1.com");
      await DiggerMachineLargeToken.mintToken("www.token1.com");
    })

    it("Should not list token if not minted", async () => {
      const {
        Marketplace,
        diggerMachineSmallAddress,
        diggerMachineLargeAddress,
        owner,
      } = await loadFixture(deployTokenFixture);

      expect(Marketplace.createMarketItem(diggerMachineSmallAddress, 2, ethers.utils.parseUnits('1', 'ether'))).to.be.reverted;
      expect(Marketplace.createMarketItem(diggerMachineLargeAddress, 2, ethers.utils.parseUnits('1', 'ether'))).to.be.reverted;
    });

    it("Should list correcty the 2 minted NFTs");
  })



  // it("Sould mint 10 NFT and add them to listed items", async function () {
  //   const { Marketplace, DiggerMachineSmallToken, DiggerMachineLargeToken } = await loadFixture(deployTokenFixture);

  //   let dmlTokenId = await DiggerMachineLargeToken.getTokenID();
  //   expect(dmlTokenId).to.equal(1)

  //   for (var i = 1; i < 11; i+=1) {
  //     await dmlNFT.mintToken("www.token.com");
  //     await Marketplace.createMarketItem(dmLargeAddress, i, sellingPrice, {value: listingPrice});
  //     let owner = await dmlNFT._ownerOf(i);
  //     console.log(owner)
  //   }

  //   const tokensListedReadyToBeSold = await Marketplace.fetchAllListedNFTsNotSold();
  //   expect(tokensListedReadyToBeSold.length).to.equal(10);

  //   tokensListedReadyToBeSold.forEach(nft => {
  //     expect(nft.owner).to.equal('0x0000000000000000000000000000000000000000');
  //   });
  // })

  // it("Should not be able to mint a Digger Machine Small NFT when number reaches max limit", async function () {
  //   let dmsTokenId = await dmsNFT.getTokenID();
  //   expect(dmsTokenId).to.equal(1);
  //   for (var i = 1; i <= 40; i+=1) {
  //     await dmsNFT.mintToken("www.tokensmall.com");
  //     await marketplace.createMarketItem(dmSmallAddress, i, 0, {value: listingPrice});
  //   }
  //   const tokensListedReadyToBeSold = await marketplace.fetchAllListedNFTsNotSold();
  //   expect(tokensListedReadyToBeSold.length).to.equal(40);

  //   dmsNFT.mintToken("www.tokensmall.com");
  //   expect(dmsNFT.mintToken("www.tokensmall.com")).to.be.revertedWith("All the small Digger machines have been created");
  // })

  // it("Sould return only DMS NFT when calling fetchNFTsFromContractAddress", async function() {
  //     await dmlNFT.mintToken("www.token.com1");
  //     await marketplace.createMarketItem(dmLargeAddress, 1, sellingPrice, {value: listingPrice});

  //     await dmsNFT.mintToken("www.token.com2");
  //     await marketplace.createMarketItem(dmSmallAddress, 1, sellingPrice, {value: listingPrice});

  //     await dmlNFT.mintToken("www.token.com3");
  //     await marketplace.createMarketItem(dmLargeAddress, 2, sellingPrice, {value: listingPrice});
  //     await dmlNFT.mintToken("www.token.com4");
  //     await marketplace.createMarketItem(dmLargeAddress, 3, sellingPrice, {value: listingPrice});

  //     await dmsNFT.mintToken("www.token.com5");
  //     await marketplace.createMarketItem(dmSmallAddress, 2, sellingPrice, {value: listingPrice});

  //     let dmsTokenId = await dmsNFT.getTokenID();
  //     let dmlTokenId = await dmlNFT.getTokenID();
  //     expect(dmsTokenId).to.equal(3);
  //     expect(dmlTokenId).to.equal(4);

  //     let dmsItems = await marketplace.fetchNFTsFromContractAddress(dmSmallAddress);
  //     let numberOfItemsReturned = dmsItems.length;
  //     console.log(dmsItems)
  //     expect(numberOfItemsReturned).to.equal(2);
  // })
});
