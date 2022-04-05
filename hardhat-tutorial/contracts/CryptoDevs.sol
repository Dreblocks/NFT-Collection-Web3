//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";


contract CryptoDevs is ERC721Enumerable, Ownable {

//baseURI is like the URL for a token ID, its a URI from where you can get the metadata for all the token ids if you attach a token ID
//it gives you the information for that token, all the metadata and properties
//
    string _baseTokenURI;

    IWhitelist whitelist;
//the constructor takes the address of the whitelistContract that was deployed, we gave the nft collection a name and a symbol
     
    bool public presaleStarted;

    uint256 public presaleEnded;

    uint256 public maxTokenIds = 20;

    uint256 public tokenIds;
// this will keep track of the number of tokensIds minted

// price of one nft
    uint256 public _price = 0.01 ether; 

    bool public _paused;
// this variable is used to pause a contract and going to need to modifier
    modifier onlyWhenNotPaused {
        require(!_paused, "Contract is paused");
        _;
    }

//
    constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
// in the code above we intialized an instance of the whitelistContract by wrapping the address of the whitelist contract in the interface   
// create an interface and gave it the address of my whitelist contract    
    }

// we only call this function when the presale started and when its gonna end
    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
        // we are using a timestamp since we want to end the presale in 5 minutes

    }

// this function is used for the addresses that have been whitelisted to mint an nft during the presale period
    function presaleMint() public payable onlyWhenNotPaused {
        // only when not paused the function will be executed
        require(presaleStarted && block.timestamp < presaleEnded, "Presale Ended");
// first we checking that the presale has started then that the 5 min has passed in order to mint 
         require(whitelist.whitelistedAddresses(msg.sender), "  You are not in the whitelist");    
         require(tokenIds < maxTokenIds, "Exceeded the limit");
         require(msg.value >= _price, "Ether amount is not correct");

         tokenIds += 1;
         // we increase it since we are going to mint an nft

// safemint is minting an nft to the sender, calling the mint function
         _safeMint(msg.sender, tokenIds);
//_safeMint is a safer version of the _mint function as it ensures that
// if the address being minted to is a contract, then it knows how to deal with ERC721 tokens
// If the address being minted to is not a contract, it works the same way as _mint

    }

// this will allow the user to mint one nft per transaction after presale ended
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet" );
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _price, "Ether amount is not correct");

        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);

    }

// we use override to be able to implent my own variables to the function
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
// this is used to paused the smart contract if there is any attack
//all the functions will be stopped
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }


// this function sends all ether in the contract to the owner of the contract
    function withdraw() public onlyOwner {
        address _owner = owner();
    // we are using the owner function from ownable.sol, the owner will be the deployer of the contract
        uint256 amount = address(this).balance;
    // to transfer the ether to the owner from the smart contract. bool check if the send was succesful
    //amount is the balance of the smart contract is going to be send to the owner
    // this is a solidity syntax to send money to an address
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");

    }




// this will enable the smart contract to receive ether
// msg.data must be empty
    receive() external payable {}
// this function is called when msg.data is not empty
    fallback() external payable{}

      

} 