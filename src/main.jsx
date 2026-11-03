import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// --- Console Signature for Awwwards Judges & Visitors ---
if (typeof window !== 'undefined') {
  console.log(
    '%c HARSH KARN %c PORTFOLIO %c',
    'background: #111; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 3px 0 0 3px;',
    'background: #d4af37; color: #111; padding: 5px 10px; font-weight: bold; border-radius: 0 3px 3px 0;',
    'background: transparent'
  );
  console.log(
    '%c✨ Welcome! %cEnchanted 3D Portfolio by Harsh Karn — Clean code & magical experiences. 🚀',
    'font-weight: bold; color: #d4af37; font-size: 14px;',
    'color: #444; font-size: 14px;'
  );
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
