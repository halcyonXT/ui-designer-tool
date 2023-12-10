import React from 'react';

export default function IconAction(props) {

    return (
        <span className='-ICON' onClick={props.x} style={props.xs ? props.xs : {}}>
            {props.children}
        </span>
    )
}