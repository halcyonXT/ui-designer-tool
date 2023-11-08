import React from 'react'
import './UISubcomponent.css'
import { ElementsContext } from '../../../../context/ElementsContext';
import { OptionsContext } from '../../../../context/OptionsContext';

const CREATE_STYLES = {

    position: (component) => ({
        position: 'absolute',
        left: component.position.x + "%",
        top: component.position.y + "%",
        width: component.position.width + "%",
        height: component.position.height + "%",
        zIndex: '150'
    }),

    debug: () => ({ boxSizing: 'border-box', border: '1px solid orange' }),

    selected: (isSelected) => isSelected ? {outline: `1px dashed magenta`, zIndex: "10000"} : {},

    cursor: (tool) => {
        switch (tool) {
            case "drag":
                return {cursor: "move"};
            case "scale":
            case "pointer":
            default:
                return {cursor: "pointer"}
        }
    },
}


export default function UISubcomponent(props) {
    const {subcomponents} = React.useContext(ElementsContext);
    const {tool} = React.useContext(OptionsContext);
    const componentRef = React.useRef(null);

    const [offset, setOffset] = React.useState({x: null, y: null})
    const offsetRef = React.useRef(null);
    offsetRef.current = offset;

    const startDrag = (e) => {
        setTimeout(() => {
            if (props.parentDragActive) return;
            window.addEventListener('mousemove', dragHandler);
            window.addEventListener('mouseup', endDrag);
            const element1Rect = componentRef.current.getBoundingClientRect();
            let offsetX = e.clientX - element1Rect.left;
            let offsetY = e.clientY - element1Rect.top;
            setOffset({x: offsetX, y: offsetY});
        }, 50)
    }


    const dragHandler = (e) => {
        const containerRect = props.parentRef.current.getBoundingClientRect();

        const mouseX = e.clientX - containerRect.left - offsetRef.current.x;
        const mouseY = e.clientY - containerRect.top - offsetRef.current.y;
        
        const percentX = (mouseX / containerRect.width) * 100;
        const percentY = (mouseY / containerRect.height) * 100;


        subcomponents.updatePos(props.component._id, {x: percentX.toFixed(2), y: percentY.toFixed(2)});
    }


    const endDrag = () => {
        window.removeEventListener('mousemove', dragHandler);
        window.removeEventListener('mouseup', endDrag);
        //snaplines.update(props.component._id);
        //props.controlSnaplines.empty();
        setOffset({x: null, y: null})
    }

    const handleMouseDown = (e) => {
        subcomponents.selected.select(props.component._id);
        tool.value === 'drag' && subcomponents.selected.value === props.component._id && startDrag(e);
    }

    return (
        <div 
            style={{
                ...CREATE_STYLES.position(props.component),
                ...CREATE_STYLES.debug(),
                ...props.component._privateStyles,
                ...CREATE_STYLES.selected(subcomponents.selected.value === props.component._id)
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => subcomponents.hover.start(props.component._id)}
            onMouseLeave={() => subcomponents.hover.end(props.component._id)}
            ref={componentRef}
            onClick={() => subcomponents.selected.select(props.component._id)}
            className='-SUBCOMPONENT'
        >

        </div>
    )
}
