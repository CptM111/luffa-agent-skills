/**
 * Luffa Card Purchase SDK Module
 * Corresponds to the luffa-card-purchase skill
 */
import { LuffaClient, luffa } from './client.js';

export interface CardWalletInfo {
  balance: string;
  symbol: string;
  valueUSD: string;
  hasActiveCard: boolean;
  cardStatus: string | null;
}


export interface CardOffer {
  cardId: string;
  name: string;
  fee: string;
  symbol: string;
  benefits: string[];
}

export interface CardOffersResponse {
  offers: CardOffer[];
}


export type KycStatus = 'verified' | 'pending' | 'rejected' | 'not_started';

export interface KycStatusResponse {
  kycStatus: KycStatus;
  level: number;
  requiredLevel: number;
  eligible: boolean;
}

export interface BalanceCheckResponse {
  sufficient: boolean;
  currentBalance: string;
  requiredFee: string;
  shortfall: string;
  symbol: string;
}

export interface UserProfile {
  fullName: string | null;
  dateOfBirth: string | null;
  residentialAddress: string | null;
  missingFields: string[];
}

export interface CardApplicationRequest {
  address: string;
  cardId: string;
  /**
   * Must be explicitly set to `true`.
   * Only call submit() after receiving a clear YES confirmation from the user.
   */
  confirmed: true;
  profileData?: Partial<Pick<UserProfile, 'fullName' | 'dateOfBirth' | 'residentialAddress'>>;
}

export interface CardApplicationResponse {
  applicationId: string;
  status: string;
  cardId: string;
  feeDeducted: string;
  symbol: string;
  estimatedDelivery: string;
}


export interface TopUpRequest {
  address: string;
  amount: string;
  symbol: string;
}

export interface TopUpResponse {
  txHash: string;
  status: string;
  newBalance: string;
  symbol: string;
}


export class CardPurchaseAPI {
  constructor(private client: LuffaClient = luffa) {}

  /**
   * Step 1 — Get wallet balance and check for an existing active card.
   */
  async getWalletInfo(address: string): Promise<CardWalletInfo> {
    const params = new URLSearchParams({ address });
    const res = await this.client.get<CardWalletInfo>(`/card/wallet-info?${params}`);
    return res.data;
  }

  /**
   * Step 2 — List all available card products with fees and benefits.
   * Always display the fee clearly to the user before proceeding.
   */
  async getOffers(): Promise<CardOffersResponse> {
    const res = await this.client.get<CardOffersResponse>('/card/offers');
    return res.data;
  }

  /**
   * Step 3 — Check whether the user has completed the required KYC level.
   * If eligible is false, redirect to the KYC flow before continuing.
   */
  async getKycStatus(address: string): Promise<KycStatusResponse> {
    const params = new URLSearchParams({ address });
    const res = await this.client.get<KycStatusResponse>(`/card/kyc-status?${params}`);
    return res.data;
  }

  /**
   * Step 4 — Verify the user has sufficient balance for the selected card fee.
   * If sufficient is false, use topUpWallet() before retrying.
   */
  async checkBalance(address: string, cardId: string): Promise<BalanceCheckResponse> {
    const params = new URLSearchParams({ address, cardId });
    const res = await this.client.get<BalanceCheckResponse>(`/card/check-balance?${params}`);
    return res.data;
  }

  /**
   * Step 5 — Retrieve the user's profile and identify any missing required fields.
   * Collect all missingFields from the user before calling submitApplication().
   */
  async getUserProfile(address: string): Promise<UserProfile> {
    const params = new URLSearchParams({ address });
    const res = await this.client.get<UserProfile>(`/card/user-profile?${params}`);
    return res.data;
  }

  /**
   * Step 6 — Submit the card application and deduct the fee.
   *
   * ⚠️  IMPORTANT: Never call this method without an explicit YES confirmation
   * from the user. The `confirmed: true` field in the request enforces this
   * at the type level — it cannot be set to false or omitted.
   *
   * Pre-call checklist:
   *  - getWalletInfo()   → no active card
   *  - getKycStatus()    → eligible === true
   *  - checkBalance()    → sufficient === true
   *  - getUserProfile()  → missingFields is empty
   *  - User replied YES  → confirmed === true
   */
  async submitApplication(
    request: CardApplicationRequest,
  ): Promise<CardApplicationResponse> {
    const res = await this.client.post<CardApplicationResponse>('/card/apply', request);
    return res.data;
  }

  /**
   * Top-up — Top up the wallet when checkBalance() returns sufficient === false.
   * After topping up, call checkBalance() again before proceeding.
   */
  async topUpWallet(request: TopUpRequest): Promise<TopUpResponse> {
    const res = await this.client.post<TopUpResponse>('/wallet/top-up', request);
    return res.data;
  }
}

export const cardPurchaseAPI = new CardPurchaseAPI();