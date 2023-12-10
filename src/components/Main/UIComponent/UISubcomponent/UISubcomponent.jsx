import React from 'react'
import './UISubcomponent.css'
import { ElementsContext } from '../../../../context/ElementsContext';
import { OptionsContext } from '../../../../context/OptionsContext';
import ScaleToolOverlaySC from './ScaleToolOverlaySC';

const CREATE_STYLES = {

    position: (component, opts = {snap: false, parent: {}}) => {
        const DEFAULTS = {
            position: 'absolute',
            boxSizing: 'border-box',
        }

        if (!opts.snap) {
            return ({
                ...DEFAULTS,
                left: component.position.x + "%",
                top: component.position.y + "%",
                width: component.position.width + "%",
                height: component.position.height + "%",
            })
        } else {
            //const dimensions = calculateNestedDivDimensions(parent.width, parent.height, component.position.width, component.position.height)
            return ({
                ...DEFAULTS,
                left: component.position.x + "%",
                top: component.position.y + "%",
                width: component.position.width + "%",
                height: component.position.height + "%",
            })
        }
    },

    debug: (isDebug) => isDebug ? ({ boxSizing: 'border-box', outline: '1px solid var(--complement)' }) : ({}),

    selected: (isSelected) => isSelected ? {outline: `2px dashed var(--complement)`, zIndex: "10000"} : {},

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

    zIndex: (z) => ({zIndex: `${z}`}),
    
    compileCustomStyles: ref => {
        let styles = {};
        let round = false;
        switch (ref.type) {
            case "text":
                styles.color = ref.custom.color.value;
                styles.fontWeight = "bold";
                let align = ref.custom.align.value;
                styles.justifyContent = align === "left" ? "flex-start" : align === "center" ? "center" : "flex-end";
                break
            case "round":
                round = true;
            case "box":
                let applicable = [
                    ["fill", "background"], 
                    ["stroke", "borderColor"], 
                    // border width needs special treatment - ["width", "borderWidth"]
                ];
                for (let pair of applicable) {
                    if (ref.custom[pair[0]].on) {
                        styles[pair[1]] = ref.custom[pair[0]].value;
                    }
                }
                if (round) {
                    styles.borderRadius = '50%';
                }
                if (ref.custom["width"].on) {
                    let pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
                    styles.borderWidth = `${ref.custom.width.value / pixelRatio}px`;
                }
                break
        }
        return styles;
    }
}

function calculateNestedDivDimensions(parentWidth, parentHeight, childWidthPercentage, childHeightPercentage) {
    const childWidth = (parentWidth * childWidthPercentage) / 100;
    const childHeight = (parentHeight * childHeightPercentage) / 100;
  
    return {
      width: childWidth,
      height: childHeight
    };
  }


const SNAPLINING_OFFSET = 2;
export default function UISubcomponent(props) {
    const {subcomponents, snaplines} = React.useContext(ElementsContext);
    const {tool, options} = React.useContext(OptionsContext);
    const componentRef = React.useRef(null);

    const [offset, setOffset] = React.useState({x: null, y: null})
    const offsetRef = React.useRef(null);
    offsetRef.current = offset;

    const propsComponentRef = React.useRef(null);
    propsComponentRef.current = props.component;

    // ! Used only for the text type subcomponent, don't touch
    const textRef = React.useRef(null);
    
    const startDrag = (e) => {
        e.stopPropagation();

        window.addEventListener('mousemove', dragHandler);
        window.addEventListener('mouseup', endDrag);

        const element1Rect = componentRef.current.getBoundingClientRect();

        let offsetX = e.clientX - element1Rect.left;
        let offsetY = e.clientY - element1Rect.top;

        setOffset({x: offsetX, y: offsetY});
    }

    const checkDragSnaplines = (key, percentage) => {
        if (!options.value.snaplines) return percentage;

        let offset = key === "x" ? props.component.position.width : props.component.position.height;
        let newpercentage = percentage + (offset / 2);

        const extractFrameID = (UID) => UID.split('_')[0];

        const FRAME_ID = extractFrameID(props.component._id);

        // ! This is only here as a reminder to implment advanced snaplining functionality
        const USER_ALLOWED_CROSS_SUBCOMPONENT_SNAPLINING = false;

        for (let UID of Object.keys(snaplines.subcomponents.value)) {
            if (UID === props.component._id) continue;

            // * Advanced guard clause - Check if: 1) Current snapline is of the same frame
            // *                                   2) If it is not of the same frame, check if cross-frame is allowed (WIP)
            // *                                   3) Prevent this clause from disabling the center snapline
            if (!UID.startsWith(FRAME_ID)) {
                if (UID !== "parentCenter") {
                    if (!USER_ALLOWED_CROSS_SUBCOMPONENT_SNAPLINING) {
                        continue;
                    }
                }
            };

            let ref = snaplines.subcomponents.value[UID].center;

            if ((newpercentage > (ref[key] - SNAPLINING_OFFSET)) && (newpercentage < (ref[key] + SNAPLINING_OFFSET))) {
                props.controlSnaplines.activate(key, ref[key]);
                return ref[key] - (offset / 2);
            }

        }
        props.controlSnaplines.deactivate(key);
        return percentage;
    }


    const dragHandler = (e) => {
        const containerRect = props.parentRef.current.getBoundingClientRect();

        const mouseX = e.clientX - containerRect.left - offsetRef.current.x;
        const mouseY = e.clientY - containerRect.top - offsetRef.current.y;
        
        const percentX = checkDragSnaplines("x", (mouseX / containerRect.width) * 100);
        const percentY = checkDragSnaplines("y", (mouseY / containerRect.height) * 100);


        subcomponents.updatePos(props.component._id, {x: percentX.toFixed(2), y: percentY.toFixed(2)});
    }



    const endDrag = () => {
        window.removeEventListener('mousemove', dragHandler);
        window.removeEventListener('mouseup', endDrag);
        snaplines.subcomponents.update(props.component._id);
        props.controlSnaplines.empty();
        setOffset({x: null, y: null})
    }

    const handleMouseDown = (e) => {
        subcomponents.selected.select(props.component._id);
        e.stopPropagation();
        tool.value === 'drag' && startDrag(e);
    }

    const computeFontSize = () => {
        const isOverflown = () => (textRef.current.clientWidth > componentRef.current.clientWidth) || (textRef.current.clientHeight > componentRef.current.clientHeight)

        let i = 6;
        let overflow = false;
        
        const maxSize = 256 // very huge text size

        const BACKTRACK_DISTANCE = 3;
        while (!overflow && i < maxSize) {
            textRef.current.style.fontSize = `${i}px`
            overflow = isOverflown()
            if (!overflow) {
                i += BACKTRACK_DISTANCE;
            }
        }

        let limit = i;

        i -= 1;

        while (overflow && i > (limit - BACKTRACK_DISTANCE)) {
            textRef.current.style.fontSize = `${i}px`
            overflow = isOverflown()
            if (overflow) {
                i -= 1;
            }
        }

        // revert to last state where no overflow happened:
        textRef.current.style.fontSize = `${i}px`
    }

    React.useEffect(() => {
        if (props.component.type === "text") {
            computeFontSize();
        }
    }, [props.parentPosition, props.component.custom.value.value, props.component.type, props.component.position]);

    React.useEffect(() => {
        // ! used to debounce
        let timer = null;

        const recomputeFs = () => {
            if (propsComponentRef.current.type !== "text") return;

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            timer = setTimeout(() => {
                computeFontSize();
                clearTimeout(timer);
                timer = null;
            }, 250)
        }

        window.addEventListener("resize", recomputeFs);

        return () => {
            window.removeEventListener("resize", recomputeFs);
        }
    }, [])

    return (
        // ! CREATE_STYLES hierarchy matters - The ones at the bottom override the ones at the top
        <div 
            style={{
                ...CREATE_STYLES.position(props.component, options.value.grid.snapTo ? ({snap: true, parent: props.parentPosition}) : ({snap: false, parent: null})),
                ...CREATE_STYLES.debug(options.value.outlines),
                ...props.component._privateStyles,
                ...CREATE_STYLES.zIndex(props.zIndex),
                ...CREATE_STYLES.selected(subcomponents.selected.value === props.component._id),
                ...CREATE_STYLES.compileCustomStyles(props.component)
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => subcomponents.hover.start(props.component._id)}
            onMouseLeave={() => subcomponents.hover.end(props.component._id)}
            ref={componentRef}
            onClick={() => subcomponents.selected.select(props.component._id)}
            className='-SUBCOMPONENT'
        >
            <div className='-TEXT-SUBCOMPONENT' ref={textRef}>
                {
                    props.component.type === "text"
                    &&
                    props.component.custom.value.value
                }
            </div>
            {
                // If the current selected component is this component (checked using ids) and the current tool is scale, render ScaleToolOverlay
                // and if the subcomponent selected value is null
                props.component._id === subcomponents.selected.value 
                && 
                tool.value === 'scale'
                &&
                <ScaleToolOverlaySC 
                    parentRef={props.parentRef} 
                    controlSnaplines={props.controlSnaplines} 
                    component={props.component} />
            }
        </div>
    )
}
