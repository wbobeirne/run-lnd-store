import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import SignMessage from './SignMessage';
import Payment from './Payment';
import ShippingInfo from './ShippingInfo';
import OrderSuccess from './OrderSuccess';
import { Order } from '../lib/api';
import { SIZE } from '../../server/constants';
import './CreateOrder.scss';

enum STEP {
  SIGN = 'SIGN',
  PAY = 'PAY',
  INFO = 'INFO',
};

interface State {
  step: STEP;
  signature: string | null;
  size: SIZE | null;
  order: Order | null;
  isFinished: boolean;
}

type Props = RouteComponentProps;

class CreateOrder extends React.PureComponent<RouteComponentProps, State> {
  state: State = {
    step: STEP.SIGN,
    signature: null,
    size: null,
    order: null,
    isFinished: false,
  };
  
  constructor(props: Props) {
    super(props);

    if (props.location.state) {
      const { size } = props.location.state;
      this.state = {
        ...this.state,
        size,
      };
    }
    else {
      props.history.replace('/');
      return;
    }
  }

  render() {
    const { step, size, signature, order, isFinished } = this.state;
    if (!size) {
      // We're going to redirect without it, don't bother rendering
      return null;
    }

    const steps = [{
      step: STEP.SIGN,
      title: 'Sign message',
      render: () => <SignMessage onVerified={this.setSignature} />,
    }, {
      step: STEP.PAY,
      title: 'Payment',
      render: () => {
        if (!signature || !size) throw new Error('Payment without signature or size');
        return <Payment signature={signature} size={size} onPayment={this.setOrder} />;
      },
    }, {
      step: STEP.INFO,
      title: 'Shipping info',
      render: () => {
        if (!order) throw new Error('Shipping info without order');
        return <ShippingInfo order={order} onComplete={this.onComplete} />;
      },
    }];
    const activeStep = steps.find(s => s.step === step) || steps[0];

    return (
      <div className="CreateOrder">
        {!isFinished && (
          <nav className="CreateOrder-nav breadcrumb has-arrow-separator is-centered is-large">
            <ul>
              {steps.map(s => (
                <li key={s.step} className={s === activeStep ? 'is-active' : ''}>
                  <a className="CreateOrder-nav-item is-disabled">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="CreateOrder-step">
          <div className="CreateOrder-step-container box">
            {isFinished ? <OrderSuccess order={order as Order} /> : activeStep.render()}
          </div>
        </div>
      </div>
    );
  }

  private changeStep = (step: STEP) => {
    this.setState({ step });
  };

  private setSignature = (signature: string) => {
    this.setState({ signature }, () => {
      this.changeStep(STEP.PAY);
    });
  };

  private setOrder = (order: Order) => {
    this.setState({ order }, () => {
      this.changeStep(STEP.INFO);
    });
  };

  private onComplete = () => {
    this.setState({ isFinished: true });
  };
}

export default withRouter(CreateOrder);
