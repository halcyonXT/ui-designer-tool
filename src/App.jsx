import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Main from './components/Main/Main'
import { ElementsContext } from './context/ElementsContext'
import './App.css'

export default React.memo(function App() {
    const {other} = React.useContext(ElementsContext);

    const [modal, setModal] = React.useState({
        activated: false,
        element: <></>
    })

    const triggerModal = (element) => {
        setModal(prev => ({
            activated: !prev.activated,
            element: element ? element : <></>
        }))
    }

    React.useEffect(() => {
        other.modal._set(triggerModal);
    }, [])

    return (
        <>
            {
                modal.activated
                &&
                <div className='-modal-prompt-wrapper'>
                    <div className='-modal-prompt'>
                        {
                            modal.element
                        }
                    </div>
                </div>
            }
            <Navbar/>
            <Main/>
        </>
    )
})

