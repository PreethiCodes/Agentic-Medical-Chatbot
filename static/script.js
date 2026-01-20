const API_URL = '/api/chat';

const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const micButton = document.getElementById('micButton');
const speakerButton = document.getElementById('speakerButton');
const speakerIcon = document.getElementById('speakerIcon');
const statusText = document.getElementById('statusText');
const voiceStatus = document.getElementById('voiceStatus');

let voiceEnabled = true;
let recognition = null;
let isListening = false;
let audioPlayer = null;

// ------------------------------
// UI Helpers
// ------------------------------
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const content = document.createElement('div');
    content.className = 'message-content';

    const p = document.createElement('p');
    p.textContent = text;

    content.appendChild(p);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addTypingIndicator() {
    const div = document.createElement("div");
    div.id = "typingIndicator";
    div.className = "message bot-message";
    div.innerText = "Typing...";
    chatContainer.appendChild(div);
}

function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

// ------------------------------
// 🔊 Play server TTS
// ------------------------------
function playServerTTS(audioUrl) {
    if (!voiceEnabled || !audioUrl) return;

    if (audioPlayer) {
        audioPlayer.pause();
    }

    audioPlayer = new Audio(audioUrl);
    audioPlayer.play().catch(err => console.warn("Audio play failed:", err));
}

// ------------------------------
// 🎤 Speech Recognition
// ------------------------------
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Your browser does not support Speech Recognition");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        statusText.textContent = "Listening...";
        micButton.textContent = "🛑";
    };

    recognition.onend = () => {
        isListening = false;
        statusText.textContent = "Ready";
        micButton.textContent = "🎤";
    };

    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        userInput.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };
}

function toggleMic() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// ------------------------------
// Send Message
// ------------------------------
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    if (isListening && recognition) {
        recognition.stop();
    }

    userInput.disabled = true;
    sendButton.disabled = true;
    statusText.textContent = "Thinking...";

    addMessage(message, true);
    userInput.value = "";

    addTypingIndicator();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        removeTypingIndicator();

        if (data.success) {
            addMessage(data.response, false);
            if (data.audio_url) {
                playServerTTS(data.audio_url);
            }
            statusText.textContent = "Ready";
        } else {
            addMessage("Error: " + data.error, false);
            statusText.textContent = "Error";
        }
    } catch (err) {
        removeTypingIndicator();
        addMessage("Connection error", false);
        statusText.textContent = "Error";
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// ------------------------------
// Speaker Toggle
// ------------------------------
function toggleSpeaker() {
    voiceEnabled = !voiceEnabled;

    if (!voiceEnabled && audioPlayer) {
        audioPlayer.pause();
    }

    updateSpeakerUI();
}

function updateSpeakerUI() {
    if (voiceEnabled) {
        speakerIcon.textContent = "🔊";
        voiceStatus.textContent = "Voice: ON";
    } else {
        speakerIcon.textContent = "🔇";
        voiceStatus.textContent = "Voice: OFF";
    }
}

// ------------------------------
// Events
// ------------------------------
sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

micButton.addEventListener("click", toggleMic);
speakerButton.addEventListener("click", toggleSpeaker);

// Init
updateSpeakerUI();
userInput.focus();
