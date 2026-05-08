import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { StoreInitializer } from './provider/context';
import { ToastContainer } from 'react-toastify';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <StoreInitializer />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnFocusLoss
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
      />
      <App />
    </BrowserRouter>,
  );
}
