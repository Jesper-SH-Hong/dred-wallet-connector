import { useState, useEffect } from "react";

const CHAIN_LIST_URL = "https://chainid.network/chains.json";

export function useChain(chainId) {
  const [chains, setChains] = useState([]);
  const [chainName, setChainName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchChains() {
      setLoading(true);
      try {
        const res = await fetch(CHAIN_LIST_URL);
        const data = await res.json();
        if (!ignore) setChains(data);
      } catch {
        if (!ignore) setChains([]);
      }
      setLoading(false);
    }
    fetchChains();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!chainId || !chains.length) {
      setChainName("");
      return;
    }
    const normalized = chainId.startsWith("0x")
      ? parseInt(chainId, 16)
      : Number(chainId);
    const found = chains.find((c) => c.chainId === normalized);
    setChainName(found ? found.name : chainId);
  }, [chainId, chains]);

  return {
    chainId,
    chainName,
    allChains: chains,
    loading,
  };
}
