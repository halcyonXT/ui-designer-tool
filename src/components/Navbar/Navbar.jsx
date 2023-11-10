import React from 'react'
import './Navbar.css';
import Logo from './Logo';
import { OptionsContext } from '../../context/OptionsContext';

const ICONS = {
    pointer_tool: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m314.615-393.076 87.078-121.539h182.693L314.615-726.77v333.694Zm230.231 276.15L405.615-416.617 254.616-205.773v-644.225l503.073 395.382H497.922l137.845 295.152-90.921 42.538ZM401.693-514.615Z"/></svg>,
    drag_tool: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80 310-250l57-57 73 73v-206H235l73 72-58 58L80-480l169-169 57 57-72 72h206v-206l-73 73-57-57 170-170 170 170-57 57-73-73v206h205l-73-72 58-58 170 170-170 170-57-57 73-73H520v205l72-73 58 58L480-80Z"/></svg>,
    scale_tool: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M120-440v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-160H600v-80h240v240h-80ZM120-120v-240h80v160h160v80H120Z"/></svg>,
}


export default function Navbar() {
    const {overlayOpacity, tool, options} = React.useContext(OptionsContext);

    const changeOpacity = (e) => {
        overlayOpacity.set(e.target.value);
    }

    const toggleOption = (option) => {
        options.set(prev => {
            let outp = {...prev};
            outp[option] = !outp[option];
            return outp;
        })
    }

    return (
        <div className='-navbar'>
            <Logo/>
            <Option>
                <h6>Game UI opacity:</h6>
                <input type="range" className="win10-thumb -overlay-slider" min="0" max="100" value={overlayOpacity.value} onChange={changeOpacity}/>
            </Option>
            <Button shortcut="M" current={tool.value} val='pointer' x={() => tool.set("pointer")}>
                {ICONS.pointer_tool}
            </Button>
            <Button shortcut="H" current={tool.value} val='drag' x={() => tool.set("drag")}>
                {ICONS.drag_tool}
            </Button>
            <Button shortcut="B" current={tool.value} val='scale' x={() => tool.set("scale")}>
                {ICONS.scale_tool}
            </Button>
            <div className="-navbar-separator"/>
            <Checkboxes>
                <Checkbox x={() => toggleOption("snaplines")} activated={options.value.snaplines}>
                    Snaplines
                </Checkbox>
                <Checkbox x={() => toggleOption("borders")} activated={options.value.borders}>
                    Borders
                </Checkbox>
            </Checkboxes>

        </div>
    )
}

function Checkbox(props) {
    return (
        <div className="-navbar-checkbox-wrapper" onClick={props.x}>
            <div className={`-navbar-checkbox ${props.activated ? "enabled" : "disabled"}`}>
                <div className='-navbar-checkbox-circle'/>
            </div>
            <div className='-navbar-checkbox-title'>
                {props.children}
            </div>
        </div>
    )
}

function Checkboxes(props) {
    return (
        <div className="-navbar-checkboxes">
            {
                props.children
            }
        </div>
    )
}

function Button(props) {
    return (
        <div onClick={props.x} className={`-navbar-button ${props.val && (props.val === props.current) && '-navbar-option-enabled'}`}>
            <div className='-navbar-button-shortcut-overlay'>[{props.shortcut}]</div>
            {props.children}
        </div>
    )
}

function Option(props) {
    return (
        <div className='-navbar-option'>
            {props.children}
        </div>
    )
}

/***const DEFAULT_ICON_STYLES = {
    height: '80%',
    fill: 'var(--nonaccent)',
    aspectRatio: '1 / 1'
} */
