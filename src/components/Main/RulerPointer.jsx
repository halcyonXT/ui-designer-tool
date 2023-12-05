import React from 'react'
import { ElementsContext } from '../../context/ElementsContext';

// TODO - IMPLEMENT THIS
function calculateInnermostSize(middleWidthPercent, middleHeightPercent, innerWidthPercent, innerHeightPercent) {
    let outerWidth = 100;
    let outerHeight = 100;
    // Calculate the size of the middle rectangle
    const middleWidth = (middleWidthPercent / 100) * outerWidth;
    const middleHeight = (middleHeightPercent / 100) * outerHeight;

    // Calculate the size of the innermost rectangle
    const innerWidth = (innerWidthPercent / 100) * middleWidth;
    const innerHeight = (innerHeightPercent / 100) * middleHeight;

    return { innerWidth, innerHeight };
}

export default function RulerPointer(props) {
    const [value, setValue] = React.useState(0);
    const [auxillaries, setAuxillaries] = React.useState([null, null, null]);
    const [current, setCurrent] = React.useState({
        isSubcomponent: false,
        styles: {}
    })
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
            try {
                let cind = components.getIndexOf(subcomponents.selected.value.split("_")[0]);
                let sind = subcomponents.getIndexOf(subcomponents.selected.value);
    
                let ref = {...components.value[cind].subcomponents[sind].position};
    
                let aux = props.direction === "x" 
                        ? 
                        [ref.x, (ref.x + (ref.x + ref.width)) / 2, ref.x + ref.width] 
                        : 
                        [ref.y, (ref.y + (ref.y + ref.height)) / 2, ref.y + ref.height];
    
                setAuxillaries(aux);

                setCurrent({
                    isSubcomponent: true,
                    styles: (() => {
                        let outp = {};
                        let newref = components.value[cind].position;
                        if (props.direction === "x") {
                            outp.left = newref.x + "%";
                            outp.width = newref.width + "%";
                        } else {
                            outp.top = newref.y + "%";
                            outp.height = newref.height + "%";
                        }
                        return outp;
                    })(),
                })
            } catch (ex) {console.warn("Failed to render auxillary ruler pointers" + ex)}
        } else if (components.selected.value !== null) {
            try {
                let cind = components.value.findIndex(obj => obj._id === components.selected.value);
    
                let ref = components.value[cind].position;
    
                let aux = props.direction === "x" 
                    ? 
                    [ref.x, (ref.x + (ref.x + ref.width)) / 2, ref.x + ref.width] 
                    : 
                    [ref.y, (ref.y + (ref.y + ref.height)) / 2, ref.y + ref.height];
    
                setAuxillaries(aux);
                setCurrent({
                    isSubcomponent: false,
                    styles: {}
                })
            } catch (ex) {console.warn("Failed to render auxillary ruler pointers")}
        } else {
            setAuxillaries([null, null, null])
        }
    }, [components, subcomponents])

    return (
        <>
            <div 
                className={`-RULER-POINTER-${props.direction.toUpperCase()}-WRAPPER`}
                style={
                    current.isSubcomponent
                    ?
                    current.styles
                    :
                    {}
                }
            >
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
                
            </div>
            <div className={`-RULER-POINTER-${props.direction.toUpperCase()}-WRAPPER`}>
                <div 
                    style={props.direction === "x" ? {left: `${value}px`} : {top: `${value}px`}} 
                    className={props.direction === "x" ? "-RULER-POINTER-X" : "-RULER-POINTER-Y"}>
                </div>
            </div>
        </>
    )
}
