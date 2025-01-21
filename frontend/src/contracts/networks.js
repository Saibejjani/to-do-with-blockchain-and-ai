export const SUPPORTED_NETWORKS = {
  11155111: {
    name: "Sepolia Test Network",
    chainId: "0x" + Number(11155111).toString(16),
    rpcUrls: ["sepolia.infura.io"],
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  // Add other networks as needed
};

export const DEFAULT_NETWORK = 11155111;
