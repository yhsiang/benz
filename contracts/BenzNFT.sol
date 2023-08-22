// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract BenzNFT is ERC721URIStorage {
    uint public startDate;
    uint public endDate;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => string) private _minters;
    string[] private _tokenURIs;

    constructor(uint256 _startDate, uint256 _endDate, string[] memory tokenURIs) ERC721("BenzNFT", "NFT") {
        startDate = _startDate;
        endDate = _endDate;
        _tokenURIs = tokenURIs;
    }

    function mintNFT() public returns (uint256) {
        address from = msg.sender;
        // Mint only valid certain duration (example between 7 Jan to 14 Jan 2023)
        // Mint only once for each wallet and Receipt (refer to 3.i)
        // The receipt will have to be store in smart contract state
        // Only able to mint 5 NFT
        // The NFT should have metadata (name, description, image)
        require(block.timestamp >= startDate && block.timestamp <= endDate, "it's not the right time to mint");
        require(isMinter(from), "you can not mint twice");
        require(_tokenIds._value < 5, "only can mint 5 NFTs");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(from, newItemId);
        _setTokenURI(newItemId, _tokenURIs[newItemId-1]);

        _minters[from] = _tokenURIs[newItemId-1];

        return newItemId;
    }

    function isMinter(address minter) public view returns (bool) {
        if(bytes(_minters[minter]).length>0) {
            return false;
        }
        else{
            return true;
        }
    }

    function getReceipt() public view returns (string memory) {
        return _minters[msg.sender];
    }

    function queryReceipt(address from) public view returns (string memory) {
        return _minters[from];
    }


}
