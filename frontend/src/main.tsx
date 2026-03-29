import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { apiClient } from '@/api/client';

// Kick off ECDH handshake in the background — requests queued before it
// completes will fire without encryption (graceful degradation).
apiClient.initCrypto();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

