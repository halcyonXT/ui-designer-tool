import React, { createContext, useEffect } from 'react';

const OptionsContext = createContext();

// Possible tools:
// pointer
// drag
// scale

const OptionsContextProvider = ({ children }) => {
    const [overlayOpacity, setOverlayOpacity] = React.useState(50);
    const [currentTool, setCurrentTool] = React.useState('pointer');
    const [options, setOptions] = React.useState(({
        snaplines: true,
        borders: true,
        outlines: false,
        rulers: true
    }))

    useEffect(() => {
        const keydownParser = (event) => {
            const key = event.key.toUpperCase();

            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (key) {
                case 'Q':
                    setCurrentTool('pointer');
                    break;
                case 'W':
                    setCurrentTool('drag');
                    break;
                case 'E':
                    setCurrentTool('scale');
                    break;
                default:
                    break;
            }
        }

        window.addEventListener('keypress', keydownParser);

        return () => {
            window.removeEventListener('keypress', keydownParser);
        }
    }, [])


    return (
        <OptionsContext.Provider 
            value={{
                overlayOpacity: {
                    value: overlayOpacity,
                    set: setOverlayOpacity
                }, 
                tool: {
                    value: currentTool,
                    set: setCurrentTool
                },
                options: {
                    value: options,
                    set: setOptions
                }
            }}
        >
            {children}
        </OptionsContext.Provider>
    );
};

export { OptionsContextProvider, OptionsContext }