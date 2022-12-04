# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# iExec dOracles
Both RevealEscrow  and Reveal smart contracts have their state fed by 2 respective iExec dOracles. 
Check out this documentation to find out more about iExec dOracles [https://docs.iex.ec/use-cases/iexec-doracle](https://docs.iex.ec/use-cases/iexec-doracle)

and this smart contract as an example: 
[https://github.com/iExecBlockchainComputing/iexec-doracle/blob/bb4c04dc77c822d16d7ca8baed99f5626e44d7be/contracts/example/PriceOracle.sol](https://github.com/iExecBlockchainComputing/iexec-doracle/blob/bb4c04dc77c822d16d7ca8baed99f5626e44d7be/contracts/example/PriceOracle.sol)


# NFTs 

| Name                         | Description | Supply   | Price  |   |
|------------------------------|-------------|--------- |--------|---|
| DiggerMachineSmall           | 5 x 5 pixels digger    | Infinite (one for each player) | Price1 |   |
| DiggerMachineLarge           | 20 x 20 pixels digger  | 50,000 |  |   |
| DiggerMachineCaterpilar      | 50 x 50 pixels         | 20,000 |     |   |
| DistanceFinder               | Indicate distance between the last targetted area and the nearest treasure (in pixels) | 5,000|        |   |
| Laser                        | Highlights where other players have already digged             | 1,000        | 50 |   |
| Magnet                       | Indicates the quandrant where the biggest treasure is located            |         |        |   |
| Radar                        | Indicates tbe quadrant where the nearest treasur is located            |         |        |   |
| MultiDig                     | Allow digging in 5 locations simultanisouly. You only pay 1 land access instead of paying 5 times            |         |        |   |


# NFT Marketplace smart contracts

## Marketplace.sol


# Game engine smart contracts

## RevealEscrow.sol
is Ownable, IexecDoracle, Payable

This contract will interact with the mapRegistration Dapp as it will receive the result of the map registration. 
The map registration process handled by the dApp will ensure that the amount put in escrow matches the total value  of hidden bounties

This smart contract is used to register maps, keep the associated funds in escrow and make payments and allocate payment to each player after an attemps to discover a hidden bounty. 
The contract will hold the proof of each attempt and execution 



*Structures*

    enum mapStatus
            pending_validation
            published
            removed

    userMap
        owner               0x
        datasetId           0x
        publicMapUri        uri
        publicMapHash       
        originalAmount      uint
        availableAmount     uint
        attempts            uint


    mapping userMaps list of userMaps

    digResult
        oracleCallID        bytes32
        owner               0x
        proof               encrypted proof of win or loss 
                             {  attempt:[{"x": 123, "y": 324}, {"x": 345, "y": 643}], 
                                "nftsOwned":["0x123123", "0x435345"],   
                                "hits": [{"x": 143, "y": 300, "amount":12}, {"x": 345, "y": 653, "amount":60}], 
                                "wonAmount": 72 }


event

    mapStatusChanged _oracleCallID, owner, datasetid, isValid, computedValue, status


Methods

function updateEnv(
	  address _authorizedApp
	, address _authorizedDataset
	, address _authorizedWorkerpool
	, bytes32 _requiredtag
	, uint256 _requiredtrust
	)
	public onlyOwner
	{
		_iexecDoracleUpdateSettings(_authorizedApp, _authorizedDataset, _authorizedWorkerpool, _requiredtag, _requiredtrust);
	}


registerMap payable
    in params : 
        _datasetId           0x
        _publicMapUri        uri
        _publicMapHash       

    action :
        if there is already a userMap in the userMaps list with the same datasetid
                return error , item already exists

        if the dataset is not owned by the sender
                return error, you can't register a map that you don't own

        create a new userMap and set the value as: 
            owner               sender
            datasetId           _datasetid
            publicMapUri        _publicMapUri
            publicMapHash       _publicMapHash
            originalAmount      value send to the method
            availableAmount     value send to the method
            attempts            0

        add the user map to userMaps 

function decodeResults(bytes memory results)

public pure returns(uint256, string memory, uint256)
	{ return abi.decode(results, (address, address, uint256, uint256)); }

function processResult(bytes32 _oracleCallID)
	public
	{
		address       owner;
        address       datasetid
		uint256       isValid;
        uint256       computedValue;

		// Parse results
		(owner, datasetid, isValid, computedValue) = decodeResults(_iexecDoracleGetVerifiedResult(_oracleCallID));

        if (isValid == 1)
        {
            set the mapStatus to published
        }
        
        emit mapStatusChanged(_oracleCallID, owner, datasetid, isValid, computedValue, status);

	}


## Reveal.sol 

address escrow

constructor ()
    create the escrow contract 

event

    attempt _oracleCallID, 
            address owner, 
            address datasetid, 
            address player, 
            string proof, 
            uint wonvalue

function updateEnv(
	  address _authorizedApp
	, address _authorizedDataset
	, address _authorizedWorkerpool
	, bytes32 _requiredtag
	, uint256 _requiredtrust
	)
	public onlyOwner
	{
		_iexecDoracleUpdateSettings(_authorizedApp, _authorizedDataset, _authorizedWorkerpool, _requiredtag, _requiredtrust);
	}



registerMap payable
    in params : 
        _datasetId           0x
        _publicMapUri        uri
        _publicMapHash       

    action :
        if there is already a userMap in the userMaps list with the same datasetid
                return error , item already exists

        if the dataset is not owned by the sender
                return error, you can't register a map that you don't own

        create a new userMap and set the value as: 
            owner               sender
            datasetId           _datasetid
            publicMapUri        _publicMapUri
            publicMapHash       _publicMapHash
            originalAmount      value send to the method
            availableAmount     value send to the method
            attempts            0

        add the user map to userMaps 

function decodeResults(bytes memory results)

public pure returns(uint256, string memory, uint256)
	{ return abi.decode(results, (uint256, string, uint256)); }

function processResult(bytes32 _oracleCallID)
	public
	{
		address       player;
        address       datasetid      
		string memory _proof;
		uint256       value;

		// Parse results
		(player, _proof, value) = decodeResults(_iexecDoracleGetVerifiedResult(_oracleCallID));

		// Process results
		bytes32 proof = keccak256(bytes(_proof));

        if (value >0)
        {
            SEND value to player
            reduce the amount for the associated userMap 
        }
        
        emit attempt(_oracleCallID, owner, datasetid, player, proof, value);

	}