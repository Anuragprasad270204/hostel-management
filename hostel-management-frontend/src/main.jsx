// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap your entire App with BrowserRouter for routing */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);