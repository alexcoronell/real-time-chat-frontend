import { Route, Switch } from 'wouter';

/* Pages */
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';

import './App.css';

function App() {
  return (
    <>
      <h1>Real Time Chat</h1>
      <Switch>
        <Route path='/' component={LoginPage} />
        <Route path='/chat' component={ChatPage} />
      </Switch>
    </>
  );
}

export default App;
