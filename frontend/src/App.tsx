import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { routerManager } from './routes/router';
import './styles/globals.css';
import './styles/theme.css';

function App() {
  return (
    <>
      <RouterProvider router={routerManager.getRouter()} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

