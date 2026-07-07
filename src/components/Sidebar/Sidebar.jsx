import React, { useContext, useState } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Sidebar = () => {

    const [extended, setExtended] = useState(false)
    const { newChat, openPanel, threads, currentThreadId, loadThread, deleteThread } = useContext(Context)

    const deleteSvg = (
        <svg className="delete-thread-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    )

    return (
        <div className={`sidebar ${extended ? 'extended' : ''}`}>
            <div className="top">
                <img onClick={() => setExtended(prev => !prev)} className='menu' src={assets.menu_icon} alt="Menu" />
                <div onClick={newChat} className="new-chat">
                    <svg className="new-chat-svg" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.5 15.5l-1.2 1.2a3 3 0 0 1-4.2-4.2l3.4-3.4a3 3 0 0 1 4.2 0" />
                        <path d="M15.5 8.5l1.2-1.2a3 3 0 0 1 4.2 4.2l-3.4 3.4a3 3 0 0 1-4.2 0" />
                        <path d="M8.8 15.2l6.4-6.4" />
                        <path className="new-chat-accent" d="M17.8 17.8l1.7 1.7" />
                    </svg>
                    {extended ? <p>New Chat</p> : null}
                </div>
                {extended ?
                    <div className="recent">
                        <p className="recent-title">Recent</p>
                        <div className="recent-list">
                            {threads.map((thread) => {
                                return (
                                    <div key={thread.id} onClick={() => loadThread(thread.id)} className={`recent-entry ${thread.id === currentThreadId ? 'active' : ''}`}>
                                        <img src={assets.message_icon} alt="" />
                                        <p>{thread.title}</p>
                                        <button type="button" className="delete-thread-btn" onClick={(e) => deleteThread(thread.id, e)} aria-label="Delete chat">
                                            {deleteSvg}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    : null
                }

            </div>
            <div className="bottom">
                <div onClick={() => openPanel("help")} className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="" />
                    {extended ? <p>Help</p> : null}
                </div>
                <div onClick={() => openPanel("history")} className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="" />
                    {extended ? <p>Activity</p> : null}
                </div>
                <div onClick={() => openPanel("settings")} className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="" />
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
