import React from 'react'
import { SketchPicker } from 'react-color';
import { ICONS } from '../ICONS'
import { ElementsContext } from '../../../../context/ElementsContext'

export const SelectedFrame = (props) => {
    const {components} = React.useContext(ElementsContext);
    
    /**
     * Sets a frame property to value
     * @param {string} prop - `Object[prop]`
     * @param {string} value - `Object[prop] = value`
     */
    const onChangeProperty = (prop, value) => {
        components.changeCustom(props.component._id, prop, value.huid_sanitizeID());
    }

    return (
        <>
            <div className='-group-with-title'>
                <div className="-sidebar-details-type-title">
                    Custom:
                </div>
                <div className='-group-with-title-content'>
                    <SpaceBetween>
                        <div className='-navbar-checkbox-title'>
                            ID:&nbsp;&nbsp;
                        </div>
                        <input 
                            className='-specifics-input value' 
                            value={props.component.id} 
                            onChange={(e) => onChangeProperty("id", e.target.value)}
                            style={{fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85vmax'}}
                        />
                    </SpaceBetween>
                    <SpaceBetween xs={props.component.clickable ? {} : {opacity: "0.5", pointerEvents: 'none'}}>
                        <Checkbox 
                            x={() => components.toggleCustom(props.component._id, "clickable")} 
                            activated={props.component.clickable} 
                            xs={{opacity: '1', pointerEvents: 'all'}}
                        >
                            Clickable&nbsp;&nbsp;
                        </Checkbox>
                    </SpaceBetween>
                    <SpaceBetween xs={props.component.visible ? {} : {opacity: "0.5", pointerEvents: 'none'}}>
                        <Checkbox 
                            x={() => components.toggleCustom(props.component._id, "visible")} 
                            activated={props.component.visible} 
                            xs={{opacity: '1', pointerEvents: 'all'}}
                        >
                            Visible&nbsp;&nbsp;
                        </Checkbox>
                    </SpaceBetween>
                </div>
            </div>
        </>
    )
}

export const SelectedText = (props) => {
    const {subcomponents} = React.useContext(ElementsContext);

    // * if picker is on
    const [color, setColor] = React.useState(false);
    
    const onChangeText = (e) => {
        subcomponents.changeCustom(props.component._id, "value", e.target.value);
    }

    const onChangeColor = (opt) => {
        subcomponents.changeCustom(props.component._id, "color", rgbaToHex(opt.rgb))
    }

    const changeAlignment = (dir) => subcomponents.changeCustom(props.component._id, "align", dir)

    return (
        <>
            <div className="-sidebar-details-type-section-wrapper" style={{}}>
                <div className="-sidebar-details-type-title">
                    Align:
                </div>
                <div className="-sidebar-details-type-wrapper second" style={{height: '100%'}}>
                    <div 
                        className={`-sidebar-details-type ${props.component.custom.align.value === "left" ? "enabled" : ""}`}
                        onClick={() => changeAlignment("left")}
                    >
                        {ICONS.alignleft}
                    </div>
                    <div 
                        className={`-sidebar-details-type ${props.component.custom.align.value === "center" ? "enabled" : ""}`}
                        onClick={() => changeAlignment("center")}
                    >
                        {ICONS.aligncenter}
                    </div>
                    <div 
                        className={`-sidebar-details-type ${props.component.custom.align.value === "right" ? "enabled" : ""}`}
                        onClick={() => changeAlignment("right")}
                    >
                        {ICONS.alignright}
                    </div>
                </div>
            </div>
            <div className='-group-with-title'>
                <div className="-sidebar-details-type-title">
                    Custom:
                </div>
                <div className="-group-with-title-content">
                    <SpaceBetween>
                        <div className='-navbar-checkbox-title'>
                            Value:&nbsp;&nbsp;
                        </div>
                        <input className='-specifics-input value' value={props.component.custom.value.value} onChange={onChangeText}/>
                    </SpaceBetween>
                    <SpaceBetween xs={props.component.custom.color.on ? {} : {opacity: "0.5", pointerEvents: 'none'}}>
                        <div className='-navbar-checkbox-title'>
                            Font color:&nbsp;&nbsp;
                        </div>
                        <div className='-specifics-input absolute'>
                            {props.component.custom.color.value}
                        </div>
                        <div className='-picker-trigger-wrapper'>
                            {
                                color
                                &&
                                <PickerWrapper>
                                    <SketchPicker className="-styled-sketch-picker" color={props.component.custom.color.value} onChange={onChangeColor} />
                                </PickerWrapper>
                            }
                            <div className='-picker-trigger' onClick={() => setColor(p => !p)} style={{background: props.component.custom.color.value}}></div>
                        </div>
                    </SpaceBetween>
                </div>
            </div>
        </>
    )
}




export const SelectedBox = (props) => {
    const {subcomponents} = React.useContext(ElementsContext);

    /**
     * It's too late now, but I've realized this shouldn't be named `colors` because of the width property (it's not a color)
     */
    const [colors, setColors] = React.useState({
        fill: {
            value: props.component.custom.fill.value,
            active: false
        },
        stroke: {
            value: props.component.custom.stroke.value,
            active: false
        },
        width: {
            value: props.component.custom.width.value,
            active: false,
        }
    })


    const setPickerColor = (opt, key) => {
        setColors(prev => {
            let outp = {...prev};
            outp[key] = {...outp[key], value: rgbaToHex(opt.rgb)};
            return outp;
        })
        subcomponents.changeCustom(props.component._id, key, rgbaToHex(opt.rgb));
    }

    /**
     * Flips `active` property of a specific key
     * @param {string} key - Key within `colors` object whose `active` property should be flipped
     * @returns 
     */
    const triggerColorPicker = (key) => setColors(prev => {
        let outp = {...prev};
        outp[key] = {...outp[key], active: !outp[key].active};
        return outp;
    })

    const changeWidth = (e) => {
        const sanitizeString = (inputString) => inputString.replace(/\D/g, '');

        let sanitized = sanitizeString(e.target.value);

        if (!sanitized) {
            sanitized = "";
        }


        setColors(prev => {
            let outp = {...prev};
            outp["width"].value = sanitized;
            return outp;
        })

        if (sanitized) {
            subcomponents.changeCustom(props.component._id, "width", sanitized);
        }
    }
    
    return (
        <>
            <div className="-sidebar-details-type-title">
                Custom:
            </div>
            <SpaceBetween xs={props.component.custom.fill.on ? {} : {opacity: "0.5", pointerEvents: 'none'}}>
                <Checkbox 
                    x={() => subcomponents.toggleCustom(props.component._id, "fill")} 
                    activated={props.component.custom.fill.on} 
                    xs={{opacity: '1', pointerEvents: 'all'}}
                >
                    Fill&nbsp;&nbsp;
                </Checkbox>
                <div className='-specifics-input absolute'>
                    {colors.fill.value}
                </div>
                <div className='-picker-trigger-wrapper'>
                    {
                        colors.fill.active
                        &&
                        <PickerWrapper>
                            <SketchPicker className="-styled-sketch-picker" color={colors.fill.value} onChange={(opt) => setPickerColor(opt, "fill")} />
                        </PickerWrapper>
                    }
                    <div className='-picker-trigger' onClick={() => triggerColorPicker("fill")} style={{background: colors.fill.value}}></div>
                </div>
            </SpaceBetween>
            <SpaceBetween xs={props.component.custom.stroke.on ? {} : {opacity: "0.5", pointerEvents: 'none'}}>
                <Checkbox 
                    x={() => subcomponents.toggleCustom(props.component._id, "stroke")} 
                    activated={props.component.custom.stroke.on} 
                    xs={{opacity: '1', pointerEvents: 'all'}}
                >
                    Border color (stroke)&nbsp;&nbsp;
                </Checkbox>
                <div className='-specifics-input absolute'>
                    {colors.stroke.value}
                </div>
                <div className='-picker-trigger-wrapper'>
                    {
                        colors.stroke.active
                        &&
                        <PickerWrapper>
                            <SketchPicker className="-styled-sketch-picker" color={colors.stroke.value} onChange={(opt) => setPickerColor(opt, "stroke")} />
                        </PickerWrapper>
                    }
                    <div className='-picker-trigger' onClick={() => triggerColorPicker("stroke")} style={{background: colors.stroke.value}}></div>
                </div>
            </SpaceBetween>
            <SpaceBetween xs={props.component.custom.width.on ? {} : {opacity: "0.5", pointerEvents: 'none'}}>
                <Checkbox 
                    x={() => subcomponents.toggleCustom(props.component._id, "width")} 
                    activated={props.component.custom.width.on} 
                    xs={{opacity: '1', pointerEvents: 'all'}}
                >
                    Border width&nbsp;&nbsp;
                </Checkbox>
                <input className='-specifics-input width' value={colors.width.value} onChange={changeWidth}/>
            </SpaceBetween>
        </>
    )
}


const PickerWrapper = (props) => {
    return (
        <div style={{position: 'absolute', left: '110%', bottom: '0', zIndex: '999999'}}>
            {props.children}
        </div>
    )
} 

const SpaceBetween = (props) => {
    return (
        <div className='-space-between' style={props.xs ? props.xs : {}}>
            {props.children}
        </div>
    )
}

function Checkbox(props) {
    return (
        <div className="-sidebar-checkbox-wrapper" onClick={props.x} style={props.xs ? props.xs : {}}>
            <div className={`-navbar-checkbox ${props.activated ? "enabled" : "disabled"}`}>
                <div className='-navbar-checkbox-circle'/>
            </div>
            <div className='-navbar-checkbox-title'>
                {props.children}
            </div>
        </div>
    )
}



function rgbaToHex({ r, g, b, a }) {
    // Ensure the values are in the valid range (0-255)
    r = Math.round(Math.min(255, Math.max(0, r)));
    g = Math.round(Math.min(255, Math.max(0, g)));
    b = Math.round(Math.min(255, Math.max(0, b)));
    a = Math.round(Math.min(1, Math.max(0, a || 1)) * 255);

    // Convert to hexadecimal representation
    const hex = (component) => {
        const hexValue = component.toString(16).toUpperCase();
        return hexValue.length === 1 ? '0' + hexValue : hexValue;
    };

    const hexR = hex(r);
    const hexG = hex(g);
    const hexB = hex(b);
    const hexA = hex(a);

    // Combine the components and return the hex value
    return `#${hexR}${hexG}${hexB}${hexA}`;
}
