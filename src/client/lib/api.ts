import { stringify } from 'query-string';
import { SIZE } from '../../server/constants';
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Types
export interface StockInfo {
  total: number;
  available: number;
  pending: boolean;
}

// Get node
export interface NodeInfo {
  alias: string;
  capacity: string;
  channel_count: number;
  color: string;
}

export interface SignatureVerification {
  pubkey: string;
  valid: boolean;
  node: NodeInfo;
}

export type Stock = { [key in SIZE]: StockInfo };

class API {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  // Public methods
  getStock() {
    return this.request<Stock>('GET', '/stock');
  }

  getNodeInfo(pubkey: string) {
    return this.request<NodeInfo>('GET', '/node', { pubkey });
  }

  verifySignature(message: string, signature: string) {
    return this.request<SignatureVerification>('POST', '/verify', {
      message,
      signature,
    })
    .then(res => {
      if (res.valid) {
        return res;
      } else {
        throw new Error('Message signature was invalid');
      }
    });
  }

  // Internal fetch function
  protected request<R extends object>(
    method: ApiMethod,
    path: string,
    args?: object,
  ): Promise<R> {
    let body = null;
    let query = '';
    const headers = new Headers();
    headers.append('Accept', 'application/json');

    if (method === 'POST') {
      body = JSON.stringify(args);
      headers.append('Content-Type', 'application/json');
    }
    else if (args !== undefined) {
      // TS Still thinks it might be undefined(?)
      query = `?${stringify(args as any)}`;
    }

    return fetch(this.url + path + query, {
      method,
      headers,
      body,
    })
    .then(async (res) => {
      if (!res.ok) {
        try {
          const errBody = await res.json();
          if (!errBody.error) throw new Error();
          throw new Error(errBody);
        } catch(err) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      }
      return res.json();
    })
    .then(res => res.data as R)
    .catch((err) => {
      console.error(`API error calling ${method} ${path}`, err);
      throw err;
    });
  }
}

export default new API('/api');
