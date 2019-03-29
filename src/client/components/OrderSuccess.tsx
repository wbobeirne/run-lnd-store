import React from 'react';
import OrderSummary from './OrderSummary';
import './OrderSuccess.scss';
import { Order } from '../lib/api';

const email = process.env.CONTACT_EMAIL;
const twitter = process.env.CONTACT_TWITTER;

interface Props {
  order: Order;
}

const OrderSuccess: React.SFC<Props> = ({ order }) => (
  <div className="OrderSuccess">
    <svg className="OrderSuccess-icon" viewBox="64 64 896 896" aria-hidden="true">
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" />
    </svg>
    <h3 className="OrderSuccess-title title">Order complete!</h3>
    <p className="OrderSuccess-text">
      Your order has been successfully completed. Expect to receive a tracking
      number in the next week. You will <strong>not</strong> receive a
      confirmation email.
    </p>
    <OrderSummary order={order} />
    <p className="OrderSuccess-text">
      If you have questions or need help with your order, please send an email to{' '}
      <a href={`mailto:${email}`} target="blank">{email}</a>
      {' '}or reach out to{' '}
      <a href={`https://twitter.com/${twitter}`} target="blank">@{twitter}</a>
      {' '}on Twitter.
    </p>
  </div>
);

export default OrderSuccess;