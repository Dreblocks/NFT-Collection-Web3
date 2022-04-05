import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useEffect, useRef, useState } from "react";
import {providers, Contract, utils, ethers} from "ethers";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "../constants";

// all of these below are state variables
export default function Home() {
  // check if the current wallet is the actual owner
  const [isOwner, setIsOwner] = useState(false);
//check if the presale has started 
  const[presaleStarted, setPresaleStarted] = useState(false);
//check if the presale ended
  const[presaleEnded, setPresaleEnded] = useState(false);
// check if our wallet or the user wallet is connected which starts of with a state variable with the value of false
  const [walletConnected, setWalletConnected] = useState(false);
//keeps track of the token minted
  const [numTokensMinted, setNumTokensMinted] = useState("");
// shows the loading state of the page
  const [loading, setLoading] = useState(false);
//we declare a reference to the web3modal instance, used to connect to metamask when the page loads, which persists as long as the page is open
  const web3ModalRef = useRef();



  //function to get the numbers of token minted
  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

    const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );
//function from the contract tokenids
    const numTokenIds = await nftContract.tokenIds();
    setNumTokensMinted(numTokenIds.toString());
     // we store the uin256 as a string since we show it to the frontend
    } catch (err) {
      console.error(err);
      
    }

  };

// function to public mint
  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      
      const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );
      // mint is the function from our contract
      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();

      window.alert("Congrats, you have minted a NFT!")
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };


//function to presale mint
  const presaleMint = async () => {
    setLoading(true);
    try {
      // we need the signer since we sending a transaction
      const signer = await getProviderOrSigner(true);
      
      const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );
      //we need to pass an ether value using parse ether
      // we create an object and give it a value
      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
// give the user a pop up 
      window.alert("Congrats, you have minted a NFT!")
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

//helper function to getowner
   const getOwner = async () => { 
  try {
    // we get a signer because we need to compare it against the user address
    const signer = await getProviderOrSigner(true);

    const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );
    // this is the address of the owner of the contract
    const owner = await nftContract.owner();
    // this will be the address of the user who is currently connected
    const userAddress = await signer.getAddress();

     // if the address of the owner is the same as the currently connected user
     // we set the owner connected to true which means the owner is connected to our website
    if (owner.toLowerCase() === userAddress.toLowerCase()) {
      setIsOwner(true);
    }
  } catch (err) {
    console.error(err);
  }
};


//function to start the presale onlyowner can call it
    const startPresale = async () => {
    try {
      setLoading(true);
      // we need a signer since we changing the blockchain state
    const signer = await getProviderOrSigner(true);

    const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      signer
    );
// we shoot off our transaction, (startPresale) is the name of our function
    const txn = await nftContract.startPresale();
// we wait for our transaction to finish
    await txn.wait();

    setPresaleStarted(true);
  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};


//function to check if the presale started
    const checkIfPresaleStarted = async () => {
  try {
// get provider since we reading from the blockchain
    const provider = await getProviderOrSigner();
// we get a instance of the nft contract  
// needing the abi and the contract address  
    const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    // we check to see if the presale already started
    // we call a function on our contract(presaleStarted)
    // we can read public variables as function in solidity 
    //just like calling functions with no arguments
    const isPresaleStarted = await nftContract.presaleStarted();
    setPresaleStarted(isPresaleStarted);

    return isPresaleStarted;
  } catch (err) {
    console.error(err);
    return false;
  }

};

//function to check if the presale has ended
  const checkIfPresaleEnded = async () => {
  try {

    const provider = await getProviderOrSigner();

    const nftContract = new Contract (
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    const presaleEndTime = await nftContract.presaleEnded();
    // this will return a bif number since uint256(presaleEnded) is a big number
    const currentTimeInSeconds = Date.now() / 1000;
    // this will return a timestamp in seconds
    // we checking if the presale end time is less than the presale current time 
    const hasPresaleEnded = presaleEndTime.lt(
      Math.floor(currentTimeInSeconds)
    );

    setPresaleEnded(hasPresaleEnded);
  } catch (err) {
    console.error(err);
  }
};


// function to connect your wallet to the website
  const connectWallet = async () => {
    try {
    await getProviderOrSigner();
    //we update wallet connected to be true
    setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }; 

  // A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
  // A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
  // needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
  // request signatures from the user using Signer functions.

  const getProviderOrSigner = async (needSigner = false) => {
    // we gain access to the provider user from metamask, by accessing the current value and calling connect
    //this line will pop open metamask and ask user to connect their wallet to metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    // if the user is not connected to rinkeby, tell the user to connect to rinkeby
    const {chainId} = await web3Provider.getNetwork();
      if (chainId !== 4) {
        window.alert("please switch to rinkeby");
        throw new error("incorrect network");
      }
    // if need signer is true we will get the signer from the web3provider
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
  
  };
       
  const onPageLoad = async () => {
    
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    // we check if the presale has started yet, 
    if (presaleStarted) {
      // we also check if presale ended since we need
      //this sate value for our buttons
      await checkIfPresaleEnded();
    }

    // we fetch the number of tokens minted
    await getNumMintedTokens();
// we track in real time the number of minted nfts each 5 sec
    setInterval(async () => {
    // calls numMinted which will update the state value
      await getNumMintedTokens();
      // value is in milliseconds so 5 times 1000 for 5 sec
    }, 5 * 1000);
// we track in real time the status of the presale each 5 sec
// interval are piece of code that run every amount of time 
    setInterval(async () => {
      // we check if it has ended assuming presale already started
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 *1000)
  };

 // the first time the website loads useffect will run
// useEffects are used to react to changes in state of the website
// it will attempt to connect the wallet and the state

  useEffect(() => {
    if (!walletConnected) {
      // we making a new web3modal instance
      web3ModalRef.current = new Web3Modal ({
        network: "rinkeby",
        providersOptions: {},
        disableInjectedProvider: false,
      });
    }
      onPageLoad();
  }, []);

// the buttons are the function that we wrote


  function renderBody() {
    if (!walletConnected) {
      return (  
        <button onClick={connectWallet} className={styles.button}>
          Connect your Wallet
        </button>
      );
    }

    if (loading) {
      return ( 
        <span className={styles.description}>Loading...</span>
      )
    }

    if (isOwner && !presaleStarted) {
      return (  
        <button onClick={startPresale} className={styles.button}>
          Start Presale
        </button>
      );
    }

    if (!presaleStarted) {
      return (  
        <div>
          <span className={styles.description}>
            Presale has not started yet, come back later to mint.
          </span>
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      return (  
        <div>
          <span className={styles.description}>
           Congrats, you are part of the presale!! If your address is whitelisted, you can mint a CryptoDev NFT 🚀.
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint
          </button>
        </div>
      );
    }

    if (presaleEnded) {
      return (  
         <div>
          <span className={styles.description}>
            Presale has ended. You are now able to be a part of the public Mint 😎.
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint
          </button>
         </div>
      );
    }
}


  return (
    <div>
      <Head>
        <title> Crypto Devs NFT</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs NFT 👻</h1>
          <div className={styles.description}>
            CryptoDevs NFT is a collection for developers in Web3 and Crypto ⚡
          </div>
          <div className={styles.description}>
            {numTokensMinted}/20 have been minted already!
          </div>
              
        {renderBody()} 
        </div>
        <img className={styles.image} src="/cryptodevs/0.svg/"/>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Andre Toure
      </footer>
    </div>
  );
}
