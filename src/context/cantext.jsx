import { useState, useRef } from "react";
import runChat from "../config/gemini";
import { Context } from "./Context";

const ContextProvider = (props) => {

    const [theme, setTheme] = useState("light");
    const [userName, setUserName] = useState(() => localStorage.getItem("gemini_user") || "");
    const [activePanel, setActivePanel] = useState("");
    const [input,setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [attachedImage, setAttachedImage] = useState(null);
    const [recentImage, setRecentImage] = useState(null);
    const [threads, setThreads] = useState(() => JSON.parse(localStorage.getItem("gemini_threads")) || []);
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const typingIntervalRef = useRef(null);

    const cleanHTML = (html) => {
        if (!html) return "";
        return html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<li>/gi, "* ")
            .replace(/<\/li>/gi, "\n")
            .replace(/<[^>]+>/g, "");
    };

    const formatResponse = (text) => {
        if (!text) return "";

        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Parse Code Blocks: ```lang\ncode\n```
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        escaped = escaped.replace(codeBlockRegex, (match, lang, code) => {
            const displayLang = lang || "code";
            const cleanCode = code.trim();
            const encodedCode = btoa(unescape(encodeURIComponent(cleanCode)));
            return `
<div class="code-block-container">
    <div class="code-block-header">
        <span class="code-block-lang">${displayLang}</span>
        <button class="copy-code-btn" data-code="${encodedCode}">Copy</button>
    </div>
    <pre><code class="language-${displayLang}">${cleanCode}</code></pre>
</div>
`;
        });

        // Parse Inline Code: `code`
        escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

        // Parse Bold Text: **text**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        // Parse Unordered Lists
        const lines = escaped.split("\n");
        let inList = false;
        const formattedLines = lines.map((line) => {
            const listMatch = line.match(/^(\s*)([*\-])\s+(.+)$/);
            if (listMatch) {
                let prefix = "";
                if (!inList) {
                    inList = true;
                    prefix = "<ul>";
                }
                return `${prefix}<li>${listMatch[3]}</li>`;
            } else {
                let prefix = "";
                if (inList) {
                    inList = false;
                    prefix = "</ul>";
                }
                return prefix + line;
            }
        });
        if (inList) {
            formattedLines.push("</ul>");
        }
        escaped = formattedLines.join("\n");

        // Parse Headers
        escaped = escaped.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
        escaped = escaped.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
        escaped = escaped.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

        // Newlines formatting
        escaped = escaped.replace(/\n/g, "<br />");
        escaped = escaped.replace(/<pre>([\s\S]*?)<\/pre>/g, (match, content) => {
            return `<pre>${content.replace(/<br \/>/g, "\n")}</pre>`;
        });
        escaped = escaped.replace(/<ul><br \/>/g, "<ul>");
        escaped = escaped.replace(/<\/li><br \/>/g, "</li>");
        escaped = escaped.replace(/<\/ul><br \/>/g, "</ul>");

        return escaped;
    };

    const updateLastMessageText = (threadId, newText) => {
        setThreads(prevThreads => {
            const updated = prevThreads.map(t => {
                if (t.id === threadId) {
                    const newMessages = [...t.messages];
                    if (newMessages.length > 0) {
                        newMessages[newMessages.length - 1] = {
                            ...newMessages[newMessages.length - 1],
                            text: newText
                        };
                    }
                    return { ...t, messages: newMessages };
                }
                return t;
            });
            localStorage.setItem("gemini_threads", JSON.stringify(updated));
            return updated;
        });
    };

    const runTypingEffect = (fullText, threadId) => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
        }

        const words = fullText.split(/(\s+)/);
        let currentText = "";
        let index = 0;

        setResultData("");

        typingIntervalRef.current = setInterval(() => {
            if (index < words.length) {
                currentText += words[index];
                const formatted = formatResponse(currentText);
                updateLastMessageText(threadId, formatted);
                setResultData(formatted);
                index++;
            } else {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
        }, 12);
    };

    const loadThread = (threadId) => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setCurrentThreadId(threadId);
        setShowResult(true);
        setActivePanel("");
        setLoading(false);
        setResultData("");
    };

    const deleteThread = (threadId, event) => {
        if (event) {
            event.stopPropagation();
        }
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        const updated = threads.filter(t => t.id !== threadId);
        setThreads(updated);
        localStorage.setItem("gemini_threads", JSON.stringify(updated));

        if (currentThreadId === threadId) {
            newChat();
        }
    };

    const newChat = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setRecentPrompt("");
        setActivePanel("");
        setInput("");
        setAttachedImage(null);
        setRecentImage(null);
        setCurrentThreadId(null);
    }

    const toggleTheme = () => {
        setTheme((prev) => prev === "light" ? "dark" : "light");
    }

    const login = (name) => {
        const cleanName = name.trim();

        if (!cleanName) return;

        localStorage.setItem("gemini_user", cleanName);
        setUserName(cleanName);
    }

    const logout = () => {
        localStorage.removeItem("gemini_user");
        setUserName("");
        newChat();
    }

    const openPanel = (panel) => {
        setActivePanel(panel);
        setShowResult(false);
    }

    const clearHistory = () => {
        setThreads([]);
        localStorage.removeItem("gemini_threads");
        newChat();
    }

    const onSent = async (prompt) => {
        if (prompt === undefined && !input.trim() && !attachedImage) return;
        if (prompt !== undefined && !prompt.trim()) return;

        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }

        setResultData("");
        setLoading(true);
        setShowResult(true);
        setActivePanel("");

        let activeId = currentThreadId;
        const promptText = prompt !== undefined ? prompt : input;

        let updatedThreadsList = [...threads];
        if (!activeId) {
            activeId = Date.now().toString();
            const titleText = promptText.slice(0, 25) + (promptText.length > 25 ? "..." : "");
            const newThread = {
                id: activeId,
                title: titleText,
                messages: []
            };
            updatedThreadsList = [newThread, ...updatedThreadsList];
            setCurrentThreadId(activeId);
            setThreads(updatedThreadsList);
            localStorage.setItem("gemini_threads", JSON.stringify(updatedThreadsList));
        }

        const targetThread = updatedThreadsList.find(t => t.id === activeId);
        const pastMessages = targetThread ? targetThread.messages : [];

        const apiHistory = pastMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: cleanHTML(msg.text) }]
        }));

        const currentImage = prompt === undefined ? attachedImage : null;
        const userMsg = {
            role: "user",
            text: promptText,
            image: currentImage ? currentImage.url : null
        };
        const modelMsg = {
            role: "model",
            text: ""
        };

        const nextThreadsList = updatedThreadsList.map(t => {
            if (t.id === activeId) {
                return {
                    ...t,
                    messages: [...t.messages, userMsg, modelMsg]
                };
            }
            return t;
        });

        setThreads(nextThreadsList);
        localStorage.setItem("gemini_threads", JSON.stringify(nextThreadsList));

        setRecentPrompt(promptText);
        setRecentImage(currentImage ? currentImage.url : null);
        setAttachedImage(null);

        if (prompt === undefined) {
            setInput("");
        }

        try {
            const imagePart = currentImage ? {
                inlineData: {
                    data: currentImage.inlineData.data,
                    mimeType: currentImage.inlineData.mimeType
                }
            } : null;

            const response = await runChat(promptText, imagePart, apiHistory);
            runTypingEffect(response, activeId);

        } catch (error) {
            const errorMsg = "Sorry, something went wrong. Please check the console and try again.";
            updateLastMessageText(activeId, errorMsg);
            setResultData(errorMsg);
            console.error(error);
        } finally {
            setLoading(false);
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
        theme,
        toggleTheme,
        userName,
        login,
        logout,
        activePanel,
        openPanel,
        clearHistory,
        input,
        setInput,
        attachedImage,
        setAttachedImage,
        recentImage,
        setRecentImage,
        threads,
        currentThreadId,
        loadThread,
        deleteThread
    }

    return (
        <Context.Provider value={contextValue}>
            <div className={`app-shell ${theme}`}>
                {props.children}
            </div>
        </Context.Provider>
    )
}

export default ContextProvider;
