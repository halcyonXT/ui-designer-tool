import React from 'react'
import { ElementsContext } from '../../context/ElementsContext';




export default function RulerPointer(props) {
    const [value, setValue] = React.useState(0);
    const [auxillaries, setAuxillaries] = React.useState([null, null, null]);
    const { components, subcomponents } = React.useContext(ElementsContext);

    React.useEffect(() => {
        let main = document.querySelector("#main");

        let mouseMoveHandle = (e) => {
            const container = e.target.closest('#main');

            if (container) {
                // Calculate mouse position relative to the container
                const mouseX = e.pageX - container.offsetLeft;
                const mouseY = e.pageY - container.offsetTop;

                setValue(props.direction === "x" ? Math.max(0, mouseX) : Math.max(0, mouseY))

            }


            //setValue(e[props.direction === "x" ? "offsetX" : "offsetY"])
            
        }

        main.addEventListener('mousemove', mouseMoveHandle);

        return () => {
            main.removeEventListener('mousemove', mouseMoveHandle);
        }
    }, []);

    React.useEffect(() => {
        if (subcomponents.selected.value !== null) {
            /*let cind = components.value.findIndex(obj => obj._id === subcomponents.selected.value.split('_')[0]);
            let sind = components.value[cind].subcomponents.findIndex(obj => obj._id === subcomponents.selected.value);
            let ref = components.value[cind].subcomponents[sind].position;
            let ref2 = components.value[cind].position;
            let aux = props.direction === "x" ? 
                [calculateInnermostLeft(100, Number(ref2.x), Number(ref.x)), calculateInnermostLeft(100, Number(ref2.x) + Number(ref2.width), Number(ref.x) + Number(ref.width))]
                : 
                [calculateInnermostLeft(100, Number(ref2.y), Number(ref.y)), calculateInnermostLeft(100, Number(ref2.y) + Number(ref2.height), Number(ref.y) + Number(ref.height))]

            setAuxillaries(aux)*/
        } else if (components.selected.value !== null) {
            let cind = components.value.findIndex(obj => obj._id === components.selected.value);

            let ref = components.value[cind].position;

            let aux = props.direction === "x" 
                ? 
                [ref.x, (ref.x + (ref.x + ref.width)) / 2, ref.x + ref.width] 
                : 
                [ref.y, (ref.y + (ref.y + ref.height)) / 2, ref.y + ref.height];

            setAuxillaries(aux);
        } else {
            setAuxillaries([null, null, null])
        }
    }, [components, subcomponents])

    return (
        <>
            {
                auxillaries[0] !== null
                &&
                <>
                    <div 
                    style={{...(props.direction === "x" ? {left: `${auxillaries[0]}%`} : {top: `${auxillaries[0]}%`}), background: 'magenta'}} 
                    className={props.direction === "x" ? "-RULER-POINTER-X" : "-RULER-POINTER-Y"}>
                    </div>
                    <div 
                        style={{...(props.direction === "x" ? {left: `${auxillaries[1]}%`} : {top: `${auxillaries[1]}%`}), background: 'pink'}} 
                        className={props.direction === "x" ? "-RULER-POINTER-X" : "-RULER-POINTER-Y"}>
                    </div>
                    <div 
                        style={{...(props.direction === "x" ? {left: `${auxillaries[2]}%`} : {top: `${auxillaries[2]}%`}), background: 'magenta'}} 
                        className={props.direction === "x" ? "-RULER-POINTER-X" : "-RULER-POINTER-Y"}>
                    </div>
                </>
            }
            
            <div 
                style={props.direction === "x" ? {left: `${value}px`} : {top: `${value}px`}} 
                className={props.direction === "x" ? "-RULER-POINTER-X" : "-RULER-POINTER-Y"}>
            </div>
        </>
    )
}
