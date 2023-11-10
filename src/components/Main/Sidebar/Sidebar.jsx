import React from 'react'
import './Sidebar.css'
import { ElementsContext } from '../../../context/ElementsContext'
import IconAction from './IconAction'
import {ComponentsSectionItem} from './ComponentSection'


const ICONS = {
    add: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M450.001-450.001h-230v-59.998h230v-230h59.998v230h230v59.998h-230v230h-59.998v-230Z"/></svg>,
    object: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M570.385-180.001V-240H720v-229.308h80v-21.384h-80V-720H570.385v-59.999h209.614v235.924h80v128.15h-80v235.924H570.385Zm-390.384 0v-235.924h-80v-128.15h80v-235.924h209.614V-720H240v229.308h-80v21.384h80V-240h149.615v59.999H180.001Z"/></svg>,
    delete: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>,
    box: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M120-120v-720h720v720H120Zm80-80h560v-560H200v560Zm0 0v-560 560Z"/></svg>,
    round: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>,
    text: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M280-160v-520H80v-120h520v120H400v520H280Zm360 0v-320H520v-120h360v120H760v320H640Z"/></svg>,
}


export default function Sidebar() {
    const {components, subcomponents} = React.useContext(ElementsContext);

    const deleteElement = (UID) => {
        components.delete(UID);
    }

    return (
        <div className='-sidebar'>
            <div className='-sidebar-elements-wrapper'>

                
                <div className='-sidebar-section-toolbox'>
                    <h6 className='-sidebar-title'>Components:</h6>
                    <div>
                        <div onClick={components.add} className='-sidebar-section-toolbox-tool'>{ICONS.add}</div>
                    </div>
                </div>
                <div className='-sidebar-components'>
                    {
                        components.value.map(item => 
                            <ComponentsSectionItem 
                                selected={components.selected.value === item._id} 
                                delete={() => deleteElement(item._id)} 
                                item={item}
                            />
                        )
                    }
                </div>
            </div>
            <div className='-sidebar-details'>
                <div className='-sidebar-details-title'>
                    {
                        components.selected.value !== null && subcomponents.selected.value === null
                        &&
                        <FrameSelected component={components.value[components.value.findIndex(obj => obj._id === components.selected.value)]}/>
                    }
                    {
                        subcomponents.selected.value !== null
                        &&
                        <SubcomponentSelected 
                            component={components.value[components.getIndexOf(subcomponents.selected.value.split('_')[0])].subcomponents[subcomponents.getIndexOf(subcomponents.selected.value)]}
                            parent={components.value[components.getIndexOf(subcomponents.selected.value.split('_')[0])]}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

const FrameSelected = (props) => {
    return (
        <>
            {props.component.id}
            <div className='-sidebar-details-title-icon'></div>
        </>
    )
}

const SubcomponentSelected = (props) => {
    return (
        <>
            {props.parent.id}&nbsp;&nbsp;&gt;&nbsp;&nbsp;{props.component.id}
            <div className='-sidebar-details-title-icon'></div>
        </>
    )
}




