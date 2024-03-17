export const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "signer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "documentHash",
                "type": "bytes32"
            }
        ],
        "name": "DocumentSigned",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentHash",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "_signer2",
                "type": "address"
            }
        ],
        "name": "createDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "documents",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "signer1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "signer2",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "signedBySigner1",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "signedBySigner2",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentHash",
                "type": "bytes32"
            }
        ],
        "name": "isDocumentFullySigned",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentHash",
                "type": "bytes32"
            }
        ],
        "name": "signDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]