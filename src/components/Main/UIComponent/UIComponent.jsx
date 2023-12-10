import React from 'react'
import './UIComponent.css'
import { ElementsContext } from '../../../context/ElementsContext';
import { OptionsContext } from '../../../context/OptionsContext';
import ScaleToolOverlay from './ScaleToolOverlay';
import UISubcomponent from './UISubcomponent/UISubcomponent';


const CREATE_STYLES = {

    position: (component) => ({
        position: 'absolute',
        left: component.position.x + "%",
        top: component.position.y + "%",
        width: component.position.width + "%",
        height: component.position.height + "%",
    }),

    debug: (isDebug) => isDebug ? ({ boxSizing: 'border-box', outline: '1px solid var(--accent)' }) : ({}),

    selected: (isSelected) => isSelected ? {outline: `2px dashed var(--accent)`, zIndex: "999999"} : {},

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
    
    zIndex: (ind) => ({zIndex: `${ind * 100}`}),

    visible: (isVisible) => isVisible ? ({}) : ({opacity: "0"}),
}


const EMPTY_SNAPLINE = () => ({element: ""});
const SNAPLINING_OFFSET = 1;

let offset = {x: null, y: null};

function roundToX(number, x) {
    return Math.round(number / x) * x;
}

export default function UIComponent(props) {

    const {components, snaplines, subcomponents} = React.useContext(ElementsContext);
    const {tool, options} = React.useContext(OptionsContext);

    const [dragActive, setDragActive] = React.useState(false);
    const dragActiveRef = React.useRef(null);
    dragActiveRef.current = dragActive;

    const [offset, setOffset] = React.useState({x: null, y: null})
    const offsetRef = React.useRef(null);
    offsetRef.current = offset;

    const gridRef = React.useRef(null);

    const componentRef = React.useRef(null);


    const [activeSnaplines, setActiveSnaplines] = React.useState({x: EMPTY_SNAPLINE(), y: EMPTY_SNAPLINE()});

    const activateSnapline = (direction, percentage) => {
        let style = direction === "x" ? ({left: `${percentage}%`}) : ({top: `${percentage}%`});

        setActiveSnaplines(prev => {
            let outp = {...prev};

            let element = <div 
                    style={style}
                    className={`-SUBCOMPONENT-SNAPLINE -SUBCOMPONENT-SNAPLINE-${direction.toUpperCase()}`}
                ></div>;

            outp[direction] = ({
                element: element,
                direction,
                percentage
            })

            return outp;
        })
    }

    const deactivateSnapline = (direction) => {
        setActiveSnaplines(prev => {
            let outp = {...prev};
            outp[direction] = EMPTY_SNAPLINE();
            return outp;
        });
    }
    
    const emptySnaplines = () => setActiveSnaplines({x: EMPTY_SNAPLINE(), y: EMPTY_SNAPLINE()});

    const SNAP_TO_GRID = Number(options.value.grid.size.slice(0, -1));
    
    React.useEffect(() => {
        if (options.value.grid.show) {
            try {
                if (subcomponents.selected.value) {
                    gridRef.current.style.opacity = `1`;
                    gridRef.current.style.backgroundSize = `${options.value.grid.size} ${options.value.grid.size}`;
                } else {
                    gridRef.current.style.opacity = `0`;
                }
            } catch (ex) {
                console.warn("Grid error: " + ex)
            }
        }
    }, [options, subcomponents.selected.value])

    const checkDragSnaplines = (key, percentage) => {
        if (!options.value.snaplines) return percentage;

        let offset = key === "x" ? props.component.position.width : props.component.position.height;
        let newpercentage = percentage + (offset / 2);

        for (let UID of Object.keys(snaplines.value)) {
            if (UID === props.component._id) continue;

            let ref = snaplines.value[UID].center;

            if ((newpercentage > (ref[key] - SNAPLINING_OFFSET)) && (newpercentage < (ref[key] + SNAPLINING_OFFSET))) {
                props.controlSnaplines.activate(key, ref[key]);
                if (options.value.grid.snapTo) {
                    return roundToX(ref[key] - (offset / 2), SNAP_TO_GRID);
                } else return ref[key] - (offset / 2);
            }

        }
        props.controlSnaplines.deactivate(key);
        if (options.value.grid.snapTo) {
            return roundToX(percentage, SNAP_TO_GRID);
        } else return percentage
    }


    const startDrag = (e) => {
        setDragActive(true);
        window.addEventListener('mousemove', dragHandler);
        window.addEventListener('mouseup', endDrag);
        const element1Rect = componentRef.current.getBoundingClientRect();
        let offsetX = e.clientX - element1Rect.left;
        let offsetY = e.clientY - element1Rect.top;
        setOffset({x: offsetX, y: offsetY});
    }


    const dragHandler = (e) => {
        const containerRect = props.mainRef.current.getBoundingClientRect();

        const mouseX = e.clientX - containerRect.left - offsetRef.current.x;
        const mouseY = e.clientY - containerRect.top - offsetRef.current.y;
        
        const percentX = checkDragSnaplines("x", (mouseX / containerRect.width) * 100);
        const percentY = checkDragSnaplines("y", (mouseY / containerRect.height) * 100);


        components.updatePos(props.component._id, {x: percentX.toFixed(2), y: percentY.toFixed(2)});
    }


    const endDrag = () => {
        setDragActive(false);
        window.removeEventListener('mousemove', dragHandler);
        window.removeEventListener('mouseup', endDrag);
        snaplines.update(props.component._id);
        props.controlSnaplines.empty();
        setOffset({x: null, y: null})
    }

    const handleMouseDown = (e) => {
        components.selected.select(props.component._id);
        if (tool.value === "drag") {
            startDrag(e);
        }
    }

    return (
        <div
            style={{ 
                ...CREATE_STYLES.position(props.component), 
                ...CREATE_STYLES.debug(options.value.outlines), 
                ...props.component._privateStyles ,
                ...CREATE_STYLES.zIndex(components.getIndexOf(props.component._id)),
                ...CREATE_STYLES.selected(components.selected.value === props.component._id && subcomponents.selected.value === null) , 
                ...CREATE_STYLES.cursor(tool.value),
            }}
            className='-COMPONENT'
            onMouseDown={handleMouseDown}
            onMouseEnter={() => components.hover.start(props.component._id)}
            onMouseLeave={() => components.hover.end(props.component._id)}
            ref={componentRef}
            id={props.component._id}
        >
            <>
                {
                    // If the current selected component is this component (checked using ids) and the current tool is scale, render ScaleToolOverlay
                    // and if the subcomponent selected value is null
                    props.component._id === components.selected.value 
                    && 
                    tool.value === 'scale'
                    &&
                    !subcomponents.selected.value
                    &&
                    <ScaleToolOverlay mainRef={props.mainRef} controlSnaplines={props.controlSnaplines} component={props.component} />
                }

                {
                    props.component._id === components.selected.value
                    &&
                    options.value.grid.show
                    &&
                    <div className='-grid' ref={gridRef}></div>
                }

                <div 
                    className='-COMPONENT-RELATIVE'
                    style={{
                        ...CREATE_STYLES.visible(props.component.visible)
                    }}
                >
                    {
                        // If snapline x has been activated with controlSnaplines prop in UISubcomponent
                        activeSnaplines.x.element && activeSnaplines.x.element
                    }

                    {
                        // If snapline x has been activated with controlSnaplines prop in UISubcomponent
                        activeSnaplines.y.element && activeSnaplines.y.element
                    }

                    {
                        // If the component hasnt been collapsed, render all subcomponents
                        /*!props.component._componentCollapsed 
                        &&*/
                        props.component.subcomponents.map((item, index) => 
                            <UISubcomponent 
                                key={item._id}
                                parentRef={componentRef}
                                component={item}
                                zIndex={(components.getIndexOf(props.component._id) * 100) + index}
                                parentPosition={props.component.position}
                                controlSnaplines={{activate: activateSnapline, deactivate: deactivateSnapline, empty: emptySnaplines}}
                            />
                        )
                    }
                </div>
            </>
        </div>
    )
}
