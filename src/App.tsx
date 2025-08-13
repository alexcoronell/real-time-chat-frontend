import { Route, Switch } from 'wouter';

import { ThemeProvider } from "@/components/theme-provider"

/* Pages */
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';

import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Switch>
        <Route path='/' component={LoginPage} />
        <Route path='/chat' component={ChatPage} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;
