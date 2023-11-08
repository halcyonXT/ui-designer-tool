import React, { createContext, useEffect } from 'react';
import { OptionsContext } from './OptionsContext';

const ElementsContext = createContext();

const createUID = () => {
    const chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
    let temp = "";
    for (let i = 0; i < 12; i++) {
        temp += chars.charAt(~~(Math.random() * chars.length));
    }
    return temp
}

let counter = 0;





const removeIndexFromArray = (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)];




const viewportCenterSnapline = () => ({
    center: {x: 50, y: 50},
    auxillary: {
        horizontal: [-100, -100],
        vertical: [-100, -100]
    }
});

const ElementsContextProvider = ({ children }) => {
    const [selected, setSelected] = React.useState(null);
    const [selectedSubcomponent, setSelectedSubcomponent] = React.useState(null) 

    const [components, setComponents] = React.useState([]);
    const componentsRef = React.useRef(null);
    componentsRef.current = components;

    const [snaplines, setSnaplines] = React.useState({viewportCenter: viewportCenterSnapline()});
    //const [_lastRememberedScaleDimension, _setLastRememberedScaleDimension] = React.useState(null);

    const [subcomponentSnaplines, setSubcomponentSnaplines] = React.useState({parentCenter: viewportCenterSnapline()})

    const {options} = React.useContext(OptionsContext);

    const clamp = (min, val, max) => {
        if (!options.value.borders) return val;
        return Math.max(min, Math.min(val, max));
    }

    const findIndexOfUID = (UID) => components.findIndex(obj => obj._id === UID); 

    const addSubcomponent = (UID) => {
        let ind = findIndexOfUID(UID);
        let sbcUID = createUID();

        let newUID = `${UID}_${sbcUID}`

        setComponents(prev => {
            let outp = [...prev];
            let rel = outp[ind].subcomponents;
            let frame = outp[ind];

            outp[ind].subcomponents = [...rel, {
                _id: newUID,
                _privateStyles: {},
                type: 'box',
                id: `Component_${rel.length + 1}`,
                position: {
                    x: 0,
                    y: 0,
                    width: 40,
                    height: 40
                },
                stroke: "",
                width: 0,
                value: "",
                color: "",
                fill: ""
            }]

            return outp;
        })

        setSelectedSubcomponent(newUID);

        setSubcomponentSnaplines(prev => {
            let outp = {...prev};
            outp[newUID] = {
                center: {x: 0 + (40 / 2), y: 0 + (40 / 2)},
                auxillary: {
                    horizontal: [0, 0 + 40],
                    vertical: [0, 0 + 40]
                }
            }
            return outp;
        })
    }

    const updateSubcomponentSnapline = (id) => {
        // NEVER remove this timeout. Due to render-time reasons, upon multiple components moves snaplines are off by a few pixles
        // unless calculating snaplines is timed out
        setTimeout(() => {
            setSubcomponentSnaplines(prev => {
                let outp = {...prev};
                let cind = findIndexOfUID(id.split("_")[0]);
                let sind = componentsRef.current[cind].subcomponents.findIndex(obj => obj._id === id);
                let ref = componentsRef.current[cind].subcomponents[sind].position;
                outp[id] = {
                    center: {
                        x: (ref.width / 2) + ref.x, 
                        y: (ref.height / 2) + ref.y
                    },
                    auxillary: {
                        horizontal: [ref.y, ref.y + ref.height],
                        vertical: [ref.x, ref.x + ref.width]
                    }
                }
                return outp;
            })
        }, 100)
    }

    const addComponent = () => {
        ++counter;
        let UID = createUID();

        setComponents(prev => [...prev, {
            _id: UID,
            _privateStyles: {},
            type: 'frame',
            id: `Frame_${counter}`,
            position: {
                x: 0,
                y: 0,
                width: 10,
                height: 10
            },
            visible: true,
            clickable: false,
            shortcut: null,
            subcomponents: []
        }])

        setSelected(UID);

        setSnaplines(prev => {
            let outp = {...prev};
            outp[UID] = {
                center: {x: 0 + (10 / 2), y: 0 + (10 / 2)},
                auxillary: {
                    horizontal: [0, 0 + 10],
                    vertical: [0, 0 + 10]
                }
            }
            return outp;
        })
    }

    const updateComponentPosition = (id, pos) => {
        setComponents(prev => {
            let outp = [...prev], ind = outp.findIndex(com => com._id === id);
            let ref = outp[ind].position;
            outp[ind].position.x = clamp(0, pos.x, 100 - ref.width);
            outp[ind].position.y = clamp(0, pos.y, 100 - ref.height);
            
            return outp;
        })
    }

    const updateSubcomponentPosition = (UID, pos) => {
        setComponents(prev => {
            let outp = [...prev];
            let cind = findIndexOfUID(UID.split('_')[0]);
            let sind = outp[cind].subcomponents.findIndex(obj => obj._id === UID);

            let ref = outp[cind].subcomponents[sind].position;
            outp[cind].subcomponents[sind].position.x = clamp(0, pos.x, 100 - ref.width);
            outp[cind].subcomponents[sind].position.y = clamp(0, pos.y, 100 - ref.height);

            //console.log("X: " + clamp(0, pos.x, 100 - ref.width))
            //console.log("Y: " + clamp(0, pos.y, 100 - ref.height))
            return outp;
        })
    }

    const updateSnapline = (id) => {
        // NEVER remove this timeout. Due to render-time reasons, upon multiple components moves snaplines are off by a few pixles
        // unless calculating snaplines is timed out
        setTimeout(() => {
            setSnaplines(prev => {
                let outp = {...prev};
                let ref = componentsRef.current[components.findIndex(obj => obj._id === id)].position;
                outp[id] = {
                    center: {
                        x: (ref.width / 2) + ref.x, 
                        y: (ref.height / 2) + ref.y
                    },
                    auxillary: {
                        horizontal: [ref.y, ref.y + ref.height],
                        vertical: [ref.x, ref.x + ref.width]
                    }
                }
                return outp;
            })
        }, 100)
    }

    const updateComponent = (obj, id) => {
        /*setComponents(prev => {
            let outp = [...prev], ind = outp.findIndex(com => com._id === id);
            for (let key of Object.keys(obj)) {

            } 
        })*/
    }

    const removeComponent = (UID) => {
        let ind = findIndexOfUID(UID);
        if (ind === -1) return;

        setSnaplines(prev => {
            let outp = {...prev};
            delete outp[UID];
            return outp;
        })

        setComponents(prev => removeIndexFromArray(prev, ind));
    }

    const hoverComponentApplyStyles = (action, UID) => {

        setComponents(prev => {
            let outp = [...prev];
            let ind = findIndexOfUID(UID);
            outp[ind] = {...outp[ind], 
                _privateStyles: action === "end" ? {} : {
                    outline: "1px dashed var(--accent)"
                }}
            return outp;
        })
    }



    /**
     * To deselect, provide a falsy value, to select provide a UID
     * 
     * @param {string} UID - Unique ID of the targeted component
     * @returns 
     */
    const selectComponent = (UID) => {
        if (!UID) {
            setSelectedSubcomponent(null);
            return setSelected(null);
        } else {
            setSelectedSubcomponent(null);
            return setSelected(UID);
        }
    }

    const selectSubcomponent = (UID) => {
        setSelectedSubcomponent(UID);
        setSelected(UID.split("_")[0]);
    }

    /**
     * Used for the scale tool. Might be the worst function I have ever written
     * @param {String} UID - Unique ID of UI component 
     * @param {Object} options - "direction" key - ("top", "bottom", "left", "right") ; "value" key - Of type Number, represents new position in percents 
     */
    const updateComponentSize = (UID, options) => {
        let ind = findIndexOfUID(UID);
        /*if (!_lastRememberedScaleDimension) {
            let dimension;
            switch (options.direction) {
                case "top":
                    break
            }
        }*/
        switch (options.direction) {
            case "top":
                setComponents(prev => {
                    let outp = [...prev];
                    let newy = clamp(0, options.value, 100);
                    if (newy === 0) return outp;
                    let newheight = clamp(0.1, outp[ind].position.height + (outp[ind].position.y - options.value), 100);
                    if (newheight === 0.1) return outp;
                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            y: newy,
                            height: newheight
                        }
                    }
                    return outp;
                })
                break
            case "bottom":
                setComponents(prev => {
                    let outp = [...prev];
                    let newy = outp[ind].position.y;
                    let newheight = options.value - outp[ind].position.y;
                    newheight = clamp(0.1, newheight, 100 - newy);

                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            y: newy,
                            height: newheight
                        }
                    }
                    return outp;
                })
                break
            case "left":
                setComponents(prev => {
                    let outp = [...prev];
                    let newx = clamp(0, options.value, 100);
                    if (newx === 0) return outp;
                    let newwidth = clamp(0.1, outp[ind].position.width + (outp[ind].position.x - options.value), 100);
                    if (newwidth === 0.1) return outp;
                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            x: newx,
                            width: newwidth
                        }
                    }
                    return outp;
                })
                break
            case "right":
                setComponents(prev => {
                    let outp = [...prev];
                    let newx = outp[ind].position.x;
                    let newwidth = options.value - outp[ind].position.x;
                    newwidth = clamp(0.1, newwidth, 100 - newx);

                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            x: newx,
                            width: newwidth
                        }
                    }
                    return outp;
                })
                break
        }
    }


    const hoverSubcomponentApplyStyles = (action, UID) => {

        setComponents(prev => {
            let outp = [...prev];
            let ind = findIndexOfUID(UID.split('_')[0]);
            let sind = outp[ind].subcomponents.findIndex(obj => obj._id === UID);
            outp[ind].subcomponents[sind]._privateStyles = action === "end" ? {} : {
                outline: "1px dashed yellow"
            }
            return outp;
        })
    }

    const removeSubcomponent = (UID) => {
        setComponents(prev => {
            let outp = [...prev];
            let cind = findIndexOfUID(UID.split('_')[0]);
            let sind = outp[cind].subcomponents.findIndex(obj => obj._id === UID);
            outp[cind].subcomponents = removeIndexFromArray(outp[cind].subcomponents, sind);
            return outp;
        })
    }

    return (
        <ElementsContext.Provider 
            value={{
                components: {
                    selected: {
                        value: selected,
                        select: selectComponent
                    },
                    value: components,
                    set: setComponents,
                    add: addComponent,
                    updatePos: updateComponentPosition,
                    updateSize: updateComponentSize,
                    delete: removeComponent,
                    hover: {
                        start: (UID) => hoverComponentApplyStyles("start", UID),
                        end: (UID) => hoverComponentApplyStyles("end", UID)
                    },
                    
                },
                subcomponents: {
                    find: () => {},
                    selected: {
                        value: selectedSubcomponent,
                        select: selectSubcomponent
                    },
                    add: addSubcomponent,
                    remove: removeSubcomponent,
                    updatePos: updateSubcomponentPosition,
                    hover: {
                        start: (UID) => hoverSubcomponentApplyStyles("start", UID),
                        end: (UID) => hoverSubcomponentApplyStyles("end", UID)
                    },
                },
                snaplines: {
                    value: snaplines,
                    update: updateSnapline,
                    subcomponents: {
                        value: subcomponentSnaplines,
                        update: updateSubcomponentSnapline,
                    }
                }
            }}
        >
            {children}
        </ElementsContext.Provider>
    );
};

export { ElementsContextProvider, ElementsContext }