import React from 'react';

export default function IconAction(props) {

    return (
        <span className='-ICON' onClick={props.x}>
            {props.children}
        </span>
    )
}