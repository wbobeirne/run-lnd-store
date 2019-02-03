import React from 'react';
import Gallery from './Gallery';
import OrderBox from './OrderBox';
import './Home.scss';

export default class Home extends React.PureComponent<{}> {
  render() {
    const images = [{
      image: '/client/images/shirt-front.jpg',
      thumb: '/client/images/shirt-front-thumb.jpg',
    }];

    return (
      <div className="Home">
        <h1 className="Home-title title">Spread the word: RUN LND</h1>
        <div className="columns">
          <div className="column">
            <Gallery images={images} />
            <div className="Home-description content">
              <h3 className="title">Description</h3>
              <p>
                Grab a limited edition RUN LND shirt so that you can let
                everyone know you're routing & reckless. Shirts are one per
                node, and you'll have to show proof with a message signature.
                This is a one-off run, once these shirts are gone, there won't
                be any more printed. Why, you might ask?
              </p>
              <div className="Home-description-quote">
                “Because it's like that, and that's the way it is”
              </div>

              <h3 className="title">Sizing</h3>
              <table className="table is-bordered is-striped">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Length</th>
                    <th>Width</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Small (S)</th>
                    <td>28"</td>
                    <td>19"</td>
                  </tr>
                  <tr>
                    <th>Medium (M)</th>
                    <td>29"</td>
                    <td>20.5"</td>
                  </tr>
                  <tr>
                    <th>Large (L)</th>
                    <td>30"</td>
                    <td>22"</td>
                  </tr>
                  <tr>
                    <th>Extra large (XL)</th>
                    <td>31"</td>
                    <td>24"</td>
                  </tr>
                </tbody>
              </table>
              <sup>
                Sizes run a little small, so bump it up if you're on the fence. Or
                just show off that bod with a tight T, you do you.
              </sup>

              <h3 className="title">Shirt specs</h3>
              <ul>
                <li>4.3 oz. 100% combed ringspun cotton jersey</li>
                <li>Super soft lightweight fabric</li>
                <li>Tear-away neck label for comfort</li>
                <li>Screen printed</li>
              </ul>

              <h3 className="title">Shipping</h3>
              <p>Shipping price is included in the order.</p>
              <ul>
                <li>US orders are expected to arrive 1-2 weeks after ordering</li>
                <li>International orders are expected to arrive 2-3 weeks after ordering</li>
              </ul>
            </div>
          </div>

          <div className="column is-narrow">
            <div className="Home-order">
              <OrderBox />
            </div>
          </div>
        </div>
      </div>
    );
  }
}