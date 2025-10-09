import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import './index.css';
import { ChatProvider } from '../context/ChatContext.jsx';


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
        <App />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
