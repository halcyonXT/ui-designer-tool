import React from 'react'
import './Logo.css'
import logo from '/icon128.png';

export default function Logo() {
    return (
        <div className='-navbar-logo'>
            <img
                src={logo}
                className='-navbar-logo-img'
            />
            <div className='-navbar-logo-texts-wrapper'>
                <div>
                    <h6 className='-navbar-logo-subtext'>HALCYON'S</h6>
                    <h1 className='-navbar-logo-text'>UI DESIGNER</h1>
                </div>
                <h6 className='-navbar-logo-subtext'><i>{props.__HUID_VERSION__}</i></h6>
            </div>
        </div>
    )
}
