import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { StoreInitializer } from './provider/context';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <StoreInitializer />
      <App />
    </BrowserRouter>,
  );
}
