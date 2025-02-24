import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import App from './App'

// Fix ResizeObserver issue
const OriginalResizeObserver = window.ResizeObserver;

window.ResizeObserver = class extends OriginalResizeObserver {
  constructor(callback) {
    super((entries, observer) => {
      requestAnimationFrame(() => callback(entries, observer));
    });
  }
};




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
    <App />
  //</React.StrictMode>
)
