import React, { useContext, useRef, useState, useEffect } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Main = () => {

    const { onSent, showResult, loading, input, setInput, theme, toggleTheme, userName, logout, activePanel, attachedImage, setAttachedImage, threads, currentThreadId } = useContext(Context)
    const fileInputRef = useRef(null)
    const recognitionRef = useRef(null)
    const resultEndRef = useRef(null)
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

    const activeThread = threads.find(t => t.id === currentThreadId)
    const currentMessages = activeThread ? activeThread.messages : []

    useEffect(() => {
        resultEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentMessages, loading])

    useEffect(() => {
        const handleGlobalClick = (event) => {
            const target = event.target;
            if (target && target.classList.contains("copy-code-btn")) {
                const encodedCode = target.getAttribute("data-code");
                if (encodedCode) {
                    try {
                        const decodedCode = decodeURIComponent(escape(atob(encodedCode)));
                        navigator.clipboard.writeText(decodedCode);
                        
                        const originalText = target.innerText;
                        target.innerText = "Copied!";
                        target.classList.add("copied");
                        
                        setTimeout(() => {
                            target.innerText = originalText;
                            target.classList.remove("copied");
                        }, 2000);
                    } catch (e) {
                        console.error("Failed to copy code:", e);
                    }
                }
            }
        };

        document.addEventListener("click", handleGlobalClick);
        return () => {
            document.removeEventListener("click", handleGlobalClick);
        };
    }, []);

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            setAttachedImage({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                },
                url: reader.result,
                name: file.name
            });
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    }

    const getVoiceErrorMessage = (error) => {
        if (error === 'not-allowed') return 'Microphone permission blocked.'
        if (error === 'no-speech') return 'No speech detected. Try again.'
        if (error === 'audio-capture') return 'No microphone found.'
        if (error === 'network') return 'Voice service network error. Try Chrome or check your internet.'

        return `Voice input failed: ${error}`
    }

    const handleVoiceClick = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setVoiceStatus('Voice input is not supported in this browser.')
            return
        }

        if (!window.isSecureContext) {
            setVoiceStatus('Voice needs localhost or HTTPS.')
            return
        }

        if (isListening) {
            recognitionRef.current?.stop()
            return
        }

        try {
            if (navigator.mediaDevices?.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                stream.getTracks().forEach((track) => track.stop())
            }
        } catch (error) {
            setVoiceStatus(error.name === 'NotAllowedError' ? 'Microphone permission blocked.' : 'Microphone could not start.')
            return
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.lang = 'en-IN'
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
            setVoiceStatus(getVoiceErrorMessage(event.error))
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
                        <h2>History Info</h2>
                        <p>Your conversation history is fully synced locally in the sidebar panel. You can select, run, and delete individual chats.</p>
                    </div>
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
                    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                    <span className="user-name">{userName}</span>
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
                        {currentMessages.map((msg, index) => {
                            if (msg.role === 'user') {
                                return (
                                    <div key={index} className="result-title chat-message">
                                        <img src={assets.user_icon} alt="User Avatar" />
                                        <div className="prompt-content">
                                            {msg.image && <img className="prompt-attached-image" src={msg.image} alt="Uploaded prompt asset" />}
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div key={index} className="result-data chat-message">
                                        <img src={assets.gemini_icon} alt="Gemini Avatar" />
                                        {loading && index === currentMessages.length - 1 && !msg.text ? (
                                            <div className="loader">
                                                <hr />
                                                <hr />
                                                <hr />
                                            </div>
                                        ) : (
                                            <div className="result-text" dangerouslySetInnerHTML={{ __html: msg.text }} />
                                        )}
                                    </div>
                                )
                            }
                        })}
                        <div ref={resultEndRef} />
                    </div>
                )}

                <div className="main-bottom">
                    {attachedImage && (
                        <div className="image-preview-container">
                            <img src={attachedImage.url} alt="Attached preview" />
                            <button type="button" className="remove-image-btn" onClick={() => setAttachedImage(null)} aria-label="Remove image">
                                &times;
                            </button>
                        </div>
                    )}
                    <div className="search-box">
                        <input onChange={(e)=>setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSent()} value={input} type="text" placeholder='Ask Gemini' />
                        <div>
                            <input ref={fileInputRef} onChange={handleImageChange} className="image-input" type="file" accept="image/*" />
                            <img onClick={handleImageClick} src={assets.gallery_icon} alt="Add image" title={attachedImage ? attachedImage.name : 'Add image'} />
                            <img onClick={handleVoiceClick} className={isListening ? 'listening' : ''} src={assets.mic_icon} alt="Voice input" title="Voice input" />
                            {(input || attachedImage) ? <img onClick={() => onSent()} src={assets.send_icon} alt="Send" /> : null}
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
