import React from 'react';
import './Loader.scss';

interface Props {
  message?: string;
}

const Loader: React.SFC<Props> = ({ message }) => (
  <div className="Loading">
    <div className="Loading-box">
      <div className="Loading-box-inner" />
    </div>
    {message && <div className="Loading-message">{message}</div>}
  </div>
);

export default Loader;
