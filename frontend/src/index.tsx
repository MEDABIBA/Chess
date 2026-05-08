import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { StoreInitializer } from './provider/context';
import { ToastContainer } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <Helmet>
      <title>Chess</title>
      <meta property="og:title" content={`Play to chess with me!`} />
      <meta property="og:description" content="Join my chess game!" />

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
      </BrowserRouter>
    </Helmet>,
  );
}
