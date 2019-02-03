import React from 'react';
import QRCode from 'qrcode.react';
import { requestProvider } from 'webln/lib/client';
import Loader from './Loader';
import api, { Order } from '../lib/api';
import { MESSAGE, SIZE } from '../../server/constants';
import './Payment.scss';

interface Props {
  signature: string;
  size: SIZE;
  onPayment(order: Order): void;
}

interface State {
  order: Order | null;
  isGettingOrder: boolean;
  getOrderError: string;
  isWeblnPaying: boolean;
  weblnPayError: string;
}

export default class Payment extends React.PureComponent<Props, State> {
  state: State = {
    order: null,
    isGettingOrder: true,
    getOrderError: '',
    isWeblnPaying: false,
    weblnPayError: '',
  };

  async componentDidMount() {
    const { signature, size } = this.props;
    try {
      const order = await api.createOrGetOrder({
        size,
        signature,
        message: MESSAGE,
      });
      this.setState({
        order,
        isGettingOrder: false,
      }, () => {
        this.weblnPay();
      });
    } catch(err) {
      console.error(err);
      this.setState({
        isGettingOrder: false,
        getOrderError: err.message || err.toString(),
      });
    }
  }

  render() {
    const { order, isGettingOrder, isWeblnPaying } = this.state;

    let content;
    if (isGettingOrder) {
      content = <Loader message="Getting order details..." />
    } else if (isWeblnPaying) {
      content = <Loader message="Sending payment with WebLN..." />
    } else if (order) {
      content = (
        <div className="Payment-order">
          <a href={`lightning:${order.paymentRequest}`} className="Payment-order-qr">
            <QRCode value={order.paymentRequest.toUpperCase()} />
            <small className="Payment-order-qr-hint">
              Click to open in wallet
            </small>
          </a>
          <input className="input" readOnly value={order.paymentRequest} />
        </div>
      );
    }

    return (
      <div className="Payment">
        {content}
      </div>
    )
  }

  private weblnPay = async () => {
    // Ensure we have the order first
    const { order } = this.state;
    if (!order) {
      return;
    }

    // If we don't have WebLN, just fall back to input without error
    let webln;
    try {
      webln = await requestProvider();
    } catch(err) {
      console.warn('WebLN is unavailable');
      this.setState({ isWeblnPaying: false });
      return;
    }

    // If we do, grab a signature and show an error if it fails.
    this.setState({ isWeblnPaying: true });
    try {
      webln.sendPayment(order.paymentRequest);
    } catch(err) {
      this.setState({
        isWeblnPaying: false,
        weblnPayError: `Failed to sign: ${err.message || err}`,
      })
    }
  };
}