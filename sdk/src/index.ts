/**
 * Luffa Agent Skills SDK
 * 
 * @example
 * ```typescript
 * import { LuffaClient, WalletAPI } from 'luffa-agent-skills';
 * 
 * const client = new LuffaClient({
 *   apiKey: process.env.LUFFA_API_KEY,
 *   secretKey: process.env.LUFFA_SECRET_KEY,
 * });
 * 
 * const wallet = new WalletAPI(client);
 * const balance = await wallet.getBalance('0xYourAddress');
 * console.log(`Portfolio value: $${balance.totalValueUSD}`);
 * ```
 */

export { LuffaClient, luffa } from './client.js';
export type { LuffaConfig, LuffaResponse } from './client.js';

export { WalletAPI, walletAPI } from './wallet.js';
export type { TokenBalance, WalletBalance, Transaction, TransferRequest } from './wallet.js';
