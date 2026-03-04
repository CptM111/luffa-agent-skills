/**
 * Luffa Agent Skills SDK
 * 
 * A TypeScript client for interacting with the Luffa API.
 * Used by all Luffa Agent Skills.
 * 
 * @license Apache-2.0
 * @author Luffa Team
 */

export interface LuffaConfig {
  apiKey?: string;
  secretKey?: string;
  baseUrl?: string;
}

export interface LuffaResponse<T = unknown> {
  code: string;
  data: T;
  msg: string;
}

/**
 * Core Luffa API client.
 * Reads credentials from environment variables by default.
 */
export class LuffaClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(config: LuffaConfig = {}) {
    this.baseUrl = config.baseUrl ?? (process.env.LUFFA_BASE_URL ?? 'https://api.luffa.im/v1');
    this.apiKey = config.apiKey ?? (process.env.LUFFA_API_KEY ?? '');
    this.secretKey = config.secretKey ?? (process.env.LUFFA_SECRET_KEY ?? '');

    if (!this.apiKey) {
      console.warn('[Luffa] LUFFA_API_KEY is not set. Set it in your environment or .env file.');
    }
  }

  async fetch<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: object,
  ): Promise<LuffaResponse<T>> {
    const timestamp = Date.now().toString();
    const headers: Record<string, string> = {
      'X-Luffa-API-Key': this.apiKey,
      'X-Luffa-Timestamp': timestamp,
      'Content-Type': 'application/json',
    };

    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    });

    if (res.status === 429) {
      throw { code: 'RATE_LIMITED', msg: 'Rate limited — retry with backoff', retryable: true };
    }
    if (res.status >= 500) {
      throw { code: `HTTP_${res.status}`, msg: 'Luffa server error', retryable: true };
    }
    if (!res.ok) {
      throw { code: `HTTP_${res.status}`, msg: `Luffa API error: ${res.statusText}`, retryable: false };
    }

    const json = (await res.json()) as LuffaResponse<T>;
    if (json.code !== '0') {
      throw { code: json.code, msg: json.msg ?? 'Luffa API error', retryable: false };
    }

    return json;
  }

  get<T = unknown>(path: string): Promise<LuffaResponse<T>> {
    return this.fetch<T>('GET', path);
  }

  post<T = unknown>(path: string, body: object): Promise<LuffaResponse<T>> {
    return this.fetch<T>('POST', path, body);
  }
}

// Default singleton client
export const luffa = new LuffaClient();
