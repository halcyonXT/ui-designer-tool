import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { OptionsContextProvider } from './context/OptionsContext.jsx'
import { ElementsContextProvider } from './context/ElementsContext.jsx'
import 'prismjs/themes/prism.css';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

ReactDOM.createRoot(document.getElementById('root')).render(

    <OptionsContextProvider>
      <ElementsContextProvider>
        <App />
      </ElementsContextProvider>
    </OptionsContextProvider>,
)
