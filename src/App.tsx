import { Route, Switch } from 'wouter';

/* Pages */
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';

import './App.css';

function App() {
  return (
    <>
      <Switch>
        <Route path='/' component={LoginPage} />
        <Route path='/chat' component={ChatPage} />
      </Switch>
    </>
  );
}

export default App;
