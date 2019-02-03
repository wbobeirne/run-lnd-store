import React from 'react';
import './Template.scss';

interface Props {
  children: React.ReactNode;
}

const Template: React.SFC<Props> = ({ children }) => (
  <div className="Template">
    <div className="Template-header">
      <div className="Header-logo">
        <img src="/client/images/run-lnd.svg" />
      </div>
      <div className="Header-plug">
        Brought to you by Joule
      </div>
    </div>
    <div className="Template-content container">
      {children}
    </div>
    <footer className="Template-footer footer">
      <div className="content has-text-centered">
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
    </footer>
  </div>
);

export default Template;
