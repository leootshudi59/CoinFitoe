// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@iexec/doracle/contracts";


contract RevealEscrow is IexecDoracle, Ownable {
    enum mapStatus {
        PENDING_VALIDATION,
        PUBLISHED,
        REMOVED
    }

    using Counters for Counters.Counter;
    Counters.Counter private _numberOfMaps;

    // Data storage
    struct Map {
        address mapDatasetId;
        address mapOwner;
        string publicMapURI;
        string publicMapHash;
        uint256 originalAmount;
        uint256 availableAmount;
        uint256 attempts;
    }

    struct DigResult {
        bytes32 oracleCallID;
        address owner;
        string proof;
    }
    
    mapping(uint => Map) maps;


    event MapStatusChanged(bytes32 indexed oracleCallID, address owner, address datasetID, bool isValid, uint computedValue, mapStatus); // uint for computedvalue ?

    //mapping(address => Coordinates) coordinates;

    function updateEnv(
        address _authorizedApp,
        address _authorizedDataset,
        address _authorizedWorkerpool,
        bytes32 _requiredtag,
        uint256 _requiredtrus
    ) public onlyOwner {
        _iexecDoracleUpdateSettings(_authorizedApp, _authorizedDataset, _authorizedWorkerpool, _requiredtag, _requiredtrust);
    }

    function registerMap(
        address _datasetId,
        string _publicMapUri,
        string _publicHashMap
    ) public payable {
        _requireMapNotAlreadyExisting(_datasetId);
        _requireDatasetOwnedByTheSender(_datasetId, msg.sender);
        
        Map userMap = new UserMap(
            _datasetId,
            msg.sender,
            _publicMapUri,
            _publicHashMap,
            msg.value,
            msg.value,
            0
        );
        _numberOfMaps.increment();
        maps[_numberOfMaps.current()] = userMap;
    }



    // Requires
    function _requireMapNotAlreadyExisting(address _datasetId) internal view virtual {
        bool mapExists = false;
        for (uint i = 0; i < _numberOfMaps; i++) {
            if (maps[i].mapDatasetId == _datasetId) { mapExists = true; }
        }
        require(mapExists == false, "The map already exists");
    }

    function _requireDatasetOwnedByTheSender(address _datasetId, address _sender) {
        // require(_datasetId.owner != _sender, "You can't register a map that you don't own")
    }
}