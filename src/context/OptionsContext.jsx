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
        borders: true
    }))

    useEffect(() => {
    }, []);

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