import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Main from './components/Main/Main'
import './App.css'
import { ElementsContext } from './context/ElementsContext'

const __HUID_VERSION__ = "BETA V1.3.0"

export default React.memo(function App() {
    const {other} = React.useContext(ElementsContext);

    return (
        <>
            {
                // * If modal is active, render the element within it
                other.modal.value.active
                ?
                other.modal.value.element
                :
                <></>
            }
            

            <Navbar __HUID_VERSION__={__HUID_VERSION__} />
            <Main/>
        </>
    )
})

