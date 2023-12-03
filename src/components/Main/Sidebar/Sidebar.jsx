import React from "react";
import "./Sidebar.css";
import { ElementsContext } from "../../../context/ElementsContext";
import IconAction from "./IconAction";
import SelectedItem from './SelectedItem/SelectedItem'
import { ComponentsSectionItem } from "./ComponentSection";
import ComponentHandbook from "./ComponentHandbook";
import { ICONS } from './ICONS'


export default function Sidebar() {
    const { components, subcomponents } = React.useContext(ElementsContext);

    const [isComponentHandbookOpen, setIsComponentHandbookOpen] =
        React.useState(false);


    const deleteElement = (UID) => {
        components.delete(UID);
    };


    const openComponentHandbook = () => {
        setIsComponentHandbookOpen((prev) => !prev);
    };


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
                                isComponentHandbookOpen ? { fill: "var(--accent)" } : {}
                            }
                        >
                            <div style={{ height: "1vmax", aspectRatio: "1/1", display: 'grid', placeItems: 'center' }}>
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
                                            Start by creating a frame
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
            <SelectedItem
            />
        </div>
    );
};


