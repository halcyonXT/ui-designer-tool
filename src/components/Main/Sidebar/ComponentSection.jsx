import React from 'react';
import { ElementsContext } from '../../../context/ElementsContext'
import IconAction from './IconAction'

const CREATE_STYLES = {
    selected: (isSelected) => isSelected ? ({background:"var(--foreground)"}) : ({}),
    selectedSubcomponent: (isSelected) => isSelected ? ({}) : ({}),
    selectedVerticalLine: (isSelected) => isSelected ? ({background: 'var(--dark)'}) : ({})
}

const ICONS = {
    add: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M450.001-450.001h-230v-59.998h230v-230h59.998v230h230v59.998h-230v230h-59.998v-230Z"/></svg>,
    object: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M570.385-180.001V-240H720v-229.308h80v-21.384h-80V-720H570.385v-59.999h209.614v235.924h80v128.15h-80v235.924H570.385Zm-390.384 0v-235.924h-80v-128.15h80v-235.924h209.614V-720H240v229.308h-80v21.384h80V-240h149.615v59.999H180.001Z"/></svg>,
    delete: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>,
    box: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M120-120v-720h720v720H120Zm80-80h560v-560H200v560Zm0 0v-560 560Z"/></svg>,
    round: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>,
    text: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M280-160v-520H80v-120h520v120H400v520H280Zm360 0v-320H520v-120h360v120H760v320H640Z"/></svg>,
    expand: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
}

export const ComponentsSectionItem = (props) => {
    const [hovered, setHovered] = React.useState(false);
    const {components, subcomponents} = React.useContext(ElementsContext);
    
    const handleSelect = () => {
        components.selected.select(props.item._id);
    }

    const addSubcomponent = () => {
        subcomponents.add(props.item._id);
    }

    React.useEffect(() => {
        if (hovered) {
            components.hover.start(props.item._id);
        } else {
            components.hover.end(props.item._id);
        }
    }, [hovered])

    const collapseTrigger = () => {
        components.collapse(props.item._id);
    }

    return (
        <>
            <div 
                className='-sidebar-component' 
                onClick={handleSelect} 
                onMouseEnter={() => setHovered(true)} 
                onMouseLeave={() => setHovered(false)} 
                id={props.item._id}
                style={{...CREATE_STYLES.selected(props.selected && subcomponents.selected.value === null)}}
            >
                <div className='-sidebar-component-info'>
                    {ICONS.object}
                    <h6 className='-sidebar-component-name'>{props.item.id}</h6>
                </div>
                <div className='-sidebar-component-icons-wrapper'>
                    {
                        (props.selected)
                        &&
                        <IconAction x={props.delete}>
                            {
                                ICONS.delete
                            }
                        </IconAction>
                    }
                    {
                        ((props.selected) || hovered)
                        &&
                        <IconAction x={addSubcomponent}>
                            {
                                ICONS.add
                            }
                        </IconAction>
                    }
                    {
                        <IconAction x={collapseTrigger} xs={!props.item._componentCollapsed ? {transform: 'rotate(90deg)'} : {}}>
                        {
                            ICONS.expand
                        }
                        </IconAction>
                    }
                </div>
            </div>
            {
                !props.item._componentCollapsed
                &&
                props.item.subcomponents.map(item => 
                    <Subcomponent
                        item={item}
                        selected={props.selected}
                    />
                )
            }
        </>
    )
}

export const Subcomponent = (props) => {
    const {subcomponents} = React.useContext(ElementsContext);
    const [hovered, setHovered] = React.useState(false);

    const startHover = () => {
        setHovered(true);
        subcomponents.hover.start(props.item._id);
    }

    const endHover = () => {
        setHovered(false);
        subcomponents.hover.end(props.item._id);
    }

    const deleteSubcomponent = () => subcomponents.remove(props.item._id)

    return (
        <>
                <div 
                    className='-sidebar-subcomponent' 
                    style={{
                        ...CREATE_STYLES.selectedSubcomponent(props.selected),
                        ...CREATE_STYLES.selected(props.selected && subcomponents.selected.value === props.item._id)
                    }}
                    onMouseEnter={startHover}
                    onMouseLeave={endHover}
                    onClick={() => subcomponents.selected.select(props.item._id)}
                >
                    <div className='-sidebar-component-info'>
                        <div 
                            className='-vertical-line'
                            style={{...CREATE_STYLES.selectedVerticalLine(props.selected)}}
                        ></div>
                        {ICONS[props.item.type]}
                        <h6 className='-sidebar-component-name'>{props.item.id}</h6>
                    </div>
                    <div className='-sidebar-component-icons-wrapper'>
                        {
                            ((subcomponents.selected.value === props.item._id))
                            &&
                            <IconAction x={deleteSubcomponent}>
                                {
                                    ICONS.delete
                                }
                            </IconAction>
                        }
                    </div>
                </div>

        </>
    )
}
