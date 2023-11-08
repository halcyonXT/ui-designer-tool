import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { OptionsContextProvider } from './context/OptionsContext.jsx'
import { ElementsContextProvider } from './context/ElementsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(

    <OptionsContextProvider>
      <ElementsContextProvider>
        <App />
      </ElementsContextProvider>
    </OptionsContextProvider>,
)
