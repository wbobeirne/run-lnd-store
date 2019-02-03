import '@babel/polyfill';
import './style/index.scss';
import React from 'react';
import { render } from 'react-dom';
import { Switch, Route } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import Template from './components/Template';
import Home from './components/Home';
import CreateOrder from './components/CreateOrder';

const App: React.SFC<{}> = () => (
  <Template>
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/order" exact component={CreateOrder} />
        <Route path="*" render={() => <h1>Sup</h1>} />
      </Switch>
    </Router>
  </Template>
);

render(<App />, document.getElementById('root'));
