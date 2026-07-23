import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppDataProvider>
            <OrderProvider>
              <App />
            </OrderProvider>
          </AppDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
