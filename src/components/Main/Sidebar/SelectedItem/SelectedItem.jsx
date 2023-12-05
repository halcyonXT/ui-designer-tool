import React from 'react'
import './SelectedItem.css'
import { ICONS } from '../ICONS'
import { ElementsContext } from '../../../../context/ElementsContext'
import { SelectedBox, SelectedText } from './SelectedTypes'



const EMPTY_INPUT_POSITION = () => ({
    x: null,
    y: null,
    width: null,
    height: null,
});

const EMPTY_SELECTED = () => ({
    type: "none"
})



export default function SelectedItem() {
    const { components, subcomponents } = React.useContext(ElementsContext)

    const [selected, setSelected] = React.useState(EMPTY_SELECTED())

    const [inputPosition, setInputPosition] = React.useState(
        EMPTY_INPUT_POSITION()
    );

    /**
     * Three states:
     *      1: "none" - User has yet to click "delete element" button
     *      2: "asked" - User has been asked if they are sure
     *      3: "agreed" - useEffect detects changes and deletes node
     */
    const [deletionProgress, setDeletionProgress] = React.useState("none");

    /**
     *  Function to control the `inputPosition` object
     * @param {String} key - Key on the inputPosition state to change
     * @param {String} value - Value to set that key to
     */
    const changeInputPosition = (key, value) => {
        setInputPosition((prev) => {
            let outp = { ...prev };
            outp[key] = value;
            return prev;
        });
    };

    const askToConfirmDelete = () => {
        setDeletionProgress("asked");
    };

    /**
     * Used to track current selected (prioritize subcomponent)
     */
    const renewInputPosition = () => {
        try {
            let { value: sUID } = subcomponents.selected;
            let { value: cUID } = components.selected;
    
            if (!sUID && !cUID) {
                setInputPosition(EMPTY_INPUT_POSITION());
                return;
            }

    
            if (sUID) {
                let cind = components.getIndexOf(sUID.split("_")[0]);
                let sind = subcomponents.getIndexOf(sUID);
                setInputPosition({
                    ...components.value[cind].subcomponents[sind].position,
                });
            } else {
                setInputPosition({
                    ...components.value[components.getIndexOf(cUID)].position,
                });
            }
        } catch (ex) {
            setInputPosition(EMPTY_INPUT_POSITION());
        }
    };

    const proceedWithDeletion = () => {
        try {
            if (subcomponents.selected.value !== null) {
                subcomponents.remove(subcomponents.selected.value);
            } else {
                components.delete(components.selected.value);
            }
        } catch (ex) {
            console.warn(`Unable to delete node after agreeing: ` + ex);
        }
        setDeletionProgress("none");
    };

    React.useEffect(() => {
        if (!components.selected.value && !subcomponents.selected.value) {
            setDeletionProgress("none");
        }

        if (subcomponents.selected.value) {
            setSelected(
                components.value[
                    components.getIndexOf(subcomponents.selected.value.split('_')[0])
                ].subcomponents[
                    subcomponents.getIndexOf(subcomponents.selected.value)
                ]
            )
        } else if (components.selected.value) {
            setSelected(
                components.value[components.getIndexOf(components.selected.value)]
            )
        } else {
            setSelected(
                EMPTY_SELECTED()
            )
        }

        renewInputPosition();
    }, [components, subcomponents]);


    // TODO:
    const exportCodeButtonPress = () => { };

    const changeSubcomponentType = (type) => subcomponents.changeType(selected._id, type);

    return (
        <>
            {
                // * If either a subcomponent or a component has been selected
                // * render details
                (components.selected.value || subcomponents.selected.value) && (
                    <div className="-sidebar-details">
                        <div className="-sidebar-details-title">
                            {components.selected.value !== null &&
                                subcomponents.selected.value === null && (
                                    <FrameSelected
                                        component={
                                            selected
                                        }
                                    />
                                )}
                            {subcomponents.selected.value !== null && (
                                <SubcomponentSelected
                                    component={
                                        selected
                                    }
                                    parent={
                                        components.value[
                                            components.getIndexOf(
                                                subcomponents.selected.value.split("_")[0]
                                            )
                                        ]
                                    }
                                    deselectSubcomponent={() => subcomponents.selected.select(null)}
                                />
                            )}
                        </div>
                        {
                            selected && selected.type !== "frame"
                            &&
                            <div className="-sidebar-details-type-section-wrapper">
                                <div className="-sidebar-details-type-title">
                                    Subcomponent type:
                                </div>
                                <div className="-sidebar-details-type-wrapper">
                                    <div 
                                        className={`-sidebar-details-type ${selected.type === "box" ? "enabled" : ""}`}
                                        onClick={() => changeSubcomponentType("box")}
                                    >
                                        {ICONS.box}
                                    </div>
                                    <div 
                                        className={`-sidebar-details-type ${selected.type === "round" ? "enabled" : ""}`}
                                        onClick={() => changeSubcomponentType("round")}
                                    >
                                        {ICONS.round}
                                    </div>
                                    <div 
                                        className={`-sidebar-details-type ${selected.type === "text" ? "enabled" : ""}`}
                                        onClick={() => changeSubcomponentType("text")}
                                    >
                                        {ICONS.text}
                                    </div>
                                </div>
                            </div>
                        }
                        <Position inputPosition={inputPosition} setInputPosition={setInputPosition} />
                        <div className='-subcomponent-specifics-wrapper'>
                            {
                                /**
                                 * ! React is stupid
                                 * * I have to do check if its an object for EVERY ONE OF THESE CASES (trust me on this one)
                                 * * Else React will throw an undefined error - How does that make sense? It absolutely doesnt
                                 * * Thank you, react!
                                 */
                                typeof selected === "object"
                                &&
                                (selected.type === "box" || selected.type === "round")
                                ?
                                <SelectedBox component={selected}/>
                                :
                                typeof selected === "object"
                                &&
                                selected.type === "text"
                                ?
                                <SelectedText component={selected} />
                                :
                                typeof selected === "object"
                                &&
                                selected.type === "frame"
                                ?
                                <></>
                                :
                                <span 
                                    className='-ambiguous-type'
                                >How did you select a non-existent type? Message me on discord: h.alcyon</span>
                            }
                        </div>
                        <div>
                            <div
                                className="-sidebar-details-notice"
                                style={{
                                    justifyContent: "center",
                                    opacity: deletionProgress === "asked" ? 1 : 0,
                                }}
                            >
                                Are you sure?
                            </div>
                            <div className="-sidebar-details-buttons-wrapper ">
                                <button
                                    className="-sidebar-details-button -complement"
                                    role="button"
                                    onClick={
                                        deletionProgress === "asked"
                                            ? () => setDeletionProgress("none")
                                            : askToConfirmDelete
                                    }
                                >
                                    {deletionProgress !== "asked" ? "DELETE ELEMENT" : "NO"}
                                </button>
                                <button
                                    className="-sidebar-details-button"
                                    role="button"
                                    onClick={
                                        deletionProgress === "asked"
                                            ? proceedWithDeletion
                                            : exportCodeButtonPress
                                    }
                                >
                                    {deletionProgress !== "asked" ? "EXPORT CODE" : "YES"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}




function Position({inputPosition, setInputPosition}) {
    return (
        <div className="-sidebar-details-position-wrapper">
            <div className="-sidebar-details-position-row">
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input lightblue">
                        X
                    </div>
                    <input
                        value={inputPosition.x ? inputPosition.x?.toFixed(2) : "0"}
                        type="text"
                        className="-sidebar-details-position-input -position-input lightblue"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.x ? inputPosition.x?.toFixed(2) : "0"}
                        <span className="-small">%</span>
                    </div>
                </div>
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input lightcoral">
                        Y
                    </div>
                    <input
                        value={inputPosition.y ? inputPosition.y?.toFixed(2) : "0"}
                        type="text"
                        className="-sidebar-details-position-input -position-input lightcoral"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.y ? inputPosition.y?.toFixed(2) : "0"}
                        <span className="-small">%</span>
                    </div>
                </div>
            </div>
            <div className="-sidebar-details-position-row">
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input lightgreen">
                        WIDTH
                    </div>
                    <input
                        value={inputPosition.width?.toFixed(2)}
                        type="text"
                        className="-sidebar-details-position-input -position-input lightgreen"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.width?.toFixed(2)}
                        <span className="-small">%</span>
                    </div>
                </div>
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input orchid">
                        HEIGHT
                    </div>
                    <input
                        value={inputPosition.height?.toFixed(2)}
                        type="text"
                        className="-sidebar-details-position-input -position-input orchid"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.height?.toFixed(2)}
                        <span className="-small">%</span>
                    </div>
                </div>
            </div>
                        </div>
    )
}

const FrameSelected = (props) => {
    if (!props.component) return <></>;

    return (
        <>
            {props.component.id}
            <div className="-sidebar-details-title-icon"></div>
        </>
    );
};

const SubcomponentSelected = (props) => {
    if (!props.component || !props.parent) return <></>;

    return (
        <>
            <span className="-sidebar-details-title-parent" onClick={props.deselectSubcomponent}>
                {props.parent.id}&nbsp;&nbsp;&gt;
            </span>
            <span className="-sidebar-details-title-current">
                {props.component.id}
            </span>
            <div className="-sidebar-details-title-icon"></div>
        </>
    );
};

