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
const extractFrameID = (str) => str.split("_")[0];




const viewportCenterSnapline = () => ({
    center: {x: 50, y: 50},
    auxillary: {
        horizontal: [-Infinity, -Infinity],
        vertical: [-Infinity, -Infinity]
    }
});


// ! IMPORTANT
// TODO: - Split up ElementsContext into multiple contexts
// TODO: - Document this code

const ElementsContextProvider = ({ children }) => {
    const [selected, setSelected] = React.useState(null);
    const [selectedSubcomponent, setSelectedSubcomponent] = React.useState(null) 

    const [components, setComponents] = React.useState([]);
    const [_scaling, _setScaling] = React.useState(false);
    const componentsRef = React.useRef(null);
    componentsRef.current = components;

    const [snaplines, setSnaplines] = React.useState({viewportCenter: viewportCenterSnapline()});
    //const [_lastRememberedScaleDimension, _setLastRememberedScaleDimension] = React.useState(null);

    const [subcomponentSnaplines, setSubcomponentSnaplines] = React.useState({parentCenter: viewportCenterSnapline()})

    const {options} = React.useContext(OptionsContext);



    const clamp = (min, val, max) => {
        if (!options.value.borders) return Number(val);
        return Math.max(min, Math.min(val, max));
    }

    const findIndexOfUID = (UID) => components.findIndex(obj => obj._id === UID); 

    const addSubcomponent = (UID) => {
        let ind = findIndexOfUID(UID);
        let sbcUID = createUID();

        let newUID = `${UID}_${sbcUID}`

        // ! type: 'box', 'text' or 'round'
        setComponents(prev => {
            let outp = [...prev];
            let rel = outp[ind].subcomponents;

            outp[ind].subcomponents = [...rel, {
                _id: newUID,
                _privateStyles: {},
                type: 'box',
                id: `Subcomponent_${rel.length + 1}`,
                position: {
                    x: 0,
                    y: 0,
                    width: 40,
                    height: 40
                },
                custom: {
                    stroke: {on: false, value: "#DCDCDCFF"},
                    width: {on: false, value: "1"},
                    // only for consistency
                    value: {value: "new text"},
                    color: {on: true, value: "#DCDCDCFF"},
                    fill: {on: false, value: "#DCDCDCFF"},
                    align: {value: 'left'}
                }
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
        // ! NEVER remove this timeout. Due to render-time reasons, upon multiple components moves snaplines are off by a few pixles
        // ! unless calculating snaplines is timed out
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
            _componentCollapsed: false,
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

    const updateSnapline = (id, type) => {
        // ! NEVER remove this timeout. Due to render-time reasons, upon multiple components moves snaplines are off by a few pixles
        // ! unless calculating snaplines is timed out
        if (type === "frame") {
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
        } else {
            // type === "subcomponent"
            setTimeout(() => {
                setSubcomponentSnaplines(prev => {
                    let outp = {...prev};
                    let cind = findIndexOfUID(extractFrameID(id));
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

        // * Remove all snaplines of subcomponent children
        setSubcomponentSnaplines(prev => {
            let outp = {...prev};
            for (let subc of components[ind].subcomponents) {
                delete outp[subc._id];
            } 
            return outp;
        })

        if (components[ind].subcomponents.findIndex(obj => obj._id === selectedSubcomponent) !== -1) {
            setTimeout(() => {
                setSelectedSubcomponent(null);
            }, 10)
        }

        if (selected === UID) {
            if (selectedSubcomponent && selectedSubcomponent.split('_')[0] === UID) {
                setSelectedSubcomponent(null);
            }
            setTimeout(() => {
                setSelected(null);
            }, 10)
        }

        setComponents(prev => removeIndexFromArray(prev, ind));
    }

    const hoverComponentApplyStyles = (action, UID) => {

        setComponents(prev => {
            let outp = [...prev];
            let ind = findIndexOfUID(UID);
            outp[ind] = {...outp[ind], 
                _privateStyles: action === "end" ? {} : {
                    outline: "2px dashed #6dffff"
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
     * Returns null if resize is rejected, otherwise returns appropriate values
     * 
     * @param {Object} options - Object containing properties `direction` and `value`
     * @param {Object} ref - Reference to an object with a `position` property
     * @returns {Object}
     */
    const getNewSize = (options, ref) => {
        try {
            switch (options.direction) {
                case "top":
                        return (() => {
                            let newy = clamp(0, options.value, 100);
                            let newheight = clamp(0.1, ref.position.height + (ref.position.y - options.value), 100);
                            if (newy === 0) {
                                return {
                                    y: 0,
                                    height: (ref.position.height + ref.position.y)
                                }
                            }
                            if (newheight === 0.1) return null;
                            return {
                                y: newy,
                                height: newheight
                            }
                        })();
                    case "bottom":
                        return (() => {
                            let newy = ref.position.y;
                            let newheight = options.value - ref.position.y;
                            newheight = clamp(0.1, newheight, 100 - newy);
                            return {
                                height: newheight
                            }
                        })();
                    case "left":
                        return (() => {
                            let newx = clamp(0, options.value, 100);
                            if (newx === 0) {
                                return {
                                    x: 0,
                                    width: (ref.position.width + ref.position.x)
                                }
                            }
                            let newwidth = clamp(0.1, ref.position.width + (ref.position.x - options.value), 100);
                            if (newwidth === 0.1) return null;
                            return {
                                x: newx,
                                width: newwidth
                            }
                        })();
                    case "right":
                        return (() => {
                            let newx = ref.position.x;
                            let newwidth = options.value - ref.position.x;
                            newwidth = clamp(0.1, newwidth, 100 - newx);
                            return {
                                width: newwidth
                            }
                        })();
            }
        } catch (ex) {
            console.warn("Resize failed: " + ex);
            return null;
        }
    }

    /**
     * Used for the scale tool. Might be the worst function I have ever written
     * @param {String} UID - Unique ID of UI component 
     * @param {Object} options - "direction" key - ("top", "bottom", "left", "right") ; "value" key - Of type Number, represents new position in percents 
     */
    const updateComponentSize = (UID, options) => {
        let ind = findIndexOfUID(UID);
        switch (options.direction) {
            case "top":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[ind])
                    if (!newsize) return outp;
                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            y: newsize.y,
                            height: newsize.height
                        }
                    }
                    return outp;
                })
                break
            case "bottom":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[ind]); 
                    if (!newsize) return outp;                   
                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            height: newsize.height
                        }
                    }
                    return outp;
                })
                break
            case "left":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[ind]);
                    if (!newsize) return outp;
                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            x: newsize.x,
                            width: newsize.width
                        }
                    }
                    return outp;
                })
                break
            case "right":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[ind]);
                    if (!newsize) return outp;
                    outp[ind] = {
                        ...outp[ind], 
                        position: {
                            ...outp[ind].position,
                            width: newsize.width
                        }
                    }
                    return outp;
                })
                break
        }
    }

    /**
     * "Don't repeat yourself"? What's that? Never heard of it
     * @param {String} UID - Unique ID of UI component 
     * @param {Object} options - "direction" key - ("top", "bottom", "left", "right") ; "value" key - Of type Number, represents new position in percents 
     */
    const updateSubcomponentSize = (UID, options) => {
        let cind = findIndexOfUID(extractFrameID(UID));
        let sind = findIndexOfSubcomponent(UID);
        switch (options.direction) {
            case "top":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[cind].subcomponents[sind]);
                    if (!newsize) return outp;

                    outp[cind].subcomponents[sind] = {
                        ...outp[cind].subcomponents[sind], 
                        position: {
                            ...outp[cind].subcomponents[sind].position,
                            y: newsize.y,
                            height: newsize.height
                        }
                    }
                    return outp;
                })
                break
            case "bottom":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[cind].subcomponents[sind]);
                    if (!newsize) return outp;

                    outp[cind].subcomponents[sind] = {
                        ...outp[cind].subcomponents[sind], 
                        position: {
                            ...outp[cind].subcomponents[sind].position,
                            height: newsize.height
                        }
                    }
                    return outp;
                })
                break
            case "left":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[cind].subcomponents[sind]);
                    if (!newsize) return outp;

                    outp[cind].subcomponents[sind] = {
                        ...outp[cind].subcomponents[sind], 
                        position: {
                            ...outp[cind].subcomponents[sind].position,
                            x: newsize.x,
                            width: newsize.width
                        }
                    }
                    return outp;
                })
                break
            case "right":
                setComponents(prev => {
                    let outp = [...prev];
                    let newsize = getNewSize(options, outp[cind].subcomponents[sind]);
                    if (!newsize) return outp;

                    outp[cind].subcomponents[sind] = {
                        ...outp[cind].subcomponents[sind], 
                        position: {
                            ...outp[cind].subcomponents[sind].position,
                            width: newsize.width
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
                outline: "2px dashed yellow"
            }
            return outp;
        })
    }

    const removeSubcomponent = (UID) => {
        if (selectedSubcomponent === UID) {
            setTimeout(() => {
                setSelectedSubcomponent(null);
            }, 10)
        }

        setSubcomponentSnaplines(prev => {
            let outp = {...prev};
            delete outp[UID];
            return outp;
        })

        setComponents(prev => {
            let outp = [...prev];
            let cind = findIndexOfUID(UID.split('_')[0]);
            let sind = outp[cind].subcomponents.findIndex(obj => obj._id === UID);
            outp[cind].subcomponents = removeIndexFromArray(outp[cind].subcomponents, sind);
            return outp;
        })
    }

    const findIndexOfSubcomponent = (UID) => {
        let cind = components.findIndex(obj => obj._id === extractFrameID(UID));
        return components[cind].subcomponents.findIndex(obj => obj._id === UID);
    }

    let triggerModule = () => {};
    const _setTriggerModule = (func) => {
        if (typeof func !== 'function') {
            console.error("_setTriggerModule didn't recieve a function: " + func)
        }
        triggerModule = func;
    } 


    const __subcomponent = {
        changeType: (UID, type) => {
            if (!["box", "round", "text"].includes(type)) {
                console.error("ElementsContext: __subcomponent.changeType didn't recieve a correct type: " + type);
                return null;
            }

            let cind = findIndexOfUID(extractFrameID(UID));
            let sind = findIndexOfSubcomponent(UID);

            setComponents(prev => {
                let outp = [...prev];
                outp[cind].subcomponents[sind] = {
                    ...outp[cind].subcomponents[sind],
                    type: type
                }
                return outp;
            })
        },

        /**
         * Changes a key within the `custom` object of a specific subcomponent
         * @param {string} UID - Unique identified of the subcomponent
         * @param {string} key - The key that should be changed within the `custom` object
         * @param {any} value - The value that the key should be changed to
         */
        changeCustom: (UID, key, value) => {
            let cind = findIndexOfUID(extractFrameID(UID));
            let sind = findIndexOfSubcomponent(UID);
            try {
                setComponents(prev => {
                    let outp = [...prev];
                    outp[cind].subcomponents[sind].custom[key].value = value;
                    return outp;
                })
            } catch (ex) {
                console.warn("__subcomponents.changeCustom - An error occured: " + ex);
            }
        },

        /**
         * Toggles `on` key of a specific property within the `custom` object
         * @param {string} UID - Unique identified of the subcomponent
         * @param {string} key - The key that should be changed within the `custom` object
         */
        toggleCustom: (UID, key) => {
            let cind = findIndexOfUID(extractFrameID(UID));
            let sind = findIndexOfSubcomponent(UID);
            try {
                setComponents(prev => {
                    let outp = [...prev];
                    outp[cind].subcomponents[sind].custom[key].on = !outp[cind].subcomponents[sind].custom[key].on;
                    return outp;
                })
            } catch (ex) {
                console.warn("__subcomponents.changeCustom - An error occured: " + ex);
            }
        }
    }

    return (
        <ElementsContext.Provider 
            value={{
                other: {
                    modal: {
                        trigger: triggerModule,
                        _set: _setTriggerModule
                    }
                },
                components: {
                    _scaling: {
                        value: _scaling,
                        set: _setScaling
                    },
                    selected: {
                        value: selected,
                        select: selectComponent
                    },
                    getIndexOf: findIndexOfUID,
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
                    getIndexOf: findIndexOfSubcomponent,
                    selected: {
                        value: selectedSubcomponent,
                        select: selectSubcomponent
                    },
                    add: addSubcomponent,
                    remove: removeSubcomponent,
                    updatePos: updateSubcomponentPosition,
                    updateSize: updateSubcomponentSize,
                    changeType: __subcomponent.changeType,
                    changeCustom: __subcomponent.changeCustom,
                    toggleCustom: __subcomponent.toggleCustom,
                    hover: {
                        start: (UID) => hoverSubcomponentApplyStyles("start", UID),
                        end: (UID) => hoverSubcomponentApplyStyles("end", UID)
                    },
                },
                snaplines: {
                    value: snaplines,
                    update: (UID) => updateSnapline(UID, "frame"),
                    subcomponents: {
                        value: subcomponentSnaplines,
                        update: (UID) => updateSubcomponentSnapline(UID, "subcomponent"),
                    }
                }
            }}
        >
            {children}
        </ElementsContext.Provider>
    );
};

export { ElementsContextProvider, ElementsContext }