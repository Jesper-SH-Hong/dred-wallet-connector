import React, { useState, useEffect, useCallback } from "react";
import { useChain } from "./useChain";

// Transaction steps as constants to avoid typos
const TX_STEPS = {
  APPROVE: "Please approve transaction in your wallet",
  PENDING: "Waiting for on-chain confirmation...",
  CONFIRMED: "Transaction confirmed",
  TIMEOUT: "Transaction pending",
  FAILED: "Transaction failed",
};

const WalletConnector = () => {
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [txStep, setTxStep] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [walletError, setWalletError] = useState("");
  const { chainName, allChains, loading: chainLoading } = useChain(network);

  // Get explorer URL for current chain
  const getExplorerUrl = useCallback(() => {
    if (!network || !allChains.length) return null;

    // Convert hex chainId to decimal if needed
    const chainIdDecimal = network.startsWith("0x")
      ? parseInt(network, 16)
      : Number(network);

    const chainInfo = allChains.find(
      (chain) => chain.chainId === chainIdDecimal
    );
    return chainInfo?.explorers?.[0]?.url || null;
  }, [network, allChains]);

  // Connect wallet
  const connectWallet = async () => {
    setWalletError("");
    if (window.ethereum) {
      setLoading(true);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(accounts[0]);
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setNetwork(chainId);
        setTxStep(null);
      } catch (err) {
        setWalletError("Connection failed");
      }
      setLoading(false);
    } else {
      setWalletError("MetaMask not found");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null);
    setNetwork(null);
    setTxStep(null);
    setTxStatus("");
    setTxHash(null);
    setWalletError("");
  };

  // Detect network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId) => {
        setNetwork(chainId);
      };

      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnectWallet();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [address]);

  // Send 0 ETH transaction
  const sendTransaction = async () => {
    if (!window.ethereum || !address) return;

    setLoading(true);
    setTxHash(null);

    try {
      const tx = {
        from: address,
        to: address, // send to self for demo
        value: "0x0", // 0 ETH
      };

      // Set state to approval before sending transaction
      setTxStep("APPROVE");

      // Send transaction
      const hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      setTxHash(hash);
      setTxStep("PENDING");

      // Check for confirmation
      let confirmed = false;
      let attempts = 0;

      while (!confirmed && attempts < 30) {
        await new Promise((res) => setTimeout(res, 2000));

        try {
          const receipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [hash],
          });

          if (receipt && receipt.blockNumber) {
            confirmed = true;
            setTxStep("CONFIRMED");
            break;
          }
        } catch (error) {
          console.error("Error checking receipt:", error);
        }

        attempts++;
      }

      if (!confirmed) {
        setTxStep("TIMEOUT");
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setTxStep("FAILED");
    } finally {
      setLoading(false);
    }
  };

  // Render transaction status message
  const renderTxStatusMessage = () => {
    if (walletError)
      return <span className="text-red-400 font-medium">{walletError}</span>;
    if (!txStep) return null;

    let color = "text-blue-400";
    if (txStep === "APPROVE") color = "text-yellow-400";
    if (txStep === "FAILED") color = "text-red-400";

    if (txStep === "PENDING") {
      return (
        <div className={`flex items-center ${color} font-medium`}>
          <span className="inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></span>
          <span>{TX_STEPS[txStep] || txStatus}</span>
        </div>
      );
    }
    return (
      <span className={`${color} font-medium`}>
        {TX_STEPS[txStep] || txStatus}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="p-6 rounded-xl shadow-lg bg-white/5 w-full max-w-sm border border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
          Wallet Demo
        </h1>
        {address ? (
          <>
            <div className="mb-2 text-center">
              <span className="text-xs text-gray-400 block mb-1">
                Address: <span className="font-mono text-white">{address}</span>
              </span>
              <span className="text-xs text-gray-400">
                Network: {chainName || "Unknown"}
              </span>
              {getExplorerUrl() && (
                <span className="text-xs text-gray-400">
                  {" "}
                  |{" "}
                  <a
                    href={getExplorerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Explorer
                  </a>
                </span>
              )}
            </div>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mb-3 w-full font-semibold transition"
              onClick={disconnectWallet}
              disabled={
                loading ||
                txStep === TX_STEPS.PENDING ||
                txStep === TX_STEPS.APPROVE
              }
            >
              Disconnect
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold transition"
              onClick={sendTransaction}
              disabled={
                loading ||
                txStep === TX_STEPS.PENDING ||
                txStep === TX_STEPS.APPROVE
              }
            >
              Invoke Transaction (Send 0 ETH)
            </button>
          </>
        ) : (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold transition"
            onClick={connectWallet}
            disabled={loading}
          >
            Connect Wallet
          </button>
        )}
        <div className="mt-5 min-h-[32px] flex items-center justify-center">
          {renderTxStatusMessage()}
        </div>
      </div>
    </div>
  );
};

export default WalletConnector;
