import React from 'react'
import './SelectedItem.css'
import { ICONS } from '../ICONS'
import { ElementsContext } from '../../../../context/ElementsContext'
import { SelectedBox, SelectedText, SelectedFrame } from './SelectedTypes'



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
    const { components, subcomponents, other } = React.useContext(ElementsContext)

    // ! This function must stay above `selected` so it can be used to determine its state immediately
    const CURRENT_SELECTED = () => {
        if (subcomponents.selected.value) {
            return (
                components.value[
                    components.getIndexOf(subcomponents.selected.value.split('_')[0])
                ].subcomponents[
                    subcomponents.getIndexOf(subcomponents.selected.value)
                ]
            )
        } else if (components.selected.value) {
            return (
                components.value[components.getIndexOf(components.selected.value)]
            )
        } else {
            return(
                EMPTY_SELECTED()
            )
        }
    }

   

    const CURRENT_ELEMENT = (selected) => 
        selected
        &&
        "type" in selected
        &&
        (
            (selected.type === "box" || selected.type === "round")
            ?
            <SelectedBox key={selected.type} component={selected}/>
            :
            selected.type === "text"
            ?
            <SelectedText component={selected} />
            :
            selected.type === "frame"
            ?
            <SelectedFrame component={selected} />
            :
            <span 
                className='-ambiguous-type'
            >How did you select a non-existent type? Message me on discord: h.alcyon</span>
        )

    const [selected, setSelected] = React.useState(CURRENT_SELECTED());
    const [currentSelectedElement, setCurrentSelectedElement] = React.useState(CURRENT_ELEMENT(CURRENT_SELECTED()));

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
            let selected = components.value[
                components.getIndexOf(subcomponents.selected.value.split('_')[0])
            ].subcomponents[
                subcomponents.getIndexOf(subcomponents.selected.value)
            ]
            setSelected(selected);
            setCurrentSelectedElement(CURRENT_ELEMENT(selected));
        } else if (components.selected.value) {
            let selected = components.value[components.getIndexOf(components.selected.value)];
            setSelected(selected);
            setCurrentSelectedElement(CURRENT_ELEMENT(selected));
        } else {
            setSelected(
                EMPTY_SELECTED()
            )
            setCurrentSelectedElement(<></>)
        }

        renewInputPosition();
    }, [components, subcomponents]);

    React.useEffect(() => {


        setDeletionProgress("none")
    }, [components.selected.value, subcomponents.selected.value])


    // TODO:
    const exportCodeButtonPress = () => { 
        let code = other.getExportCode(selected._id);
        const ANIMATION_DURATION = 550; // ! ms

        const handleCopy = () => {
            try {
                navigator.clipboard.writeText(code);
                document.querySelector(".-copy-code").animate([
                    {border: "1px solid var(--accent)"},
                    {border: "1px solid var(--subnonaccent)"}
                ], {
                    duration: ANIMATION_DURATION,
                    fill: 'forwards'
                })
                document.querySelector('.-copy-code > svg').animate([
                    {fill: 'var(--accent)'},
                    {fill: 'var(--subnonaccent)'}
                ], {
                    duration: ANIMATION_DURATION,
                    fill: 'forwards'
                })
            } catch (ex) {
                try {
                    document.querySelector(".-copy-code").animate([
                        {border: "1px solid var(--complement)"},
                        {border: "1px solid var(--subnonaccent)"}
                    ], {
                        duration: ANIMATION_DURATION,
                        fill: 'forwards'
                    })
                    document.querySelector('.-copy-code > svg').animate([
                        {fill: 'var(--complement)'},
                        {fill: 'var(--subnonaccent)'}
                    ], {
                        duration: ANIMATION_DURATION,
                        fill: 'forwards'
                    })
                } catch (ex) {} 
            }
        }

        other.modal.toggle(
            <pre className={`language-js`} style={{ whiteSpace: 'pre-line' }}>
                <div className='-copy-code' onClick={handleCopy}>
                    {ICONS.copy}
                </div>
                <code className="language-js -export-code">
                    {
                        code
                    }
                </code>
            </pre>
        )
        setTimeout(() => {
            Prism.highlightAll();
        }, 5)
    };

    const handleDuplicate = () => {
        other.clipboard.duplicate(selected._id.split("_")[0]);
    }

    const changeSubcomponentType = (type) => subcomponents.changeType(selected._id, type);

    return (
        <React.Fragment>
            {
                // * If either a subcomponent or a component has been selected
                // * render details
                (components.selected.value || subcomponents.selected.value) && (
                    <div className="-sidebar-details">
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
                                // ! CURRENT SELECTED ELEMENT
                                currentSelectedElement
                            }
                        </div>
                        <div>
                            <div className="-sidebar-details-buttons-wrapper">
                                <button
                                    className="-sidebar-details-button-nonaccent"
                                    role="button"
                                    onClick={() => {}}
                                >
                                    <div className='-navbar-button-shortcut-overlay sidebar'>[C]</div>
                                    {ICONS.copy}
                                </button>
                                <button
                                    className="-sidebar-details-button-nonaccent"
                                    role="button"
                                    onClick={() => {}}
                                >
                                    <div className='-navbar-button-shortcut-overlay sidebar'>[V]</div>
                                    {ICONS.paste}
                                </button>
                                <button
                                    className="-sidebar-details-button-nonaccent"
                                    role="button"
                                    onClick={handleDuplicate}
                                >
                                    <div className='-navbar-button-shortcut-overlay sidebar'>[D]</div>
                                    {ICONS.duplicate}
                                </button>
                            </div>
                            <div className="-sidebar-details-buttons-wrapper second">
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
                            <div
                                className="-sidebar-details-notice"
                                style={{
                                    justifyContent: "center",
                                    opacity: deletionProgress === "asked" ? 1 : 0,
                                }}
                            >
                                Are you sure?
                            </div>
                        </div>
                    </div>
                )
            }
        </React.Fragment>
    )
}




function Position({inputPosition, setInputPosition}) {
    return (
        <div className="-sidebar-details-position-wrapper">
            <div className="-sidebar-details-type-title">
                Position:
            </div>
            <div className="-sidebar-details-position-row">
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input lightblue">
                        X
                    </div>
                    <input
                        value={inputPosition.x ? inputPosition.x?.roundToDecimalPlace(2) : "0"}
                        type="text"
                        className="-sidebar-details-position-input -position-input lightblue"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.x ? inputPosition.x?.roundToDecimalPlace(2) : "0"}
                        <span className="-small">%</span>
                    </div>
                </div>
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input lightcoral">
                        Y
                    </div>
                    <input
                        value={inputPosition.y ? inputPosition.y?.roundToDecimalPlace(2) : "0"}
                        type="text"
                        className="-sidebar-details-position-input -position-input lightcoral"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.y ? inputPosition.y?.roundToDecimalPlace(2) : "0"}
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
                        value={inputPosition.width?.roundToDecimalPlace(2)}
                        type="text"
                        className="-sidebar-details-position-input -position-input lightgreen"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.width?.roundToDecimalPlace(2)}
                        <span className="-small">%</span>
                    </div>
                </div>
                <div className="-sidebar-details-position-box">
                    <div className="-sidebar-details-position-input-title -position-input orchid">
                        HEIGHT
                    </div>
                    <input
                        value={inputPosition.height?.roundToDecimalPlace(2)}
                        type="text"
                        className="-sidebar-details-position-input -position-input orchid"
                        spellCheck="false"
                    />
                    <div className="-sidebar-details-position-input-text">
                        {inputPosition.height?.roundToDecimalPlace(2)}
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
        <div className="-sidebar-details-title frame">
            <div className='-name-flex'>
                <span className='-sidebar-details-title-icon'>{ICONS.object}</span>
                {props.component.id}
            </div>
        </div>
    );
};

const SubcomponentSelected = (props) => {
    if (!props.component || !props.parent) return <></>;

    return (
        <div className="-sidebar-details-title">
            <span className="-sidebar-details-title-parent" onClick={props.deselectSubcomponent}>
                {props.parent.id}&nbsp;&nbsp;&gt;
            </span>
            <div className='-name-flex'>
                <span className='-sidebar-details-title-icon'>{ICONS[props.component.type]}</span>
                <span className="-sidebar-details-title-current">
                    {props.component.id}
                </span>
            </div>
        </div>
    );
};

