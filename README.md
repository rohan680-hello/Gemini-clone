# Premium Google Gemini Clone

⚡ **Live Demo:** [https://gemini-clone-ten-eosin.vercel.app/](https://gemini-clone-ten-eosin.vercel.app/)

A production-grade, highly optimized Gemini Clone built using **React 19**, **Vite 8**, and the **Google Generative AI SDK**. This application mimics the interface of Google Gemini, providing a fast, responsive, and aesthetically polished conversational experience.

---

## 🚀 Key Features

### 1. 🖼️ True Multimodal Image Analysis
Upload files (PNG, JPEG, WebP) directly through the chat input. The application converts images into Base64 streams and passes them inline to the `gemini-2.5-flash` model, allowing you to ask questions about visual diagrams, drawings, or photos.

### 2. 💬 Multi-Turn Persistent Chats (localStorage)
Unlike typical single-turn API wrappers, this clone includes session management. Past conversations are automatically saved in the browser's `localStorage` and listed in the sidebar. You can switch between active conversations, load message logs, or delete threads.

### 3. ✍️ Robust Markdown & Styled Code Blocks
 AI responses are compiled through a custom parser translating Markdown formatting:
* Multi-line code blocks wrapped in a dark-themed IDE-style container.
* Dynamic **Copy Code** buttons mapping encoded text.
* Headings (`#`, `##`, `###`), list points (`-` / `*`), inline tags (`code`), and bold text (`**`).

### 4. 🌊 Word-by-Word Typing Streaming Effect
Simulates real-time API streaming. Text is tokenized by whitespace and newlines, and then animated incrementally using recursive intervals to make the chat feel fluid and natural.

### 5. 🎤 Voice-to-Text Input
Utilizes the Web Speech API (`webkitSpeechRecognition`) to support real-time voice inputs, appending transcribed text directly into the prompt search box.

### 6. 🎨 Premium Glassmorphism UI/UX
Designed with rich modern web aesthetics:
* Frosted glass containers (`backdrop-filter: blur(16px)`).
* Smooth slide-up animations for newly mounted message bubbles.
* Dynamic light/dark theme switching.
* High-performance custom scrolling containers.

---

## 🛠️ Technology Stack

* **Core Library**: [React 19](https://react.dev/) (Hooks: `useContext`, `useRef`, `useState`, `useEffect`)
* **Build Tooling**: [Vite 8](https://vite.dev/) (Super-fast HMR and bundle optimization)
* **SDK Client**: `@google/generative-ai` (Official Google AI model connection)
* **Styling**: Vanilla CSS (Tailored glassmorphism and custom animation systems)
* **Code Quality**: [Oxlint](https://oxc.rs/) (Next-generation high-speed linter)

---

## 📂 Project Architecture

```bash
Gemini-clone/
├── src/
│   ├── assets/          # Project images, custom icons, and static assets
│   ├── components/      # UI Components
│   │   ├── Sidebar/     # Sidebar folder (Sidebar.jsx, Sidebar.css)
│   │   └── main/        # Main chat interface folder (Main.jsx, Main.css)
│   ├── config/          # Configuration files (gemini.js API caller)
│   ├── context/         # React Context API (Context.js provider, cantext.jsx state engine)
│   ├── App.jsx          # Root view controller (switches login vs dashboard)
│   ├── main.jsx         # App mounting entry point
│   └── index.css        # Global CSS layout and theme design tokens
├── dist/                # Production build output
├── .env                 # Environment variables configuration
└── package.json         # Scripts and project dependencies
```

---

## ⚙️ Getting Started & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### 2. Clone the Repository
```bash
git clone https://github.com/rohan680-hello/Gemini-clone.git
cd Gemini-clone
```

### 3. Setup Environment Variables
Create a `.env` file in the root folder and add your Google Gemini API key:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```
*(You can obtain a free API key from [Google AI Studio](https://aistudio.google.com/))*

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) (or the port specified in terminal) in your browser.

### 6. Compile Production Build
```bash
npm run build
```

---

## 💡 Key Engineering Decisions & Design Patterns

### 🚀 1. Performance-Optimized Event Delegation
Instead of attaching individual click event handlers to every generated code copy button (which creates memory overhead and potential memory leaks in React), we registered a **single global click event listener** at the document level:
```javascript
useEffect(() => {
    const handleGlobalClick = (event) => {
        const target = event.target;
        if (target && target.classList.contains("copy-code-btn")) {
            const encodedCode = target.getAttribute("data-code");
            if (encodedCode) {
                // Decode and copy...
            }
        }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
}, []);
```

### 🔒 2. Safe HTML Streaming Parse
To stream formatted text smoothly, the incremental typing script tokenizes word chunks first and formats them *after* appending. Storing formatted text in standard raw strings and parsing them dynamically prevents the browser from rendering unclosed HTML tags (e.g. unclosed lists `<ul>` or bold `<b>` blocks) during typing.

### 💾 3. State Hydration and Session Synchronization
React states synchronize changes to local storage on mutation, and hydrate state objects on layout mounts, preserving active threads even when users refresh their browsers.

---

## 🔮 Future Enhancements & Scaling (Roadmap)

To scale the application, the following updates are planned:
1. **Network Streaming (`generateContentStream`)**: Shift from awaiting full responses to network-level streaming (`for await (const chunk of result.stream)`) to output tokens instantly.
2. **Interactive Code Sandboxes**: Integrate a web preview container (`<iframe>` for web code or WASM-based compilers like Pyodide) to let users run AI-generated code directly in-app.
3. **Voice Synthesis (Speech Synthesis)**: Support Text-to-Speech by adding a speaker icon next to Gemini's responses, utilizing the browser's `SpeechSynthesis` API.
4. **Model Configuration Switcher**: Add a configuration dropdown to let users dynamically toggle between models (`gemini-2.5-flash` vs. `gemini-2.5-pro`) and customize parameters.
5. **Secure Authentication & Cloud Synchronization**: Replace local-storage caching with email/OAuth login flows (Firebase/Supabase) to securely sync chats across multiple devices.
6. **Sidebar Search & Pinning**: Provide filters for past conversation threads and allow pinning important sessions to the sidebar.
