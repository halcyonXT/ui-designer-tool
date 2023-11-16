import React from "react";
import "./Sidebar.css";
import { ElementsContext } from "../../../context/ElementsContext";
import IconAction from "./IconAction";
import { ComponentsSectionItem } from "./ComponentSection";
import ComponentHandbook from "./ComponentHandbook";

const ICONS = {
    add: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M450.001-450.001h-230v-59.998h230v-230h59.998v230h230v59.998h-230v230h-59.998v-230Z" />
        </svg>
    ),
    object: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M570.385-180.001V-240H720v-229.308h80v-21.384h-80V-720H570.385v-59.999h209.614v235.924h80v128.15h-80v235.924H570.385Zm-390.384 0v-235.924h-80v-128.15h80v-235.924h209.614V-720H240v229.308h-80v21.384h80V-240h149.615v59.999H180.001Z" />
        </svg>
    ),
    delete: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
        </svg>
    ),
    box: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M120-120v-720h720v720H120Zm80-80h560v-560H200v560Zm0 0v-560 560Z" />
        </svg>
    ),
    round: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </svg>
    ),
    text: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M280-160v-520H80v-120h520v120H400v520H280Zm360 0v-320H520v-120h360v120H760v320H640Z" />
        </svg>
    ),
    help: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </svg>
    ),
};

const EMPTY_INPUT_POSITION = () => ({
    x: null,
    y: null,
    width: null,
    height: null,
});
export default React.memo(function Sidebar() {
    const { components, subcomponents } = React.useContext(ElementsContext);
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
    const [isComponentHandbookOpen, setIsComponentHandbookOpen] =
        React.useState(false);

    /**
     *
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

    const deleteElement = (UID) => {
        components.delete(UID);
    };

    const askToConfirmDelete = () => {
        setDeletionProgress("asked");
    };

    const openComponentHandbook = () => {
        setIsComponentHandbookOpen((prev) => !prev);
    };

    /**
     * Used to track current selected (prioritize subcomponent)
     */
    const renewInputPosition = () => {
        let { value: sUID } = subcomponents.selected;
        let { value: cUID } = components.selected;

        if (!sUID && !cUID) {
            setInputPosition(EMPTY_INPUT_POSITION());
            return;
        }

        if (sUID) {
            let cind = components.getIndexOf(sUID.split("_")[0]);
            let sind = subcomponents.getIndexOf(sUID);
            setInputPosition({...components.value[cind].subcomponents[sind].position});
        } else {
            setInputPosition({...components.value[components.getIndexOf(cUID)].position});
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
        renewInputPosition();
    }, [components, subcomponents]);

    const exportCodeButtonPress = () => { };
    return (
        <div className="-sidebar">
            <div className="-sidebar-elements-wrapper">
                <div className="-sidebar-section-toolbox">
                    <h6 className="-sidebar-title">Components:</h6>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                            onClick={openComponentHandbook}
                            className="-sidebar-section-toolbox-tool"
                            style={
                                isComponentHandbookOpen ? { fill: "var(--nonaccent)" } : {}
                            }
                        >
                            <div style={{ height: "1vmax", aspectRatio: "1/1" }}>
                                {ICONS.help}
                            </div>
                        </div>
                        <div
                            onClick={components.add}
                            className="-sidebar-section-toolbox-tool"
                        >
                            {ICONS.add}
                        </div>
                    </div>
                </div>
                <div className="-sidebar-components">
                    {
                        // * If component handbook is open, render component handbook
                        // * If it isnt render components normally
                        isComponentHandbookOpen ? (
                            <ComponentHandbook />
                        ) : (
                            <>
                                {
                                    // If there are no components to render, show tip. If there are, show components
                                    components.value.length === 0 ? (
                                        <div className="-sidebar-components-tip">
                                            Start by creating a component
                                        </div>
                                    ) : (
                                        components.value.map((item) => (
                                            <ComponentsSectionItem
                                                selected={components.selected.value === item._id}
                                                delete={() => deleteElement(item._id)}
                                                item={item}
                                            />
                                        ))
                                    )
                                }
                            </>
                        )
                    }
                </div>
            </div>
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
                                            components.value[
                                            components.value.findIndex(
                                                (obj) => obj._id === components.selected.value
                                            )
                                            ]
                                        }
                                    />
                                )}
                            {subcomponents.selected.value !== null && (
                                <SubcomponentSelected
                                    component={
                                        components.value[
                                            components.getIndexOf(
                                                subcomponents.selected.value.split("_")[0]
                                            )
                                        ].subcomponents[
                                        subcomponents.getIndexOf(subcomponents.selected.value)
                                        ]
                                    }
                                    parent={
                                        components.value[
                                        components.getIndexOf(
                                            subcomponents.selected.value.split("_")[0]
                                        )
                                        ]
                                    }
                                />
                            )}
                        </div>
                        <div className="-sidebar-details-position-wrapper">
                            <div className="-sidebar-details-position-row">
                                <div className="-sidebar-details-position-box">
                                    <div className="-sidebar-details-position-input-title -position-input lightblue">
                                        X
                                    </div>
                                    <input
                                        value={inputPosition.x?.toFixed(2)}
                                        type="text"
                                        className="-sidebar-details-position-input -position-input lightblue"
                                        spellCheck="false"
                                    />
                                </div>
                                <div className="-sidebar-details-position-box">
                                    <div className="-sidebar-details-position-input-title -position-input lightcoral">
                                        Y
                                    </div>
                                    <input
                                        value={inputPosition.y?.toFixed(2)}
                                        type="text"
                                        className="-sidebar-details-position-input -position-input lightcoral"
                                        spellCheck="false"
                                    />
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
                                </div>
                            </div>
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
        </div>
    );
});

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
            <span className="-sidebar-details-title-parent">
                {props.parent.id}&nbsp;&nbsp;&gt;
            </span>
            <span className="-sidebar-details-title-current">
                {props.component.id}
            </span>
            <div className="-sidebar-details-title-icon"></div>
        </>
    );
};
