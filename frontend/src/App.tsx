import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { routerManager } from './routes/router';
import './styles/globals.css';
import './styles/theme.css';

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={routerManager.getRouter()} />
      <Toaster position="top-right" richColors />
    </HelmetProvider>
  );
}

export default App;

