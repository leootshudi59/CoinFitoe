const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTs", () => {
  let sellingPrice;

  async function deployTokenFixture() {
    const StringUtilsFactory = await ethers.getContractFactory(
      "StringUtils"
    )
    const StringUtils = await StringUtilsFactory.deploy();
    const stringUtilsAddress = StringUtils.address;

    const MarketplaceFactory = await ethers.getContractFactory(
      "Marketplace", {
        libraries: {
          StringUtils: stringUtilsAddress
        }
      }
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

    })

    it("Should not list token if not minted", async () => {
      const {
        Marketplace,
        DiggerMachineSmallToken,
        diggerMachineSmallAddress,
        DiggerMachineLargeToken,
        diggerMachineLargeAddress,
        owner,
      } = await loadFixture(deployTokenFixture);
      await DiggerMachineSmallToken.mintToken("www.token1.com");
      await DiggerMachineLargeToken.mintToken("www.token1.com");

      expect(Marketplace.createMarketItem(diggerMachineSmallAddress, 2, ethers.utils.parseUnits('1', 'ether'))).to.be.reverted;
      expect(Marketplace.createMarketItem(diggerMachineLargeAddress, 2, ethers.utils.parseUnits('1', 'ether'))).to.be.reverted;
    });

    it("Should list correcty the 2 minted NFTs", async () => {
      const {
        Marketplace,
        DiggerMachineSmallToken,
        diggerMachineSmallAddress,
        DiggerMachineLargeToken,
        diggerMachineLargeAddress,
        owner,
      } = await loadFixture(deployTokenFixture);

      await DiggerMachineSmallToken.mintToken("www.token1.com");
      await DiggerMachineLargeToken.mintToken("www.token1.com");

      await Marketplace.createMarketItem(diggerMachineSmallAddress, 1, ethers.utils.parseUnits('1', 'ether'));
      await Marketplace.createMarketItem(diggerMachineLargeAddress, 1, ethers.utils.parseUnits('1', 'ether'));
      
      const allTokens = await Marketplace.getAllTokens();
      expect(allTokens.length).to.equal(2);
    });
  })

  context("selling", function() {
    it("Should not deliver more than 1 Digger machine small", async () => {
      const {
        Marketplace,
        DiggerMachineSmallToken,
        diggerMachineSmallAddress,
        DiggerMachineLargeToken,
        diggerMachineLargeAddress,
        owner,
        addr1
      } = await loadFixture(deployTokenFixture);

      await DiggerMachineSmallToken.mintToken("www.token1.com");
      await DiggerMachineSmallToken.mintToken("www.token2.com");
      await DiggerMachineSmallToken.mintToken("www.token3.com");
      await Marketplace.deliverDiggerMachineSmallTo(diggerMachineSmallAddress, 1, addr1.address)
      expect (Marketplace.deliverDiggerMachineSmallTo(diggerMachineSmallAddress, 2, addr1.address)).to.be.revertedWith("Already has a DMS")
    })

    it("Should revert when trying to sell/buy a Digger machine small", async () => {
      const {
        Marketplace,
        DiggerMachineSmallToken,
        diggerMachineSmallAddress,
        addr1
      } = await loadFixture(deployTokenFixture);

      await DiggerMachineSmallToken.mintToken("www.token3.com");
      await Marketplace.deliverDiggerMachineSmallTo(diggerMachineSmallAddress, 1, addr1.address);
      
      expect(Marketplace.connect(addr1).buyToken(diggerMachineSmallAddress, 1)).to.be.revertedWith("This item cannot be sold");
    })

    it("Should set status sold to true and change owner on marketplace when item is sold", async () => {
      const {
        Marketplace,
        DiggerMachineSmallToken,
        diggerMachineSmallAddress,
        DiggerMachineLargeToken,
        diggerMachineLargeAddress,
        owner,
        addr1
      } = await loadFixture(deployTokenFixture);
      
      await DiggerMachineSmallToken.mintToken("www.token1.com");
      await DiggerMachineLargeToken.mintToken("www.token1.com");
      await Marketplace.createMarketItem(diggerMachineSmallAddress, 1, ethers.utils.parseUnits('1', 'ether'));
      await Marketplace.createMarketItem(diggerMachineLargeAddress, 1, ethers.utils.parseUnits('1', 'ether'));

      const buyersInitialBalance = await addr1.getBalance();
      const ownersInitialBalance = await owner.getBalance();
    
      expect(buyersInitialBalance).to.equal(ethers.utils.parseUnits('10000', 'ether'))
      await Marketplace.connect(addr1).buyToken(diggerMachineLargeAddress, 1, {value: ethers.utils.parseUnits('1', 'ether')});
      expect(await Marketplace.getNumberOfSoldItems()).to.equal(1);

      const nftsFromSoldNftContract = await Marketplace.fetchNFTsFromContractAddress(diggerMachineLargeAddress);
      expect(nftsFromSoldNftContract[0].sold).to.equal(true);
      expect(nftsFromSoldNftContract[0].owner).to.equal(addr1.address)
      expect(await DiggerMachineLargeToken.getOwner(1)).to.equal(addr1.address)
      
      const buyersNewBalance = await addr1.getBalance();
      expect(buyersNewBalance).to.be.below(ethers.utils.parseUnits('9999', 'ether'))
      const ownersNewBalance = await owner.getBalance();
      expect(ownersNewBalance).to.be.above(ownersInitialBalance);
    })
  })


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

});