import React from 'react'
import './SaveModal.css'
import { ICONS } from '../Main/Sidebar/ICONS'
import { ElementsContext } from '../../context/ElementsContext'

const formattedDate = () => new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function SaveModal(props) {
    const ELEMENTS_CONTEXT = React.useContext(ElementsContext);

    const [objectLocalStorage, setObjectLocalStorage] = React.useState(Object.fromEntries(Object.entries(localStorage)));
   
    const refreshObjectLocalStorage = () => setObjectLocalStorage(Object.fromEntries(Object.entries(localStorage)));

    const [form, setForm] = React.useState({
        active: false,
        overwrite: {
            asked: false,
            accepted: false
        },
        saveCurrent: {
            asked: false,
            scheduled: false,
            id: ""
        },
        deleteProject: {
            asked: false,
            id: ""
        },
        data: {
            name: ""
        }
    })

    const toggleFormInput = () => {
        setForm(prev => ({...prev, active: !prev.active}))
    }

    const overwrite = {
        ask: () => setForm(prev => ({...prev, overwrite: {...prev.overwrite, asked: !prev.overwrite.asked}})),
        accept: () => setForm(prev => ({...prev, overwrite: {...prev.overwrite, accepted: !prev.overwrite.accepted}})),
        reset: () => setForm(prev => ({...prev, overwrite: {asked: false, accepted: false}})),
    }

    const saveCurrent = {
        ask: (id = null) => setForm(prev => ({...prev, saveCurrent: id ? {...prev.saveCurrent, id: id, asked: !prev.saveCurrent.asked} : {...prev.saveCurrent, asked: !prev.saveCurrent.asked}})),
        schedule: () => setForm(prev => ({...prev, saveCurrent: {...prev.saveCurrent, scheduled: true}})),
        reset: () => setForm(prev => ({...prev, saveCurrent: {asked: false, scheduled: false, id: ""}})),
    }

    const deleteProject = {
        ask: (id = null) => setForm(prev => ({...prev, deleteProject: id ? {...prev.deleteProject, id: id, asked: !prev.deleteProject.asked} : {...prev.deleteProject, asked: !prev.deleteProject.asked}})),
        reset: () => setForm(prev => ({...prev, deleteProject: {asked: false, id: ""}}))
    }

    const saveProjectFromForm = (e, forceAcceptOverwrite = false) => {
        if (!form.data.name) return;

        if (objectLocalStorage[`huidproj_${form.data.name}`] && !forceAcceptOverwrite) {
            return overwrite.ask();
        }

        localStorage.setItem(`huidproj_${form.data.name}`, JSON.stringify({
            data: {components: ELEMENTS_CONTEXT.components, snaplines: ELEMENTS_CONTEXT.snaplines},
            timestamp: formattedDate()
        }));

        refreshObjectLocalStorage();
        toggleFormInput();
        setForm(prev => ({...prev, data: {name: ""}}))

        if (form.saveCurrent.scheduled) {
            loadProject(form.saveCurrent.id, true);
        }
    }

    const changeName = (e) => {
        setForm(prev => ({
            ...prev,
            data: {
                ...prev.data,
                name: e.target.value
            }
        }))
    }

    const acceptOverwrite = () => {
        saveProjectFromForm(null, true);
        overwrite.reset();
    }

    const loadProject = (key, forceAccept = false) => {
        if (!forceAccept) {
            return saveCurrent.ask(key);
        }
        ELEMENTS_CONTEXT.other.parseSavedProject(objectLocalStorage[key]);
        saveCurrent.reset();
    }

    const removeProject = (e, key, forceRemove = false) => {
        e && e.stopPropagation();
        if (forceRemove) {
            try {
                localStorage.removeItem(key);
                refreshObjectLocalStorage();
            } catch (ex) {
                console.warn("Failed to remove project: " + ex)
            }
        } else {
            deleteProject.ask(key);
        }
    }

    return (
        <>
            <h1 className='-sm-title'>PROJECTS</h1>
            <div className='-sm-main-wrapper'>
                <div className='-sm-main-projects'>
                    {
                        Object.keys(objectLocalStorage).map(key => {
                            let isProject = key.startsWith("huidproj_");
                            if (!isProject) return;

                            let parsed = JSON.parse(objectLocalStorage[key]);

                            return (
                                <div className='-sm-main-projects-project' onClick={() => loadProject(key)}>
                                    <div className='-sm-main-projects-project-info'>
                                        <h6 className='-sm-main-projects-project-name'>{key.slice(9)}</h6>
                                        <h6 className='-sm-main-projects-project-date'>{parsed.timestamp}</h6>
                                    </div>
                                    <div className='-sm-main-projects-project-icons-wrapper' onClick={(e) => removeProject(e, key)}>
                                        {ICONS.delete}
                                    </div>
                                </div>
                            )
                        })
                    }
                    
                </div>
                <div className="-sm-save-section">
                    {
                        form.saveCurrent.asked
                        ?
                        (
                            <>
                                <div className="-sm-save-section-title white center">Save current project before loading?</div>
                                <div className="-sm-save-section-buttons-wrapper">
                                    <div className="-sm-save-section-button half" onClick={() => {saveCurrent.schedule(); saveCurrent.ask(); toggleFormInput()}}>YES</div>
                                    <div className="-sm-save-section-button half complement" onClick={() => loadProject(form.saveCurrent.id, true)}>NO</div>
                                </div>
                            </>
                        )    
                        :
                        form.deleteProject.asked
                        ?
                        (
                            <>
                                <div className="-sm-save-section-title white center">Are you sure?</div>
                                <div className="-sm-save-section-buttons-wrapper">
                                    <div className="-sm-save-section-button half" onClick={() => {removeProject(null, form.deleteProject.id, true); deleteProject.reset()}}>YES</div>
                                    <div className="-sm-save-section-button half complement" onClick={() => deleteProject.reset()}>NO</div>
                                </div>
                            </>
                        )
                        :
                        <>
                            {
                                !form.active
                                ?
                                (
                                    <>
                                        <div className="-sm-save-section-button" onClick={toggleFormInput}>
                                            SAVE PROJECT
                                        </div>
                                        <div className="-sm-save-section-button">
                                            SAVE PROJECT AS FILE
                                        </div>
                                        <div className="-sm-save-section-button complement">
                                            LOAD PROJECT FROM FILE
                                        </div>
                                    </>
                                )
                                :
                                (
                                    !form.overwrite.asked
                                    ?
                                    (
                                        <>
                                            <div className="-sm-save-section-title">Project name:</div>
                                            <input className="-sm-save-section-input" value={form.data.name} onChange={changeName}></input>
                                            <div className="-sm-save-section-buttons-wrapper">
                                                <div className="-sm-save-section-button half" onClick={saveProjectFromForm}>SAVE</div>
                                                <div className="-sm-save-section-button half complement" onClick={toggleFormInput}>CANCEL</div>
                                            </div>
                                        </>
                                    )
                                    :
                                    (
                                        <>
                                            <div className="-sm-save-section-title white center">Overwrite?</div>
                                            <div className="-sm-save-section-buttons-wrapper">
                                                <div className="-sm-save-section-button half" onClick={acceptOverwrite}>YES</div>
                                                <div className="-sm-save-section-button half complement" onClick={overwrite.ask}>NO</div>
                                            </div>
                                        </>
                                    )
                                )
                            }
                        </>             
                    }
                </div>
            </div>
        </>
    )
}
