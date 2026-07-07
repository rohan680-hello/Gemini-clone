import React, { useContext, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Main = () => {

        const { onSent, recentPrompt, showResult, loading, resultData, input, setInput, theme, toggleTheme, userName, logout, activePanel, prevPrompts, clearHistory } = useContext(Context)
    const fileInputRef = useRef(null)
    const recognitionRef = useRef(null)
    const [selectedImage, setSelectedImage] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [voiceStatus, setVoiceStatus] = useState("")

    const cards = [
        {
            text: 'Suggest beautiful places to see on upcoming road trip',
            icon: assets.compass_icon,
        },
        {
            text: 'Briefly summarize this concept: urban planning',
            icon: assets.bulb_icon,
        },
        {
            text: 'Brainstorm team bonding activity for our work retreat',
            icon: assets.message_icon,
        },
        {
            text: 'Improve the readability of the following code',
            icon: assets.code_icon,
        },
    ]

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        setSelectedImage(file.name)
        setInput((prev) => prev ? `${prev} [Image: ${file.name}]` : `[Image: ${file.name}]`)
    }

    const handleVoiceClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setVoiceStatus('Voice input is not supported in this browser.')
            return
        }

        if (isListening) {
            recognitionRef.current?.stop()
            return
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        setVoiceStatus('Listening...')

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setInput((prev) => prev ? `${prev} ${transcript}` : transcript)
            setVoiceStatus('Voice added')
        }

        recognition.onerror = (event) => {
            setIsListening(false)
            setVoiceStatus(event.error === 'not-allowed' ? 'Microphone permission blocked.' : 'Voice input failed. Try again.')
        }

        recognition.onend = () => {
            setIsListening(false)
            recognitionRef.current = null
        }

        try {
            recognition.start()
            setIsListening(true)
        } catch (error) {
            setIsListening(false)
            setVoiceStatus('Voice input could not start.')
            console.error(error)
        }
    }

    const renderPanel = () => {
        if (activePanel === "help") {
            return (
                <div className="info-panel">
                    <h2>Help</h2>
                    <p>Type a prompt and press Enter or the send icon. Use the mic icon for voice input and the image icon to attach an image name to your prompt.</p>
                    <p>Click any suggestion card to send that prompt instantly.</p>
                </div>
            )
        }

        if (activePanel === "history") {
            return (
                <div className="info-panel">
                    <div className="panel-heading">
                        <h2>History</h2>
                        <button type="button" onClick={clearHistory}>Clear</button>
                    </div>
                    {prevPrompts.length ? (
                        <div className="history-list">
                            {prevPrompts.map((prompt, index) => (
                                <button type="button" key={`${prompt}-${index}`} onClick={() => onSent(prompt)}>
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p>No history yet.</p>
                    )}
                </div>
            )
        }

        if (activePanel === "settings") {
            return (
                <div className="info-panel">
                    <h2>Settings</h2>
                    <div className="setting-row">
                        <span>Theme</span>
                        <button type="button" onClick={toggleTheme}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</button>
                    </div>
                    <div className="setting-row">
                        <span>Account</span>
                        <button type="button" onClick={logout}>Logout</button>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <div className='main'>
            <div className="nav">
                <p>Gemini</p>
                <div className="nav-actions">
                    <span className="user-name">{userName}</span>
                    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                    <button type="button" onClick={logout} className="logout-btn">Logout</button>
                    <img src={assets.user_icon} alt="" />
                </div>
            </div>
            <div className="main-container">
                {activePanel ? (
                    renderPanel()
                ) : !showResult ? (
                    <>
                        <div className="greet">
                            <p><span>What's the vibe, {userName}?</span></p>
                            <p>How can I help you today?</p>
                        </div>
                        <div className="cards">
                            {cards.map((card) => (
                                <div key={card.text} onClick={() => onSent(card.text)} className="card" role="button" tabIndex="0">
                                    <p>{card.text}</p>
                                    <img src={card.icon} alt="" />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="result">
                        <div className="result-title">
                            <img src={assets.user_icon} alt="" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result-data">
                            <img src={assets.gemini_icon} alt="" />
                            {loading ? (
                                <div className="loader">
                                    <hr />
                                    <hr />
                                    <hr />
                                </div>
                            ) : (
                                <div className="result-text" dangerouslySetInnerHTML={{ __html: resultData }} />
                            )}
                        </div>
                    </div>
                )}

                <div className="main-bottom">
                    <div className="search-box">
                        <input onChange={(e)=>setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSent()} value={input} type="text" placeholder='Ask Gemini' />
                        <div>
                            <input ref={fileInputRef} onChange={handleImageChange} className="image-input" type="file" accept="image/*" />
                            <img onClick={handleImageClick} src={assets.gallery_icon} alt="Add image" title={selectedImage || 'Add image'} />
                            <img onClick={handleVoiceClick} className={isListening ? 'listening' : ''} src={assets.mic_icon} alt="Voice input" title="Voice input" />
                            {input ? <img onClick={() => onSent()} src={assets.send_icon} alt="Send" /> : null}
                        </div>
                    </div>
                    {voiceStatus ? <p className="voice-status">{voiceStatus}</p> : null}
                    <p className="bottom-info">
                        Gemini is AI and can make mistakes. Please double-check responses.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Main
