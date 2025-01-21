export const CONTRACT_ADDRESS = "0xc2B4516535A8dE18f207a672b5e381Cc82851437";
export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "taskHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "completer",
        type: "address",
      },
    ],
    name: "TaskCompleted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskHash",
        type: "bytes32",
      },
    ],
    name: "getTaskCompleter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskHash",
        type: "bytes32",
      },
    ],
    name: "isTaskCompleted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskHash",
        type: "bytes32",
      },
    ],
    name: "markTaskComplete",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "taskCompletions",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
