import React from 'react';
import 'antd/dist/antd.css';
import './index.scss';
import App from './App';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(<App />);
