import React from 'react'
import { ElementsContext } from '../../../context/ElementsContext';
import { OptionsContext } from '../../../context/OptionsContext';


const SNAPLINING_OFFSET = 1;

export default function ScaleToolOverlay(props) {
    const [direction, setDirection] = React.useState("none");
    const directionRef = React.useRef(null);
    directionRef.current = direction;

    const {components, snaplines} = React.useContext(ElementsContext);
    const {options} = React.useContext(OptionsContext);


    const startScale = (direction) => {
        components._scaling.set(true);
        setDirection(direction);
        window.addEventListener("mousemove", handleScale);
        window.addEventListener("mouseup", endScale);
    }


    const handleScale = (e) => {
        const containerRect = props.mainRef.current.getBoundingClientRect();
        let mouseX, mouseY, percentX = null, percentY = null;

        //calculating one of these is always unnecessary, but adding an if would probably cause impact performance more than calculating
        mouseX = e.clientX - containerRect.left;
        mouseY = e.clientY - containerRect.top;
        
        //mightve fucked up
        if (["top", "bottom"].includes(directionRef.current)) {
            percentX = checkScaleSnaplines("horizontal", (mouseY / containerRect.height) * 100);
        } else {
            percentY = checkScaleSnaplines("vertical", (mouseX / containerRect.width) * 100);
        }

        components.updateSize(props.component._id, {direction: directionRef.current, value: percentX ? percentX : percentY});
    }


    const endScale = () => {
        setTimeout(() => {
            components._scaling.set(false);
        }, 10)
        window.removeEventListener("mousemove", handleScale);
        window.removeEventListener("mouseup", endScale);
        setTimeout(() => {
            snaplines.update(props.component._id);
        }, 1000)
        props.controlSnaplines.empty();
        setDirection("none");
    }

    const checkScaleSnaplines = (direction, value) => {
        if (!options.value.snaplines) return value;

        let ref = snaplines.value;
        const CONTROL_SNAPLINE_DIRECTION = direction === "horizontal" ? "y" : "x";

        for (let UID of Object.keys(ref)) {
            if (UID === props.component._id) continue;

            for (let snapline of ref[UID]["auxillary"][direction]) {
                if ((value > (snapline - SNAPLINING_OFFSET)) && (value < (snapline + SNAPLINING_OFFSET))) {
                    props.controlSnaplines.activate(CONTROL_SNAPLINE_DIRECTION, snapline);
                    return snapline;
                }
            }
        }

        props.controlSnaplines.deactivate(CONTROL_SNAPLINE_DIRECTION);
        return value;
    };

    return (
        <>
            <div onMouseDown={() => startScale("top")} className='-SCALE-NOTCH -SCALE-NOTCH-TOP'/>
            <div onMouseDown={() => startScale("left")} className='-SCALE-NOTCH -SCALE-NOTCH-LEFT'/>
            <div onMouseDown={() => startScale("right")} className='-SCALE-NOTCH -SCALE-NOTCH-RIGHT'/>
            <div onMouseDown={() => startScale("bottom")} className='-SCALE-NOTCH -SCALE-NOTCH-BOTTOM'/>
        </>
    )
}
