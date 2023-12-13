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

Number.prototype.roundToDecimalPlace = function(decimal) {
    let mult = Math.pow(10, decimal);
    return Math.round(this * mult) / mult;
}

String.prototype.roundToDecimalPlace = function(decimal) {
    let newthis = Number(this);
    let mult = Math.pow(10, decimal);
    return String(Math.round(newthis * mult) / mult);
}

String.prototype.huid_sanitizeID = function() {
    return this.replace(/ /g, '_').replace(/"/g, '');
}



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

const EMPTY_SELECTED = () => ({type: "none"})

const ElementsContextProvider = ({ children }) => {
    const [selected, setSelected] = React.useState(null);
    const [selectedSubcomponent, setSelectedSubcomponent] = React.useState(null) 
    const selectedRef = React.useRef(null);
    selectedRef.current = {
        frame: selected,
        subcomponent: selectedSubcomponent
    };

    const [components, setComponents] = React.useState([]);
    const [_scaling, _setScaling] = React.useState(false);
    const componentsRef = React.useRef(null);
    componentsRef.current = components;

    const [snaplines, setSnaplines] = React.useState({viewportCenter: viewportCenterSnapline()});
    //const [_lastRememberedScaleDimension, _setLastRememberedScaleDimension] = React.useState(null);

    const [subcomponentSnaplines, setSubcomponentSnaplines] = React.useState({parentCenter: viewportCenterSnapline()})
    const [modal, setModal] = React.useState({
        active: false,
        element: <></>
    })

    const {options} = React.useContext(OptionsContext);

    // ! COPYING
    const [clipboard, setClipboard] = React.useState({
        element: EMPTY_SELECTED()
    })
    const clipboardRef = React.useRef(null);
    clipboardRef.current = clipboard;

    

    useEffect(() => {
        // ! COPYING PARSER
        const _keydownParser = (event) => {

            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return
            }

            const key = event.key.toUpperCase();

            switch (key) {
                case 'C':
                    __other.copyCurrentSelected();
                    break;
                case 'D':
                    __other.duplicate(extractFrameID(__other.copyCurrentSelected(true).element._id));
                    break;
                case 'V':
                    __other.pasteElementFromClipboard(extractFrameID(__other.copyCurrentSelected(true).element._id));
                    break
                default:
                    break;
            }
        }

        window.addEventListener('keypress', _keydownParser);

        return () => {
            window.removeEventListener('keypress', _keydownParser);
        }
    }, [])


    const clamp = (min, val, max) => {
        let outp;
        function roundToX(number, x) {
            return Math.round(number / x) * x;
        }
        if (!options.value.borders) {
            outp = Number(val); 
        } else {
            outp = Math.max(min, Math.min(val, max));
        }
        if (options.value.grid.snapTo) {
            return roundToX(outp, Number(options.value.grid.size.slice(0, -1)))
        } else return outp
    }

    const findIndexOfUID = (UID) => componentsRef.current.findIndex(obj => obj._id === UID); 
    

    const addSubcomponent = (UID, options = null) => {
        let ind = findIndexOfUID(UID);
        let sbcUID = createUID();
        const STATIC_ON = true;

        const DEFAULT = () => ({
            type: 'box',
            position: {
                x: 0,
                y: 0,
                width: 40,
                height: 40
            },
            custom: {
                stroke: {on: false, value: "#DCDCDCFF"},
                width: {on: false, value: "1"},
                value: {on: STATIC_ON, value: "new text"},
                color: {on: STATIC_ON, value: "#DCDCDCFF"},
                fill: {on: false, value: "#DCDCDCFF"},
                align: {on: STATIC_ON, value: 'left'}
            }
        })

        const ref = options ? {...options} : DEFAULT();

        let newUID = `${UID}_${sbcUID}`

        // ! type: 'box', 'text' or 'round'
        setComponents(prev => {
            let outp = [...prev];
            

            outp[ind].subcomponents = [...outp[ind].subcomponents, {
                _id: newUID,
                _privateStyles: {},
                id: `Subcomponent_${outp[ind].subcomponents.length + 1}`,
                type: ref.type,
                position: {...ref.position},
                custom: (() => {
                    let outp = {...ref.custom};
                    for (let key of Object.keys(outp)) {
                        outp[key] = {...outp[key]}
                    }
                    return outp;
                })()
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

    const addComponent = (options = null) => {
        ++counter;
        let UID = createUID();

        const DEFAULT = () => ({
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
        })

        const ref = (options) ? (options.clickable === undefined ? {...DEFAULT()} : {...options}) : {...DEFAULT()};

        setComponents(prev => [...prev, {
            _id: UID,
            _privateStyles: {},
            _componentCollapsed: false,
            type: 'frame',
            id: `Frame_${counter}`,
            position: {...ref.position},
            visible: ref.visible,
            clickable: ref.clickable,
            shortcut: ref.shortcut,
            subcomponents: ref.subcomponents?.length > 0 ? ref.subcomponents.map(item => {
                let outp = {...item};
                outp._id = `${UID}_${createUID()}`;
                outp.position = {...outp.position};
                outp.custom = (() => {
                    let ret = {...outp.custom};
                    for (let key of Object.keys(ret)) {
                        ret[key] = {...ret[key]}
                    }
                    return ret
                })();
                return outp
            }) : []
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
                    outline: "2px dashed #6dffff",
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
                            let newheight = clamp(0, ref.position.height + (ref.position.y - options.value), 100);
                            if (newy === 0) {
                                return {
                                    y: 0,
                                    height: (ref.position.height + ref.position.y)
                                }
                            }
                            if (newheight === 0) {
                                return {
                                    y: (ref.position.height + ref.position.y),
                                    height: 0
                                }
                            }
                            return {
                                y: newy,
                                height: newheight
                            }
                        })();
                    case "bottom":
                        return (() => {
                            let newy = ref.position.y;
                            let newheight = options.value - ref.position.y;
                            newheight = clamp(0, newheight, 100 - newy);
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
                            let newwidth = clamp(0, ref.position.width + (ref.position.x - options.value), 100);
                            if (newwidth === 0) {
                                return {
                                    x: (ref.position.width + ref.position.x),
                                    width: 0
                                }
                            }
                            return {
                                x: newx,
                                width: newwidth
                            }
                        })();
                    case "right":
                        return (() => {
                            let newx = ref.position.x;
                            let newwidth = options.value - ref.position.x;
                            newwidth = clamp(0, newwidth, 100 - newx);
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

    const toggleModal = (element) => {
        try {
            if (!modal.active) {
                setModal(prev => ({
                    active: !prev.active,
                    element: 
                    <div 
                        className='-modal-prompt-wrapper' 
                        onClick={(e) => e.target.classList.contains("-modal-prompt-wrapper") && toggleModal()}>
                        <div className='-modal-prompt'>
                            <div className='-modal-prompt-content'>
                                {element}
                            </div>
                        </div>
                    </div>
                }))
            } else {
                setModal({active: false, element: <></>})
            }
        } catch (ex) {
            console.warn(`Bad modal trigger: ` + ex);
        }
    }
    const __other = {
        /**
         * 
         * @param {string} status - `error`, `success` or `warn` 
         * @param {string} id - ID attribute of your element 
         */
        _animationStatus: (status, query) => {
            try {
                let newstatus = status.toLowerCase().trim();
                const COLORS = {
                    'error': '#ff3d98',
                    'success': '#3dffa4',
                    'warn': '#ffec3d'
                }
                let target = document.querySelector(query);
                target.animate([
                    {fill: `${COLORS[newstatus]}`},
                    {fill: `var(--subnonaccent)`}
                ], {
                    duration: 700,
                    delay: 0,
                    fill: 'forwards'
                })
            } catch (ex) {
                console.warn('__other._animationStatus failure: ' + ex)
            }
        },
        // ! Pasting parser
        pasteElementFromClipboard: (targetUID) => {
            try {
                let current = {...clipboardRef.current.element};
    
                if (current.type !== "none") {
                    if (current.type === "frame") {
                        addComponent({...current})
                    } else {
                        addSubcomponent(targetUID, current);
                    }
                } 
                __other._animationStatus('success', '#paste_btn > svg')
            } catch (ex) {
                console.warn(`Pasting exception: ` + ex);
                __other._animationStatus('error', '#paste_btn > svg')
            }
        },

        copyCurrentSelected: (returnValue = false) => {
            try {
                let cselected;
        
                if (selectedRef.current.subcomponent) {
                    let cind = componentsRef.current.findIndex(obj => obj._id === extractFrameID(selectedRef.current.subcomponent));
                    let sind = componentsRef.current[cind].subcomponents.findIndex(obj => obj._id === selectedRef.current.subcomponent)
                    cselected = {...componentsRef.current[cind].subcomponents[sind]}
                } else if (selectedRef.current.frame) {
                    let cind = componentsRef.current.findIndex(obj => obj._id === selectedRef.current.frame);
                    cselected = {...componentsRef.current[cind]}
                } else {
                    cselected = EMPTY_SELECTED();
                }
        
                if (returnValue) {
                    return {
                        element: {...cselected}
                    }
                }
    
                setClipboard(prev => ({
                    ...prev,
                    element: {...cselected}
                }));

                __other._animationStatus('success', '#copy_btn > svg')
            } catch (ex) {
                console.warn(`Copy exception: ` + ex);
                __other._animationStatus('error', '#copy > svg')
            }
        },

        duplicate: function(UID) {
            try {
                let current = __other.copyCurrentSelected(true);
    
                if (current) {
                    if (current.element.type === "frame") {
                        addComponent({...current.element})
                    } else {
                        addSubcomponent(UID, current.element)
                    }
                }

                __other._animationStatus('success', '#duplicate_btn > svg')
            } catch (ex) {
                console.warn(`Duplicate exception: ` + ex);
                __other._animationStatus('error', '#duplicate_btn > svg')
            }
        }
    }

    const __subcomponent = {
        /**
         * Used only internally for `__components.exportCode`
         */
        _parseCodeOfSubcomponents: (UID) => {
            let outp = [];
            let checks = {
                box: ["fill", "stroke", "width"],
                round: ["fill", "stroke", "width"],
                text: ["align", "value", "color"]
            }

            for (let cur of components[findIndexOfUID(UID)].subcomponents) {

                let unconcatenated = [];
                let pos = {...cur.position};
                for (let key of Object.keys(pos)) {
                    pos[key] = Number(pos[key]).roundToDecimalPlace(2);
                }

                unconcatenated.push(`type: "${cur.type}"`);
                unconcatenated.push(`position: [${pos.x}, ${pos.y}, ${pos.width}, ${pos.height}]`);

                for (let key of checks[cur.type]) {
                    if (cur.custom[key].on) {
                        unconcatenated.push(`${key}: ` + (key === "width" ? cur.custom[key].value : `"${cur.custom[key].value}"`));
                    }
                }

                if (outp.length >= 1) {
                    outp.push(`        {` + unconcatenated.join(", ") + "},")
                } else {
                    outp.push("{" + unconcatenated.join(", ") + "},")
                }
            }

            return outp.join("\n")
        },

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

    const __component = {
        /**
         * Works regardless of whether a subcomponent id or a frame id is passed in
         * @param {string} UID 
         */
        getExportCode: (UID) => {
            let id = UID.indexOf("_") > -1 ? extractFrameID(UID) : UID;
            let cind = findIndexOfUID(id);
            let ref = components[cind];
            let pos = {...ref.position};

            

            for (let key of Object.keys(pos)) {
                pos[key] = Number(pos[key]).roundToDecimalPlace(2);
            }
            // ! dont add any tabs, whitespace is preserved
            let formattedCode =
`event.ship.setUIComponent({
    id: "${ref.id.huid_sanitizeID()}",
    position: [${pos.x}, ${pos.y}, ${pos.width}, ${pos.height}],
    clickable: ${ref.clickable},
    visible: ${ref.visible},
    components: [
        ${__subcomponent._parseCodeOfSubcomponents(id)}
    ]
})`
            return formattedCode;
        },

        /**
         * Changes a key within the `custom` object of a specific frame
         * @param {string} UID - Unique identified of the frame
         * @param {string} key - The key that should be changed 
         * @param {any} value - The value that the key should be changed to
         */
        changeCustom: (UID, key, value) => {
            let cind = findIndexOfUID(UID);
            try {
                setComponents(prev => {
                    let outp = [...prev];
                    outp[cind][key] = value;
                    return outp;
                })
            } catch (ex) {
                console.warn("__components.changeCustom - An error occured: " + ex);
            }
        },

        toggleCustom: (UID, key) => {
            let cind = findIndexOfUID(UID);
            try {
                setComponents(prev => {
                    let outp = [...prev];
                    outp[cind][key] = !outp[cind][key];
                    return outp;
                })
            } catch (ex) {
                console.warn("__components.toggleCustom - An error occured: " + ex);
            }
        },

        collapseToggle: (UID) => {
            let cind = findIndexOfUID(extractFrameID(UID));
            setComponents(prev => {
                let outp = [...prev];
                outp[cind]._componentCollapsed = !outp[cind]._componentCollapsed;
                return outp;
            })
        }
    }


    return (
        <ElementsContext.Provider 
            value={{
                other: {
                    modal: {
                        toggle: toggleModal,
                        value: modal
                    },
                    getExportCode: __component.getExportCode,
                    clipboard: {
                        copy: __other.copyCurrentSelected,
                        paste: __other.pasteElementFromClipboard,
                        duplicate: __other.duplicate
                    },
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
                    collapse: __component.collapseToggle,
                    getIndexOf: findIndexOfUID,
                    value: components,
                    set: setComponents,
                    add: addComponent,
                    updatePos: updateComponentPosition,
                    updateSize: updateComponentSize,
                    delete: removeComponent,
                    changeCustom: __component.changeCustom,
                    toggleCustom: __component.toggleCustom,
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
                    // ! lord have mercy, i already used subcomponents.remove without realizing its called `delete` for components
                    remove: removeSubcomponent,
                    delete: removeSubcomponent,
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