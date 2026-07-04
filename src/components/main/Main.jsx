import React, { useContext } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/cantext'

const Main = () => {

        const { onSent, recentPrompt, showResult, loading, resultData, input, setInput } = useContext(Context)

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

    return (
        <div className='main'>
            <div className="nav">
                <p>Gemini</p>
                <img src={assets.user_icon} alt="" />
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
                            <img src={assets.gallery_icon} alt="" />
                            <img src={assets.mic_icon} alt="" />
                            {input ? <img onClick={() => onSent()} src={assets.send_icon} alt="Send" /> : null}
                        </div>
                    </div>
                    <p className="bottom-info">
                        Gemini is AI and can make mistakes. Please double-check responses.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Main
