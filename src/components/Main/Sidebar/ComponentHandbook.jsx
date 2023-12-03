import React from "react";
import './ComponentHandbook.css'

const Ct = ({x, children}) => <span style={{color: `${x}`}}>{children}</span> 

const Et = (props) => {
    const [styles, setStyles] = React.useState((function() {
        let obj = {};
        if (props.bold) {
            obj.fontWeight = '900'
        }
        if (props.italic) {
            obj.fontStyle = 'italic'
        }
        if (props.underline) {
            obj.textDecoration = 'underline'
        }
        obj.userSelect = "text"
        return obj;
    })());

    return <span style={styles}>{props.children}</span>
};

const P = (props) => <p className="-handbook-paragraph" style={{userSelect: 'text'}}>{props.children}</p>;

const removeShadow = () => ({textShadow: '0 !important'});

const CREATE_STYLES = {
    selectedTab: (selected) => selected ? ({background: "var(--nonaccent)"}) : ({})
}

export default React.memo(function ComponentHandbook() {
    const [pageSelected, setPageSelected] = React.useState("frames")

    const code1 = 
`ship.setUIComponent({
    id:"Frame_1",
    position:[25,25,50,50],
    clickable: true,
    shortcut: "X",
    visible: true,
    components: [
        // ...subcomponents
    ]
})`

    const code2 = 
`ship.setUIComponent({
    // ...
    components: [
        {
            type: "box", 
            position: [0,0,100,100],
            stroke: "#FF0000",
            fill: "#FFFFFF",
            width: 2
        }
    ]
})`

    React.useEffect(() => {
        Prism.highlightAll();
    }, [])

    React.useEffect(() => {
        Prism.highlightAll();
    }, [pageSelected])

    const PageSubcomponents = () => {
        return (
            <>
                <P>
                    <Ct x={"var(--accent)"}><Et bold>Subcomponents</Et></Ct> are the visible parts of your Starblast UI Component. They 
                    are non-interactive by nature.
                </P>
                <br/>
                <P>
                    Every subcomponent has a parent <Ct x="var(--complement)">frame</Ct>, and if the frame is deleted so are its subcomponents.
                    Subcomponents are positioned <Et underline>relative to their parent frame</Et>.
                </P>
                <br/>
                <P>
                    <Et underline>Subcomponent hierarchy</Et> matters, subcomponents at the top will show over ones that are below.
                </P>
                <br/>
                <P>
                    There are 4 possible types of subcomponents:<br/>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;1.</Ct></Et>&nbsp;Box</summary>
                        <P>
                            This type of subcomponent renders a box with the dimensions defined in the position property.
                            <br/><br/>
                            Box-exclusive subcomponent properties are:<br/>
                            <code><Ct x="var(--nonaccent)">stroke, width, background, fill</Ct></code>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;2.</Ct></Et>&nbsp;Round</summary>
                        <P>
                            This type of subcomponent renders a circle with the dimensions defined in the position property.
                            <br/><br/>
                            Round-exclusive subcomponent properties are:<br/>
                            <code><Ct x="var(--nonaccent)">stroke, width, background, fill</Ct></code>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;3.</Ct></Et>&nbsp;Text</summary>
                        <P>
                            This type of subcomponent renders text that is defined in the 
                            "value" property of the subcomponent. All subcomponents of type text
                            will render their text in one line. Font size of your text subcomponent is
                            dynamically resized so all of the text fits into one line.
                            <br/><br/>
                            Text-exclusive subcomponent properties are:<br/>
                            <code><Ct x="var(--nonaccent)">value, color, align</Ct></code>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;4.</Ct></Et>&nbsp;Player</summary>
                        <P>
                            This type of subcomponent renders the ECP (if the player has an ECP) and the name of a player.
                            <br/><br/>
                            There is no "player" subcomponent in HUID for 2 reasons:<br/><br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Ct x="var(--accent)">1.</Ct> For the proper functioning of a 
                            player subcomponent, the "id" property is needed. The id is specific to the game instance and cannot
                            possibly be set in HUID.<br/><br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Ct x="var(--accent)">2.</Ct> "Player" acts in much the same way
                            that "text" acts, so if you really need to simulate a "player" subcomponent in HUID it's recommended to
                            use a "text" subcomponent and later make the neccessary changes in your code to transform it into a "player"
                            subcomponent.
                            <br/><br/>
                            Player-exclusive subcomponent properties are:<br/>
                            <code><Ct x="var(--nonaccent)">id, color</Ct></code>
                        </P>
                    </details>
                </P>
                <br/>
                <P>
                    Other properties of subcomponent objects:<br/>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;type</Et></summary>
                        <P>
                            The "type" property is a string of one of the following values:
                            <br/>
                            <Ct x="var(--nonaccent)">&nbsp;"box"</Ct>,
                            <Ct x="var(--nonaccent)">&nbsp;"round"</Ct>,
                            <Ct x="var(--nonaccent)">&nbsp;"text"</Ct>,
                            <Ct x="var(--nonaccent)">&nbsp;"player"</Ct>
                            <br/><br/>
                            The types are described in greater detail in the types section.
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;position</Et></summary>
                        <P>
                            Example of a position property inside a subcomponent:<br/><br/>
                            <code>
                                components: [<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;{'{'}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;type: "box",<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;position: [<Ct x="lightblue">25</Ct>, <Ct x="lightcoral">25</Ct>, <Ct x="lightgreen">50</Ct>, <Ct x="orchid">50</Ct>]<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;{'}'}
                                <br/>]
                            </code>
                            <br/><br/>
                            <Ct x="lightblue">X</Ct>&nbsp;- Horizontal offset of a subcomponent from the left edge of the <Ct x="var(--complement)">frame</Ct><br/>
                            <Ct x="lightcoral">Y</Ct>&nbsp;- Vertical offset of a subcomponent from the top edge of the <Ct x="var(--complement)">frame</Ct><br/>
                            <Ct x="lightgreen">Width</Ct>&nbsp;- Width of the subcomponent, in % of the <Ct x="var(--complement)">frame</Ct> width<br/>
                            <Ct x="orchid">Height</Ct>&nbsp;- Height of the subcomponent, in % of the <Ct x="var(--complement)">frame</Ct> height<br/>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;value <small>("text" type only)</small></Et></summary>
                        <P>
                            The value property is of type string and represents the text that the "text" subcomponent should display
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;color</Et></summary>
                        <P>
                            The color property is of type string and determines the color in which the text should be displayed<br/>
                            It can be formatted either as a hex value (with a hashtag) or rgb.<br/>
                            <br/>
                            Examples:<br/>
                            <Ct x="var(--nonaccent)">"#<Ct x="lightcoral">FF</Ct><Ct x="lightgreen">FF</Ct><Ct x="lightblue">FF</Ct>"</Ct>
                            <br/>
                            <Ct x="var(--nonaccent)">"rgb(<Ct x="lightcoral">255</Ct>, <Ct x="lightgreen">255</Ct>, <Ct x="lightblue">255</Ct>)"</Ct>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;fill</Et></summary>
                        <P>
                            The fill property is of type string and determines the background color of a box/round subcomponent.<br/>
                            It can be formatted either as a hex value (with a hashtag) or rgb.<br/>
                            <br/>
                            Examples:<br/>
                            <Ct x="var(--nonaccent)">"#<Ct x="lightcoral">FF</Ct><Ct x="lightgreen">FF</Ct><Ct x="lightblue">FF</Ct>"</Ct>
                            <br/>
                            <Ct x="var(--nonaccent)">"rgb(<Ct x="lightcoral">255</Ct>, <Ct x="lightgreen">255</Ct>, <Ct x="lightblue">255</Ct>)"</Ct>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;width</Et></summary>
                        <P>
                            The width property is of type number and represents the width of the subcomponent's border<br/>
                            One unit of this value equals (1 / (End user screen's pixel density)) CSS pixels
                            <br/><br/>
                            Example:<br/>
                            <code>width: 2</code>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;stroke</Et></summary>
                        <P>
                            The stroke property is of type string and represents the color of the subcomponents border.<br/> 
                            It can be formatted either as a hex value (with a hashtag) or rgb.<br/>
                            <br/>
                            Examples:<br/>
                            <Ct x="var(--nonaccent)">"#<Ct x="lightcoral">FF</Ct><Ct x="lightgreen">FF</Ct><Ct x="lightblue">FF</Ct>"</Ct>
                            <br/>
                            <Ct x="var(--nonaccent)">"rgb(<Ct x="lightcoral">255</Ct>, <Ct x="lightgreen">255</Ct>, <Ct x="lightblue">255</Ct>)"</Ct>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et >&nbsp;align</Et></summary>
                        <P>
                            The align property is of type string and accepts one of the following values:<br/>
                            <Ct x="var(--nonaccent)">"left", "center", "right"</Ct><br/>
                            <br/>
                            It determines which side the text of the "text" subcomponent should be aligned to.
                        </P>
                    </details>
                </P>
                <br/>
                <P>
                    Example of a subcomponent:<br/>
                </P>
                <pre className={`language-js`} style={{ whiteSpace: 'pre-line' }}>
                    <code className="language-js -handbook-code">
                        {code2}
                    </code>
                </pre>
            </>
        )
    }

    const PageFrames = () => {
        return (
            <>
                <P>
                    <Ct x={"var(--accent)"}><Et bold>Frames</Et></Ct> <Et italic>(a.k.a <Ct x={"var(--accent)"}>Components</Ct>)</Et> are the base element for creating your Starblast UI Component.
                </P>
                <br/>
                <P>
                    Frames represent the <Et underline>interactive</Et> aspect of your component.
                    <br/><br/>The properties regarding interactivity of a frame are:
                    <br/>
                    {
                    //&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Ct x={'lightgreen'}>1.</Ct>&nbsp;<code>clickable</code>
                    }
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;1.</Ct></Et>&nbsp;clickable</summary>
                        <P>This property in the frame object determines 
                            if the game should register the users' clicks on the frame
                            <br/><br/>
                            When the user clicks anywhere within the frame, <Ct x={'var(--nonaccent)'}>ui_component_clicked</Ct> event
                            of <Ct x={'var(--nonaccent)'}>this.event</Ct> will be triggered</P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;2.</Ct></Et>&nbsp;shortcut</summary>
                        <P>This property in the frame object should be provided with 
                            one alphanumeric character.<br/><br/>
                            If the user inputs this character, the game will register
                            that as a click on the component, and the <Ct x={'var(--nonaccent)'}>ui_component_clicked</Ct> event
                            of <Ct x={'var(--nonaccent)'}>this.event</Ct> will be triggered
                        </P>
                    </details>
                </P>
                <br/>
                
                <P>
                    The other properties inside the frame object are:
                    <br/>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;1.</Ct></Et>&nbsp;id</summary>
                        <P>
                            This property is used to determine which frame is which.
                            <br/><br/>
                            For example, making a UI component with "id1" and then making a
                            UI component with the "id2" lets the game know that you are creating
                            two separate components. If instead of "id2" you had used "id1" again, you'd
                            be telling the game that you are resetting the same component
                            <br/><br/>
                            Structure the name of your components according to your mods' need.
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;2.</Ct></Et>&nbsp;position</summary>
                        <P>
                            Example of a position property inside a frame:<br/><br/>
                            <code>
                                ship.setUIComponent({'{'}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;...<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;position: [<Ct x="lightblue">25</Ct>, <Ct x="lightcoral">25</Ct>, <Ct x="lightgreen">50</Ct>, <Ct x="orchid">50</Ct>]
                                <br/>{'}'})
                            </code>
                            <br/><br/>
                            <Ct x="lightblue">X</Ct>&nbsp;- Horizontal offset of a frame from the left edge of the screen<br/>
                            <Ct x="lightcoral">Y</Ct>&nbsp;- Vertical offset of a frame from the top edge of the screen<br/>
                            <Ct x="lightgreen">Width</Ct>&nbsp;- Width of the frame, in % of the screen width<br/>
                            <Ct x="orchid">Height</Ct>&nbsp;- Height of the frame, in % of the screen height<br/>
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;3.</Ct></Et>&nbsp;visible</summary>
                        <P>
                            This property determines if the frame and its subcomponents should be visible on the screen.
                        </P>
                    </details>
                    <details className="listing-summary">
                        <summary><Et bold><Ct x={'lightgreen'}>&nbsp;4.</Ct></Et>&nbsp;components</summary>
                        <P>
                            This is an array of objects representing the <Ct x='var(--complement)'>subcomponents&nbsp;</Ct>
                            of your frame.
                            <br/><br/>
                            More on this in the <Ct x='var(--complement)'>subcomponents&nbsp;</Ct>tab
                        </P>
                    </details>
                    <br/>
                    Frames enable you to add <Ct x={"var(--complement)"}>subcomponents</Ct> which represent the <Et underline>visual</Et>
                    &nbsp;aspect of your UI component. Subcomponents of a frame are positioned <Et underline>relative to the frame</Et> instead of the screen,
                </P>
                <br/>
                <P>
                    Hierarchy of frames matters in both Starblast and HUID. 
                    &nbsp;<Et underline>Frames at the top of the component list take priority</Et>
                </P>
                <br/>
                <P>
                    To create a new frame in HUID, simply press the plus icon in the "Components" section of the sidebar.
                </P>
                <br/>
                <P>
                    Example of a frame:
                </P>
                <pre className={`language-js`} style={{ whiteSpace: 'pre-line' }}>
                    <code className="language-js -handbook-code">
                        {code1}
                    </code>
                </pre>
            </>
        )
    }

    return (
        <div className="-handbook-wrapper">
            <div className="-handbook-tabs">
                <div className="-handbook-tab-row">
                    <div 
                        className="-handbook-tab" 
                        onClick={() => setPageSelected("frames")}
                        style={CREATE_STYLES.selectedTab(pageSelected === "frames")}
                        >FRAMES</div>
                    <div 
                        className="-handbook-tab" 
                        onClick={() => setPageSelected("subcomponents")}
                        style={CREATE_STYLES.selectedTab(pageSelected === "subcomponents")}
                        >SUBCOMPONENTS</div>
                </div>
            </div>
            <div className="-handbook-text">
                {
                    pageSelected === "frames"
                    &&
                    <PageFrames/>
                }
                {
                    pageSelected === "subcomponents"
                    &&
                    <PageSubcomponents/>
                }
            </div>
        </div>
    );
})
