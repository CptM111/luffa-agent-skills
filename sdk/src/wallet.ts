/**
 * Luffa Wallet SDK Module
 * Corresponds to the luffa-wallet skill
 */

import { LuffaClient, luffa } from './client.js';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  valueUSD: string;
  network: string;
  contractAddress: string;
}

export interface WalletBalance {
  totalValueUSD: string;
  address: string;
  tokens: TokenBalance[];
}

export interface Transaction {
  txHash: string;
  type: 'send' | 'receive' | 'swap' | 'airdrop';
  from: string;
  to: string;
  amount: string;
  symbol: string;
  valueUSD: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  network: string;
}

export interface TransferRequest {
  from: string;
  to: string;
  amount: string;
  symbol: string;
  network: string;
  memo?: string;
}

export class WalletAPI {
  constructor(private client: LuffaClient = luffa) {}

  /** Get total portfolio value and token breakdown */
  async getBalance(address: string, network?: string): Promise<WalletBalance> {
    const params = new URLSearchParams({ address });
    if (network) params.set('network', network);
    const res = await this.client.get<WalletBalance>(`/wallet/balance?${params}`);
    return res.data;
  }

  /** Get transaction history */
  async getTransactions(
    address: string,
    options: { limit?: number; offset?: number; type?: string } = {},
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const params = new URLSearchParams({ address });
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.type) params.set('type', options.type);
    const res = await this.client.get<{ transactions: Transaction[]; total: number }>(
      `/wallet/transactions?${params}`,
    );
    return res.data;
  }

  /**
   * Initiate a token transfer.
   * IMPORTANT: Always confirm with the user before calling this method.
   */
  async transfer(request: TransferRequest): Promise<{ txHash: string; status: string }> {
    const res = await this.client.post<{ txHash: string; status: string }>(
      '/wallet/transfer',
      request,
    );
    return res.data;
  }

  /** List supported networks */
  async getNetworks(): Promise<Array<{ id: string; name: string; nativeToken: string }>> {
    const res = await this.client.get<Array<{ id: string; name: string; nativeToken: string }>>(
      '/wallet/networks',
    );
    return res.data;
  }
}

export const walletAPI = new WalletAPI();
