import React from 'react';
import { Link } from 'react-router-dom';
import './Template.scss';

interface Props {
  children: React.ReactNode;
}

const Template: React.SFC<Props> = ({ children }) => (
  <div className="Template">
    <div className="Template-header">
      <Link className="Template-header-logo" to="/">
        <img src="/client/images/run-lnd.svg" />
      </Link>
      <div className="Template-header-plug">
        Powered by <a href="http://webln.dev" target="_blank">WebLN</a>
      </div>
    </div>
    <div className="Template-content container">
      {children}
    </div>
    <footer className="Template-footer footer">
      <div className="Template-footer-left">
        RUN LND shirt design & site made by{' '}
        <a
          href="https://twitter.com/wbobeirne"
          target="_blank"
          rel="noopener nofollow"
        >
          @wbobeirne
        </a>
        <br/>
        Source code available on{' '}
        <a
          href="https://github.com/wbobeirne/run-lnd-store"
          target="_blank"
          rel="noopener nofollow"
        >
          Github
        </a>
      </div>

      <div className="Template-footer-right">
        <div>Connect to our node or open a channel at</div>
        <div>
          <input
            className="input is-small"
            value={process.env.LND_CONNECTION_STRING}
            readOnly
          />
        </div>
      </div>
    </footer>
  </div>
);

export default Template;
