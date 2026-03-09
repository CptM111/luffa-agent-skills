# Luffa Wallet Skill

This skill provides AI agents with capabilities to interact with the Luffa Wallet, focusing on actions that a user would perform within their own wallet or a connected Mini Program (SuperBox app).

It complements the `luffa-service-account` skill, which handles server-to-server interactions.

## Core Concepts

- **Luffa Wallet**: A multi-chain Web3 wallet integrated into the Luffa app.
- **Mini Program (SuperBox)**: A lightweight app running inside Luffa. These apps can request actions from the Luffa Wallet, such as signing transactions or messages.
- **JSSDK**: The JavaScript SDK that Mini Programs use to communicate with the Luffa host app, including the wallet.

## Authentication & Execution

Actions in this skill are modeled after the Luffa JSSDK. They represent functions that an agent could call within a Mini Program environment. The agent acts on behalf of the user, and any action requiring a signature would prompt the user for confirmation on their device.

## Available Tools

These tools are conceptual and map to functions that would be available in the Luffa JSSDK for Mini Programs.

### Wallet Information

- **`wallet_get_address`**: Get the current user's connected wallet address for a specific chain.
    - **Input**: `{ "chain": "endless" | "ethereum" | "bsc" }`
    - **Output**: `{ "address": "0x..." }`

- **`wallet_get_balance`**: Get the balance of a specific token for the current user.
    - **Input**: `{ "chain": "endless", "token_symbol": "EDS" | "LUFFA" }`
    - **Output**: `{ "balance": "1234.56" }`

### Transactions

- **`wallet_request_transfer`**: Request the user to sign and send a token transfer.
    - **Input**: `{ "chain": "endless", "to": "0x...", "amount": "100", "token_symbol": "EDS" }`
    - **Output**: `{ "transaction_hash": "0x..." }`

- **`wallet_sign_message`**: Request the user to sign an arbitrary message (EIP-191).
    - **Input**: `{ "message": "Hello Luffa!" }`
    - **Output**: `{ "signature": "0x..." }`

- **`wallet_sign_typed_data`**: Request the user to sign structured data (EIP-712).
    - **Input**: `{ "domain": { ... }, "types": { ... }, "message": { ... } }`
    - **Output**: `{ "signature": "0x..." }`

### Cross-Skill Workflows

- **DEX Trading**: An agent can use `wallet_get_address` to identify the user, then use a separate `dex_aggregator` skill to find the best swap route. Finally, it would construct the transaction data and pass it to `wallet_request_transfer` (or a more specific `wallet_execute_transaction` function) for the user to sign.

- **Social Recovery**: An agent could guide a user through a social recovery process. It would use `wallet_sign_message` to have the user sign a recovery request, then use `luffa-messenger` to send the signed message to the user's designated guardians.

## Example: In-App Swap

This workflow shows how an agent within a DeFi Mini Program could help a user perform a swap.

1.  **Get User Address**: The agent calls `wallet_get_address` to know who is performing the swap.
2.  **Get Quote**: The agent calls an external DEX aggregator API (or a `dex_aggregator` skill) with the desired swap details (e.g., swap 100 EDS for USDT).
3.  **Build Transaction**: The aggregator returns the optimal transaction data (the `to` address of the router, and the `data` payload for the function call).
4.  **Request Signature**: The agent calls `wallet_request_transfer` with the `to` and `data` from the aggregator. The Luffa app would recognize this as a transaction request, display the details to the user (e.g., "Swap 100 EDS for ~99.5 USDT"), and prompt for their signature.
5.  **Confirm**: Once the user signs, the transaction is broadcast, and the agent receives the transaction hash.
