import React from 'react'
import './Main.css'
import GAME_OVERLAY from '../../assets/overlay.png'
import { OptionsContext } from '../../context/OptionsContext'
import Sidebar from './Sidebar/Sidebar'
import { ElementsContext } from '../../context/ElementsContext'
import UIComponent from './UIComponent/UIComponent'


const EMPTY_SNAPLINE = () => ({element: ""});

export default function Main() {
    const {overlayOpacity} = React.useContext(OptionsContext);
    const {components} = React.useContext(ElementsContext);

    const [activeSnaplines, setActiveSnaplines] = React.useState({x: EMPTY_SNAPLINE(), y: EMPTY_SNAPLINE()});

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
        if (e.target.id !== 'main') return;
        components.selected.select(false);
    }


    return (
        <div className='-main'>
            <Sidebar/>
            <div className='-main-display-wrapper'>
                <div id='main' className='-main-display' ref={mainRef} onClick={handleDeselect}>
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
