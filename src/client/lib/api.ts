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

interface CreateOrGetOrderArgs {
  size: SIZE;
  message: string;
  signature: string;
}

export interface Order {
  id: number;
  pubkey: string;
  paymentRequest: string;
  hasPaid: string;
  size: SIZE;
  expires: string;
  name: string | null;
  email: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  createdAt: string;
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

  getOrder(id: string | number) {
    return this.request<Order>('GET', `/order/${id}`);
  }

  createOrGetOrder(args: CreateOrGetOrderArgs) {
    return this.request<Order>('POST', '/order', args);
  }

  updateOrder(id: string | number, args: Partial<Order>) {
    return this.request<Order>('PUT', `/order/${id}`, args);
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

  subscribeToOrder(id: string | number) {
    const ws = location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${ws}://${location.host}${this.url}/order/${id}/subscribe`);
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

    if (method === 'POST' || method === 'PUT') {
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
    .then(async res => {
      if (!res.ok) {
        let errMsg;
        try {
          const errBody = await res.json();
          if (!errBody.error) throw new Error();
          errMsg = errBody.error;
        } catch(err) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        throw new Error(errMsg);
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
