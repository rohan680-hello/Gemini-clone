import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {

    const [input,setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const formatResponse = (text) => {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
            .replace(/^\s*\*\s+/gm, "&#8226; ")
            .replace(/\n/g, "<br />");
    }

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setRecentPrompt("");
        setInput("");
    }

    const onSent = async (prompt) => {
        if (prompt === undefined && !input.trim()) return;
        if (prompt !== undefined && !prompt.trim()) return;

        setResultData("");
        setLoading(true);
        setShowResult(true);
        
        let response;

        try {
            if (prompt !== undefined) {
                setRecentPrompt(prompt);
                response = await runChat(prompt);
            } else {
                setPrevPrompts((prev) => prev.includes(input) ? prev : [...prev, input]);
                setRecentPrompt(input);
                response = await runChat(input);
            }

            setResultData(formatResponse(response));

        } catch (error) {
            setResultData("Sorry, something went wrong. Please check the console and try again.");
            console.error(error);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        newChat,
        input,
        setInput
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider;
