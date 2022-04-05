//SPDX-License-Identifier: MIT
// interface are places/objects where you can put down all the functions that you need to call on your contract. write down the defitions for the functions you need. it includes all the functions signatures/definitions.
// we using the interface because we dont want to use all the functions on the whitelist contract
// we only want to use the function that tells us whenener the given  address is on the whitelist or not
// this save gas since the more the length of the smart contract the more gas we have to pay
// an interface helps us save more gas since we only pay for the things we actually using 

pragma solidity ^0.8.4;

interface IWhitelist {
    // this takes in an address and return us a boolean.
    function whitelistedAddresses(address) external view returns (bool);
}
