const contracts = {
  // modifile here.
  97: [
    {
      chainId: "97",
      name: "bnbTestnet",
      contracts: {
        crw: {
          address: "0xD1e91A4Bf55111dD3725E46A64CDbE7a2cC97D8a",
          abi: [
            {
              inputs: [
                {
                  internalType: "string",
                  name: "data",
                  type: "string",
                },
              ],
              name: "add_item",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "addr",
                  type: "address",
                },
              ],
              name: "read_all",
              outputs: [
                {
                  components: [
                    {
                      internalType: "string",
                      name: "content",
                      type: "string",
                    },
                    {
                      internalType: "uint256",
                      name: "timestamp",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct CRW.DataItem[]",
                  name: "",
                  type: "tuple[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "addr",
                  type: "address",
                },
              ],
              name: "read_index",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "addr",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
              ],
              name: "read_item",
              outputs: [
                {
                  components: [
                    {
                      internalType: "string",
                      name: "content",
                      type: "string",
                    },
                    {
                      internalType: "uint256",
                      name: "timestamp",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct CRW.DataItem",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
