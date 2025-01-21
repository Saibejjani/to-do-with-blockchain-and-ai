import React, { createContext, useContext, useState, useEffect } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/contractConfig";
import { SUPPORTED_NETWORKS, DEFAULT_NETWORK } from "../contracts/networks";
import { useAuth } from "./AuthContext";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { user } = useAuth();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetWeb3State = () => {
    setWeb3(null);
    setContract(null);
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      resetWeb3State();
      setError("Please connect your wallet");
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = async (newChainId) => {
    console.log(newChainId);
    const chainIdDecimal = parseInt(newChainId, 16);
    console.log(chainIdDecimal);
    setChainId(chainIdDecimal);

    if (!SUPPORTED_NETWORKS[chainIdDecimal]) {
      setError(`Please switch to ${SUPPORTED_NETWORKS[DEFAULT_NETWORK].name}`);
      resetWeb3State();
    } else {
      setError(null);
      // Reinitialize Web3 with new chain
      initializeWeb3();
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    console.log(SUPPORTED_NETWORKS[DEFAULT_NETWORK]);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SUPPORTED_NETWORKS[DEFAULT_NETWORK].chainId }],
      });
      setChainId(SUPPORTED_NETWORKS[DEFAULT_NETWORK].chainId);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SUPPORTED_NETWORKS[DEFAULT_NETWORK]],
          });
        } catch (addError) {
          setError("Failed to add network to MetaMask");
        }
      }
    }
  };

  const connectWallet = async () => {
    if (!user) {
      setError("Please login first");
      return;
    }

    if (!window.ethereum) {
      setError("Please install MetaMask");
      return;
    }

    setLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const chainIdDecimal = parseInt(chainIdHex, 16);
      setChainId(chainIdDecimal);
      if (!SUPPORTED_NETWORKS[chainIdDecimal]) {
        await switchNetwork();
      }

      await initializeWeb3();
      setAccount(accounts[0]);
      setError(null);
    } catch (err) {
      setError("Failed to connect wallet");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeWeb3 = async () => {
    if (!window.ethereum) return;

    const web3Instance = new Web3(window.ethereum);
    const contractInstance = new web3Instance.eth.Contract(
      CONTRACT_ABI,
      CONTRACT_ADDRESS,
    );

    setWeb3(web3Instance);
    setContract(contractInstance);
  };

  useEffect(() => {
    if (!user) {
      resetWeb3State();
      return;
    }

    if (window.ethereum) {
      // Setup event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [user]);

  return (
    <Web3Context.Provider
      value={{
        web3,
        contract,
        account,
        chainId,
        loading,
        error,
        connectWallet,
        switchNetwork,
        isNetworkSupported: chainId
          ? Boolean(SUPPORTED_NETWORKS[chainId])
          : false,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
