import React, { useContext, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Main = () => {

        const { onSent, recentPrompt, showResult, loading, resultData, input, setInput, theme, toggleTheme } = useContext(Context)
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

    return (
        <div className='main'>
            <div className="nav">
                <p>Gemini</p>
                <div className="nav-actions">
                    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                    <img src={assets.user_icon} alt="" />
                </div>
            </div>
            <div className="main-container">
                {!showResult ? (
                    <>
                        <div className="greet">
                            <p><span>What's the vibe, Rohan?</span></p>
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
