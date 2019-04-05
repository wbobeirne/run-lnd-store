import React from 'react';
import { requestProvider } from 'webln';
import Loader from './Loader';
import api, { NodeInfo } from '../lib/api';
import { MESSAGE } from '../../server/constants';
import './SignMessage.scss';

interface Props {
  onVerified(signature: string): void;
}

interface State {
  signature: string;
  isWeblnSigning: boolean;
  weblnSignError: string;
  isSubmitting: boolean;
  submitError: string;
  node: NodeInfo | null;
}

export default class SignMessage extends React.Component<Props, State> {
  state: State = {
    signature: '',
    isWeblnSigning: true,
    weblnSignError: '',
    isSubmitting: false,
    submitError: '',
    node: null,
  };

  componentDidMount() {
    this.weblnSign();
  }

  render() {
    const { signature, isWeblnSigning, weblnSignError, isSubmitting, submitError, node } = this.state;

    let content;
    if (node) {
      content = (
        <div className="SignMessage-success">
          <h3 className="title">Success!</h3>
          <p className="SignMessage-success-text">
            Validated you as <strong>{node.alias}</strong>
          </p>
          <button
            className="SignMessage-success-continue button is-primary is-medium"
            onClick={() => this.props.onVerified(signature)}
          >
            Continue to Payment
          </button>
          <br/>
          <button className="button is-text is-small" onClick={this.reset}>
            Try a different node
          </button>
        </div>
      );
    } else if (isWeblnSigning) {
      content = <Loader message="Signing with WebLN..." />;
    } else if (weblnSignError) {
      content = (
        <div className="SignMessage-error">
          <div className="message is-danger">
            <div className="message-body">
              {weblnSignError}
            </div>
          </div>
          <div className="SignMessage-error-buttons buttons is-centered">
            <button className="button is-primary" onClick={this.weblnSign}>
              Try again
            </button>
            <button className="button" onClick={this.cancelWeblnSign}>
              View CLI Instructions
            </button>
          </div>
        </div>
      );
    } else {
      content = (
        <form className="SignMessage-form" onSubmit={this.submit}>
          <div className="SignMessage-form-cli field">
            <label className="label">CLI Command</label>
            <div className="control">
              <input className="input" readOnly value={`lncli signmessage "${MESSAGE}"`} />
            </div>
          </div>
          <div className="SignMessage-form-signature field">
            <label className="label">Message signature</label>
            <div className={`control ${isSubmitting ? 'is-loading' : ''}`}>
              <input
                className="input"
                placeholder="Paste the signature here afte running the above command"
                value={signature}
                onChange={this.handleChangeSignature}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {submitError && (
            <div className="message is-danger">
              <div className="message-body">
                {submitError}
              </div>
            </div>
          )}
          <div className="buttons">
            <button
              className="button is-primary"
              type="submit"
              disabled={isSubmitting}
            >
              Submit
            </button>
            <a href="/" className="button" type="button">
              Cancel order
            </a>
          </div>
        </form>
      );
    }

    return (
      <div className="SignMessage">
        {content}
      </div>
    );
  }

  private weblnSign = async () => {
    // If we don't have WebLN, just fall back to input without error
    let webln;
    try {
      webln = await requestProvider();
    } catch(err) {
      console.warn('WebLN is unavailable');
      this.setState({ isWeblnSigning: false });
      return;
    }

    // If we do, grab a signature and show an error if it fails.
    this.setState({
      isWeblnSigning: true,
      weblnSignError: '',
    });
    try {
      const res = await webln.signMessage(MESSAGE);
      this.setState({
        signature: (res as any).signature,
        isWeblnSigning: false,
      }, () => {
        this.submit();
      });
    } catch(err) {
      this.setState({
        isWeblnSigning: false,
        weblnSignError: `${err.message || err}. Please try again, or complete the signature via the command line. If you’re having trouble signing with Joule, make sure your LND node is up to date.`,
      })
    }
  };

  private cancelWeblnSign = () => {
    this.setState({
      isWeblnSigning: false,
      weblnSignError: '',
    });
  };

  private handleChangeSignature = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ signature: ev.currentTarget.value.trim() });
  };

  private submit = async (ev?: React.FormEvent<HTMLFormElement>) => {
    if (ev) ev.preventDefault();
    this.setState({ isSubmitting: true });

    try {
      const { signature } = this.state;
      const res = await api.verifySignature(MESSAGE, signature);
      this.setState({ node: res.node });
    } catch(err) {
      this.setState({
        isSubmitting: false,
        submitError: err.message || err.toString(),
      });
    }
  };

  private reset = () => {
    this.setState({
      signature: '',
      isWeblnSigning: true,
      weblnSignError: '',
      isSubmitting: false,
      submitError: '',
      node: null,
    }, () => {
      this.weblnSign();
    });
  };
}
