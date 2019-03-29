import React from 'react';
import { Order } from '../lib/api';
import './OrderSummary.scss';

interface Props {
  order: Order;
}

const OrderSummary: React.SFC<Props> = ({ order }) => (
  <div className="OrderSummary">
    <div className="OrderSummary-detail">
      <div className="OrderSummary-detail-label">Item</div>
      <div className="OrderSummary-detail-value">
        RUN LND Shirt ({order.size})
      </div>
    </div>
    <div className="OrderSummary-detail">
      <div className="OrderSummary-detail-label">Contact</div>
      <div className="OrderSummary-detail-value">
        {order.email}
      </div>
    </div>
    <div className="OrderSummary-detail">
      <div className="OrderSummary-detail-label">Name</div>
      <div className="OrderSummary-detail-value">
        {order.name}
      </div>
    </div>
    <div className="OrderSummary-detail">
      <div className="OrderSummary-detail-label">Address</div>
      <div className="OrderSummary-detail-value">
        {order.address1}
        {order.address2 && <><br/>{order.address2}</>}
        <br/>
        {order.city}, {order.state} {order.zip}
        <br/>
        {order.country}
      </div>
    </div>
  </div>
);

export default OrderSummary;
