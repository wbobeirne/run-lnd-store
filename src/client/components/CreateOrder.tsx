import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import SignMessage from './SignMessage';
import Payment from './Payment';
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
}

type Props = RouteComponentProps;

class CreateOrder extends React.PureComponent<RouteComponentProps, State> {
  state: State = {
    step: STEP.SIGN,
    signature: null,
    size: null,
    order: null,
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
    const { step, size, signature } = this.state;
    if (!size) {
      // We're going to redirect without it, don't bother rendering
      return null;
    }

    const steps = [{
      step: STEP.SIGN,
      title: 'Sign message',
      render: () => <SignMessage onVerified={this.setSignature} />,
      isDisabled: false,
    }, {
      step: STEP.PAY,
      title: 'Payment',
      render: () => {
        if (!signature || !size) throw new Error('Payment without signature or size');
        return <Payment signature={signature} size={size} onPayment={this.setOrder} />;
      },
      isDisabled: !signature,
    }, {
      step: STEP.INFO,
      title: 'Shipping info',
      render: () => <h1>Shipping</h1>,
      isDisabled: true,
    }];
    const activeStep = steps.find(s => s.step === step) || steps[0];

    return (
      <div className="CreateOrder">
        <nav className="CreateOrder-nav breadcrumb has-arrow-separator is-centered is-large">
          <ul>
            {steps.map(s => (
              <li key={s.step} className={s === activeStep ? 'is-active' : ''}>
                <a
                  className={`CreateOrder-nav-item ${s.isDisabled ? 'is-disabled' : ''}`}
                  onClick={() => this.changeStep(STEP.SIGN)}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="CreateOrder-step">
          <div className="CreateOrder-step-container box">
            {activeStep.render()}
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
}

export default withRouter(CreateOrder);
