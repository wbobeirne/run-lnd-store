import React from 'react';
import moment from 'moment';
import QRCode from 'qrcode.react';
import { requestProvider } from 'webln';
import Loader from './Loader';
import OrderSummary from './OrderSummary';
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
  hasPaid: boolean;
  hasExpired: boolean;
}

export default class Payment extends React.PureComponent<Props, State> {
  state: State = {
    order: null,
    isGettingOrder: true,
    getOrderError: '',
    isWeblnPaying: false,
    weblnPayError: '',
    hasPaid: false,
    hasExpired: false,
  };

  componentDidMount() {
    this.getOrder();
  }

  render() {
    const { order, isGettingOrder, isWeblnPaying, getOrderError, hasPaid, hasExpired, weblnPayError } = this.state;

    let content;
    if (hasPaid || (order && order.hasPaid && !order.email)) {
      content = (
        <div className="Payment-success">
          <h3 className="title">Success!</h3>
          <p className="Payment-success-text">
            Your payment has been received
          </p>
          <button
            className="Payment-success-continue button is-primary is-medium"
            onClick={() => this.props.onPayment(order as Order)}
          >
            Continue to shipping info
          </button>
        </div>
      )
    } else if (hasExpired) {
      content = (
        <>
          <div className="message is-warning">
            <div className="message-body">
              Your order has expired. You can return to the homepage to try again.
              If you experienced routing issues, you can try to open a channel
              with our node (Details in the footer.)
              <br />
              <br />
              If you paid and didn't expect this to happen, please contact us
              for help.
            </div>
          </div>
          <a href="/" className="button is-primary">
            Start over
          </a>
        </>
      );
    } else if (isGettingOrder) {
      content = <Loader message="Getting order details..." />
    } else if (getOrderError) {
      content = (
        <>
          <div className="message is-danger">
            <div className="message-body">
              {getOrderError}
            </div>
          </div>
          <button className="button is-primary" onClick={this.getOrder}>
            Try again
          </button>
        </>
      );
    } else if (isWeblnPaying) {
      content = <Loader message="Sending payment with WebLN..." />
    } else if (order) {
      if (order.hasPaid && order.email) {
        const email = process.env.CONTACT_EMAIL;
        const twitter = process.env.CONTACT_TWITTER;
        content = (
          <div className="Payment-success">
            <h3 className="title">You’ve already ordered</h3>
            <p className="Payment-success-text">
              You completed an order for a shirt on{' '}
              {new Date(order.createdAt).toLocaleString()}.
            </p>
            <OrderSummary order={order} />
            <p className="Payment-success-text">
              If you have questions or need help with your order, please send an email to{' '}
              <a href={`mailto:${email}`} target="blank">{email}</a>
              {' '}or reach out to{' '}
              <a href={`https://twitter.com/${twitter}`} target="blank">@{twitter}</a>
              {' '}on Twitter.
            </p>
            <a
              className="Payment-success-continue button is-primary is-medium"
              href="/"
            >
              Return home
            </a>
          </div>
        );
      } else {
        content = (
          <>
            {weblnPayError && (
              <div className="message is-danger">
                <div className="message-body">
                  {weblnPayError}
                </div>
              </div>
            )}
            <div className="Payment-order">
              <a href={`lightning:${order.paymentRequest}`} className="Payment-order-qr">
                <QRCode value={order.paymentRequest.toUpperCase()} fgColor="#F70000" size={200} />
              </a>
              <div className="Payment-order-invoice">
                <textarea className="textarea" readOnly value={order.paymentRequest} rows={5} />
                <a href={`lightning:${order.paymentRequest}`} className="button is-primary is-medium">
                  Open in Wallet ⚡
                </a>
              </div>
            </div>
          </>
        );
      }
    }

    return (
      <div className="Payment">
        {content}
      </div>
    )
  }

  private getOrder = async () => {
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
        getOrderError: '',
      }, () => {
        if (!order.hasPaid) {
          this.subscribeToOrder(order);
          this.weblnPay();
        }
      });
    } catch(err) {
      console.error(err);
      this.setState({
        isGettingOrder: false,
        getOrderError: err.message || err.toString(),
      });
    }
  };

  private weblnPay = async () => {
    // Ensure we have the order first
    const { order } = this.state;
    if (!order) {
      return;
    }

    // If we don't have WebLN, fall back to qr code and such
    let webln;
    try {
      webln = await requestProvider();
    } catch(err) {
      console.warn('WebLN is unavailable');
      this.setState({ isWeblnPaying: false });
      return;
    }

    // If we do, try to send with WebLN
    this.setState({
      isWeblnPaying: true,
      weblnPayError: '',
    });
    try {
      await webln.sendPayment(order.paymentRequest);
    } catch(err) {
      this.setState({
        isWeblnPaying: false,
        weblnPayError: `${err.message || 'WebLN payment failed'}. You can try paying below.`,
      })
    }
  };

  private subscribeToOrder = (order: Order) => {
    let ws: WebSocket;
    try {
      ws = api.subscribeToOrder(order.id);
    } catch(err) {
      this.setState({ getOrderError: err.message || 'Could not open connection with server' });
      return;
    }

    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data.toString());
      if (data.success) {
        this.setState({ hasPaid: true }, () => ws.close());
      }
      if (data.expired) {
        this.setState({ hasExpired: true }, () => ws.close());
      }
      if (data.error) {
        this.setState({ getOrderError: data.error }, () => ws.close());
      }
    });

    const showError = (ev: any) => {
      console.log(ev);
      if (!this.state.hasPaid || !this.state.hasExpired) {
        this.setState({
          getOrderError: 'Your connection to the server closed unexpectedly. Please try again, or go through the checkout flow again. If you continue to have trouble, please contact us.',
        });
      }
    };
    ws.addEventListener('close', showError);
    ws.addEventListener('error', showError);
  };
}