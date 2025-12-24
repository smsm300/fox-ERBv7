import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryProvider } from './providers/QueryProvider';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { FoxToaster } from './components/ui/Toast';
import { OfflineIndicator } from './components/ui/OfflineIndicator';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <ConfirmProvider>
        <App />
        <FoxToaster />
        <OfflineIndicator />
      </ConfirmProvider>
    </QueryProvider>
  </React.StrictMode>
);