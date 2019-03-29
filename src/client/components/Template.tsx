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
    </footer>
  </div>
);

export default Template;
