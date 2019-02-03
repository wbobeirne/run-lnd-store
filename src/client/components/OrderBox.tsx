import React from 'react';
import { SIZE, SIZE_LABELS } from '../../server/constants';
import { typedKeys, commaify } from '../../server/util';
import api, { Stock } from '../lib/api';
import './OrderBox.scss';

interface State {
  size: SIZE | undefined;
  yOffset: number;
  stock: Stock | null;
}

export default class OrderBox extends React.PureComponent<{}, State> {
  state: State = {
    size: undefined,
    yOffset: 0,
    stock: null,
  };
  el: HTMLDivElement | null = null;

  componentDidMount() {
    window.addEventListener('scroll', this.calculateYOffset);
    api.getStock().then(stock => {
      this.setState({ stock });
    }).catch(err => {
      console.error(err);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.calculateYOffset);
  }

  render() {
    const { size, yOffset, stock } = this.state;

    return (
      <div
        className="OrderBox box"
        ref={(el) => this.el = el}
        style={{ transform: `translateY(${yOffset}px)`}}
      >
        <div className="OrderBox-price field">
          <label className="Home-order-price-label label">Price</label>
          <div className="OrderBox-price-text">
            {commaify(process.env.SHIRT_COST as string)} satoshis
          </div>
        </div>

        <div className="OrderBox-size field">
          <label className="OrderBox-size-label label">Size</label>
          <div className="OrderBox-size-select select">
            <select onChange={this.handleChangeSize} value={size} disabled={!stock}>
              <option value="" disabled selected>Select a size</option>
              {typedKeys(SIZE).map(s => (
                <option key={s} value={s}>{SIZE_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="OrderBox-stocks field">
          <label className="OrderBox-stocks-label label">Availability</label>
          {typedKeys(SIZE).map(s => (
            <div className="OrderBox-stocks-stock">
              <div className="OrderBox-stocks-stock-label">
                {s}
              </div>
              <progress
                className="OrderBox-stocks-stock-bar progress is-small is-danger"
                value={stock ? stock[s].available : undefined}
                max={stock ? stock[s].total : undefined}
              />
            </div>
          ))}
        </div>

        <div className="OrderBox-submit">
          <button
            className="button is-medium is-fullwidth is-black"
            onClick={this.handleSubmit}
            disabled={!size}
          >
            Start order
          </button>
        </div>
      </div>
    );
  }

  private calculateYOffset = () => {
    if (!this.el) return;

    const rect = this.el.getBoundingClientRect();
    const yOffset = Math.max(40 - rect.top + this.state.yOffset, 0);
    if (this.state.yOffset !== yOffset) {
      this.setState({ yOffset });
    }
  }

  private handleChangeSize = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ size: ev.currentTarget.value as SIZE });
  };

  private handleSubmit = () => {
    console.log(this.state.size);
  };
}
