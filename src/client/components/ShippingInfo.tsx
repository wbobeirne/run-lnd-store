import React from 'react';
import Loader from './Loader';
import api, { Order } from '../lib/api';

interface Props {
  order: Order;
  onComplete(order: Order): void;
}

interface State {
  form: Partial<Order>;
  hasConsented: boolean;
  isSubmitting: boolean;
  submitError: string;
}

interface FieldProps {
  name: keyof State['form'];
  label?: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
}

export default class ShippingInfo extends React.PureComponent<Props, State> {
  state: State = {
    form: {
      email: this.props.order.email || '',
      name: this.props.order.name || '',
      address1: this.props.order.address1 || '',
      address2: this.props.order.address2 || '',
      city: this.props.order.city || '',
      state: this.props.order.state || '',
      zip: this.props.order.zip || '',
      country: this.props.order.country || '',
    },
    hasConsented: false,
    isSubmitting: false,
    submitError: '',
  };

  render() {
    const { isSubmitting, submitError, hasConsented } = this.state;
    const isDisabled = !hasConsented || isSubmitting;

    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderField({
          name: 'email',
          label: 'Contact',
          placeholder: 'Email address or Twitter username',
          help: 'This will only be used to send you tracking information, or inform you of any shipping issues. If you would prefer not to provide it, just enter garbage, but you will not receive order updates.',
          required: true,
        })}
        {this.renderField({
          name: 'name',
          label: 'Name',
          required: true,
        })}
        {this.renderField({
          name: 'address1',
          label: 'Address',
          placeholder: 'Street and number, P.O. box, etc.',
          required: true,
        })}
        {this.renderField({
          name: 'address2',
          placeholder: 'Apartment, floot, etc. (Optional)',
        })}
        <div className="columns">
          <div className="column">
            {this.renderField({
              name: 'city',
              label: 'City',
              required: true,
            })}
          </div>
          <div className="column">
            {this.renderField({
              name: 'zip',
              label: 'Zip Code',
              required: true,
              pattern: '[0-9]+',
            })}
          </div>
        </div>
        <div className="columns">
          <div className="column">
            {this.renderField({
              name: 'state',
              label: 'State / Province / Region',
              required: true,
            })}
          </div>
          <div className="column">
            {this.renderField({
              name: 'country',
              label: 'Country',
              required: true,
            })}
          </div>
        </div>

        <article className="message is-info">
          <div className="message-body">
            Note that you are providing identifying information which is linked
            to your Lightning node. While we promise to responsibly store and
            secure your information, and delete it after your order has been
            received, you should be careful when linking your digital identity
            to your real one.
            <br/>
            <br/>
            <label className="checkbox">
              <input type="checkbox" onChange={this.handleChangeConsent} />
              {' '}
              <strong>I understand and accept</strong>
            </label>
          </div>
        </article>
        {submitError && (
          <article className="message is-danger">
            <div className="message-body">
              Failed to submit order: {submitError}
            </div>
          </article>
        )}
        <div className="field">
          <p className="control">
            <button className="button is-primary is-medium" disabled={isDisabled}>
              {isSubmitting ? 'Submitting order...' : 'Submit order'}
            </button>
          </p>
        </div>
      </form>
    );
  }

  private renderField = (props: FieldProps) => {
    return (
      <div className="ShippingInfo-field field">
        {props.label && <label className="label">{props.label}</label>}
        <div className="control">
          <input
            name={props.name}
            className="input"
            placeholder={props.placeholder}
            value={this.state.form[props.name] as string}
            required={props.required}
            pattern={props.pattern}
            onChange={this.handleFieldChange}
          />
        </div>
        {props.help && <p className="help">{props.help}</p>}
      </div>
    )
  };

  private handleFieldChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const form = {
      ...this.state.form,
      [ev.target.name]: ev.target.value,
    };
    this.setState({ form });
  };

  private handleChangeConsent = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ hasConsented: ev.target.checked });
  };

  private handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    this.setState({
      isSubmitting: true,
      submitError: '',
    });
    try {
      const order = await api.updateOrder(this.props.order.id, this.state.form);
      this.props.onComplete(order);
    } catch(err) {
      this.setState({
        isSubmitting: false,
        submitError: err.message,
      });
    }
  };
}