import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { switchToSKALE } from "@/lib/contracts";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isDemo, setIsDemo] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application.");
      return;
    }

    setConnecting(true);
    try {
      // Switch to SKALE network first
      await switchToSKALE();

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);

      const walletSigner = await browserProvider.getSigner();
      const walletAddress = await walletSigner.getAddress();
      const walletBalance = await browserProvider.getBalance(walletAddress);

      setIsDemo(false);
      setProvider(browserProvider);
      setSigner(walletSigner);
      setAddress(walletAddress);
      setBalance(ethers.formatEther(walletBalance));
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectDemo = useCallback(() => {
    setIsDemo(true);
    setAddress("0xDemo...Demo");
    setProvider(null);
    setSigner(null);
    setBalance("0");
  }, []);

  const connectReal = useCallback(() => {
    // Clear demo state, then initiate real connection
    setIsDemo(false);
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setBalance("0");
    // Trigger real connect after clearing
    setTimeout(() => {
      connect();
    }, 50);
  }, [connect]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setBalance("0");
    setIsDemo(false);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        // Re-connect with new account
        connect();
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [address, connect, disconnect]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return {
    address,
    shortAddress,
    provider,
    signer,
    balance,
    connecting,
    connect,
    connectDemo,
    connectReal,
    disconnect,
    isConnected: !!address,
    isDemo,
  };
}
