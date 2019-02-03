import React from 'react';
import SignMessage from './SignMessage';
import './CreateOrder.scss';

enum STEP {
  SIGN = 'SIGN',
  PAY = 'PAY',
  INFO = 'INFO',
};

interface State {
  step: STEP;
  pubkey: string | null;
  signature: string | null;
}

export default class CreateOrder extends React.PureComponent<{}, State> {
  state: State = {
    step: STEP.SIGN,
    pubkey: null,
    signature: null,
  };

  render() {
    const { step, pubkey, signature } = this.state;
    const steps = [{
      step: STEP.SIGN,
      title: 'Sign message',
      render: () => <SignMessage onSubmit={this.handleSignSubmit} />,
      isDisabled: false,
    }, {
      step: STEP.PAY,
      title: 'Payment',
      render: () => <h1>Pay me pls</h1>,
      isDisabled: !pubkey || !signature,
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
          {activeStep.render()}
        </div>
      </div>
    );
  }

  private changeStep = (step: STEP) => {
    this.setState({ step });
  };

  private handleSignSubmit = (pubkey: string, signature: string) => {
    this.setState({ pubkey, signature });
    this.changeStep(STEP.PAY);
  };
}
