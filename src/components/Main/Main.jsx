import React from 'react'
import './Main.css'
import GAME_OVERLAY from '../../assets/overlay.png'
import { OptionsContext } from '../../context/OptionsContext'
import Sidebar from './Sidebar/Sidebar'
import { ElementsContext } from '../../context/ElementsContext'
import UIComponent from './UIComponent/UIComponent'
import RulerPointer from './RulerPointer'


const EMPTY_SNAPLINE = () => ({element: ""});


const createRulerMarkings = (direction) => {
    let outp = [];
    for (let i = 1; i <= 20; i++) {
        outp.push(<div 
            className={`-RULER-${direction === "x" ? "HORIZONTAL" : "VERTICAL"}-MARKINGS`} 
            style={direction === "x" ? {left: `${(i - 1) * 5}%`} : {top: `${(i - 0.4) * 5}%`}}>{i * 5}%
        </div>)
    }
    return outp;
}

const HORIZONTAL_RULER_MARKINGS = createRulerMarkings("x");
const VERTICAL_RULER_MARKINGS = createRulerMarkings("y");

export default function Main() {
    const {overlayOpacity, options} = React.useContext(OptionsContext);
    const {components, subcomponents, snaplines} = React.useContext(ElementsContext);

    const [activeSnaplines, setActiveSnaplines] = React.useState({x: EMPTY_SNAPLINE(), y: EMPTY_SNAPLINE()});


    console.log(components)
    console.log(subcomponents)
    console.log(snaplines)
    

    const mainRef = React.useRef(null);

    const activateSnapline = (direction, percentage) => {
        let style = direction === "x" ? ({left: `${percentage}%`}) : ({top: `${percentage}%`});

        setActiveSnaplines(prev => {
            let outp = {...prev};

            let element = <div 
                    style={style}
                    className={`-SNAPLINE-${direction.toUpperCase()}`}
                ></div>;

            outp[direction] = ({
                element: element,
                direction,
                percentage
            })

            return outp;
        })
    }

    const deactivateSnapline = (direction) => {
        setActiveSnaplines(prev => {
            let outp = {...prev};
            outp[direction] = EMPTY_SNAPLINE();
            return outp;
        });
    }
    
    const emptySnaplines = () => setActiveSnaplines({x: EMPTY_SNAPLINE(), y: EMPTY_SNAPLINE()})

    const handleDeselect = (e) => {
        if (e.target.id === 'main') {
            if (!components._scaling.value) {
                components.selected.select(false);
                return;
            }
        }
    }


    return (
        <div className='-main'>
            <Sidebar/>
            <div className='-main-display-wrapper'>
                <div id='main' className='-main-display' ref={mainRef} onClick={handleDeselect}>
                    {
                        // If the user has rules activated, render rulers overlay
                        options.value.rulers
                        &&
                        <>
                            <div className='-RULER-HORIZONTAL-1'></div>
                            <div className='-RULER-HORIZONTAL-5'>
                                {
                                    HORIZONTAL_RULER_MARKINGS
                                }
                                <RulerPointer direction="x" />
                            </div>
                            <div className='-RULER-VERTICAL-1'></div>
                            <div className='-RULER-VERTICAL-5'>
                                {
                                    VERTICAL_RULER_MARKINGS
                                }
                                <RulerPointer direction="y" />
                            </div>
                        </>
                    }
                    <img className='-main-display-game-overlay' style={{opacity: overlayOpacity.value/100}} src={GAME_OVERLAY} onDragStart={() => {}}/>
                    {
                        activeSnaplines.x.element && activeSnaplines.x.element
                    }
                    {
                        activeSnaplines.y.element && activeSnaplines.y.element
                    }
                    {
                        components.value.map(component => 
                            <UIComponent 
                                key={component._id} 
                                mainRef={mainRef} 
                                component={component}
                                controlSnaplines={{activate: activateSnapline, deactivate: deactivateSnapline, empty: emptySnaplines}}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )
}
