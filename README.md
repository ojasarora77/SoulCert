# SoulCert
# A decentralized platform for issuing and verifying university certificates using Soulbound Tokens (SBTs) and AI verification.
## Overview
Traditional certificate systems face challenges with verification, forgery, and permanent record-keeping. This project offers a decentralized solution where academic credentials are stored as Soulbound Tokens - non-transferable NFTs that are permanently bound to a student's blockchain address.

## Okay but why SBTs?
Unlike regular NFTs, Soulbound Tokens cannot be transferred. This is crucial for academic credentials because:

A degree/certificate belongs uniquely to one individual
Academic achievements should not be transferable or tradeable
Ensures authenticity and prevents credential trading
Features

## AI-Powered Verification: Integrated AI agent validates certificates before minting
Decentralized Storage: Certificates stored permanently on Base Sepolia network
User-Friendly Interface: Simple upload process for certificates
Automated Minting: AI agent handles the entire verification and minting process
5.Real-Time Verification: Instant verification of certificate authenticity
extra features: the chatbot can transfer eth from one wallet to another, and confirm the wallet address, see how much value is in the wallet and well it is a chatbot, you can chat with it if you're lonely ofc.
Technical Stack

## Smart Contracts: Solidity (OpenZeppelin)
Frontend: Flask & JavaScript
AI Integration: CDP AgentKit
Blockchain: Base Sepolia Network
Token Standard: ERC721 with Soulbound modification (ERC5192)

## Implementation:
the student uploads his document(as a pdf or jpg) on the Dapp and provides their own wallet address which they wants ownership of the certificate, an AI agent integrated with the Dapp does all that for them, mints the SBTs and deploys it on sepolia testnet

## Skills
Python
Solidity
Node.js
TypeScript
React.js

## How to run:
Prerequisites

Python 3.11+
Node.js 18+
MetaMask wallet
Base Sepolia testnet configured in MetaMask

Environment Setup

1. Clone the repository

2. Install Python dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

3. Set up environment variables
Create a .env file in the project root:
CDP_API_KEY_NAME=your_cdp_key_name
CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key
CONTRACT_ADDRESS=0xEC1436e5C911ae8a53066DF5E1CC79A9d8F8A789

4. Start the server
python app.py

The server will start at http://localhost:5000
