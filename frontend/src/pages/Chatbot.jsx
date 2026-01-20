import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2, FileText, Pill, AlertTriangle, ShieldCheck, Activity, Plus, MapPin, Phone } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready');
    const navigate = useNavigate();

    const chatContainerRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioPlayerRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom whenever messages change
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.lang = 'en-US';
            rec.continuous = true;
            rec.interimResults = true;

            rec.onstart = () => {
                setIsListening(true);
                setStatus('Listening...');
            };

            rec.onend = () => {
                setIsListening(false);
                setStatus('Ready');
            };

            rec.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                setInput(transcript);
            };

            rec.onerror = (err) => {
                console.error('Speech recognition error:', err.error);
                setIsListening(false);
                setStatus('Error');
            };

            recognitionRef.current = rec;
        }
    }, []);

    const toggleMic = () => {
        if (!recognitionRef.current) {
            alert('Your browser does not support Speech Recognition');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const playTTS = (url) => {
        if (!voiceEnabled || !url) return;

        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }

        const audio = new Audio(url);
        audioPlayerRef.current = audio;
        audio.play().catch(err => console.warn('Audio play failed:', err));
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const message = input.trim();
        if (!message || isLoading) return;

        if (isListening) recognitionRef.current.stop();

        const userMsg = { id: Date.now(), text: message, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setStatus('Thinking...');

        try {
            const response = await axios.post('http://localhost:5000/api/chat', {
                message: message,
                user_id: 'default_user'
            });
            const data = response.data;

            if (data.success) {
                const botMsg = { id: Date.now() + 1, text: data.response, isUser: false };
                setMessages(prev => [...prev, botMsg]);
                if (data.audio_url) {
                    // Construct full URL for audio
                    const audioUrl = data.audio_url.startsWith('http')
                        ? data.audio_url
                        : `http://localhost:5000${data.audio_url}`;
                    playTTS(audioUrl);
                }
                setStatus('Ready');
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: `Error: ${data.error}`, isUser: false }]);
                setStatus('Error');
            }
        } catch (err) {
            console.error('API Error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Connection error. Please check if the server is running.';
            setMessages(prev => [...prev, { id: Date.now() + 1, text: errorMessage, isUser: false }]);
            setStatus('Error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (m) => {
        if (m.isUser) return <p className="text-white leading-relaxed">{m.text}</p>;

        try {
            const data = JSON.parse(m.text);
            const hasRequiredFields = data.summary || data.medicine || data['risk level'] !== undefined || data.confidence;

            if (!hasRequiredFields) {
                return <p className="text-white leading-relaxed">{m.text}</p>;
            }

            const riskVal = parseInt(data['risk level']) || 0;
            const riskColor = riskVal > 70 ? 'text-red-400' : riskVal > 30 ? 'text-yellow-400' : 'text-green-400';
            const riskBg = riskVal > 70 ? 'bg-red-500/20' : riskVal > 30 ? 'bg-yellow-500/20' : 'bg-green-500/20';

            return (
                <div className="space-y-4 min-w-[300px] md:min-w-[400px]">
                    {data.summary && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                                <FileText size={16} /> SUMMARY
                            </div>
                            <p className="text-white leading-relaxed text-sm md:text-base">{data.summary}</p>
                        </div>
                    )}

                    {data.medicine && (
                        <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                                <Pill size={16} /> MEDICINE / RECOMMENDATIONS
                            </div>
                            <p className="text-blue-100 italic text-sm">{data.medicine}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {data['risk level'] !== undefined && (
                            <div className={`p-3 rounded-xl border border-white/5 ${riskBg}`}>
                                <div className={`flex items-center gap-2 font-bold text-xs mb-1 ${riskColor}`}>
                                    <AlertTriangle size={14} /> RISK LEVEL
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${riskColor.replace('text', 'bg')}`}
                                            style={{ width: `${riskVal}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold ${riskColor}`}>{riskVal}%</span>
                                </div>
                            </div>
                        )}

                        {data.confidence && (
                            <div className="p-3 rounded-xl border border-white/5 bg-purple-500/10 text-purple-200">
                                <div className="flex items-center gap-2 font-bold text-xs mb-1 text-purple-400">
                                    <ShieldCheck size={14} /> CONFIDENCE
                                </div>
                                <p className="text-xs font-medium">{data.confidence}</p>
                            </div>
                        )}
                    </div>

                    {data.hospitals && Array.isArray(data.hospitals) && data.hospitals.length > 0 && (
                        <div className="space-y-2 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                                <MapPin size={16} /> NEARBY HOSPITALS
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {data.hospitals.map((hospital, idx) => (
                                    <div key={idx} className="flex flex-col p-2 bg-white/5 rounded-lg border border-white/5 hover:border-green-500/20 transition-colors">
                                        <div className="flex items-start gap-2 text-sm font-medium text-green-100">
                                            <span className="text-green-500">•</span>
                                            <span>{typeof hospital === 'string' ? hospital : hospital.name}</span>
                                        </div>
                                        {hospital.helpline && hospital.helpline !== 'N/A' && (
                                            <div className="flex items-center gap-2 mt-1 ml-4 text-xs text-white/60">
                                                <Phone size={12} className="text-green-500/70" />
                                                <a href={`tel:${hospital.helpline}`} className="hover:text-green-400 transition-colors">
                                                    {hospital.helpline}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-2 flex items-center gap-3 opacity-30">
                        <div className="h-px flex-1 bg-white/20" />
                        <Activity size={12} className="text-white" />
                        <div className="h-px flex-1 bg-white/20" />
                    </div>
                </div>
            );
        } catch (e) {
            return <p className="text-white leading-relaxed">{m.text}</p>;
        }
    };

    return (
        <div className="pt-24 h-screen flex flex-col max-w-4xl mx-auto px-4">
            {/* Header Info */}
            <div className="flex items-center justify-between mb-4 glass-card px-6 py-4 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <Bot className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white">Medical Assistant</h2>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${status === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                            {status}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-3 rounded-xl transition-all ${voiceEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}`}
                >
                    {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            </div>

            {/* Chat Messages */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-6 px-2 space-y-4 scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500"
                        >
                            <Bot size={48} className="mb-4 opacity-20" />
                            <p>Hello! I am your medical assistant.<br />How can I help you today?</p>
                        </motion.div>
                    )}
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${m.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${m.isUser ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-purple-500/10 border-purple-500/30'
                                    }`}>
                                    {m.isUser ? <User size={16} className="text-yellow-400" /> : <Bot size={16} className="text-purple-400" />}
                                </div>
                                <div className={`p-4 rounded-2xl glass-card ${m.isUser ? 'bg-yellow-500/5' : 'bg-purple-500/5'
                                    }`}>
                                    {renderMessageContent(m)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-3 items-center ml-11 p-3 rounded-2xl bg-white/5 border border-white/10">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                <span className="text-xs text-gray-400">Assistant is thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                className="mb-8 relative"
            >
                <div className="glass-card rounded-2xl flex items-center p-2 gap-2 focus-within:border-purple-500/50 transition-all duration-300">
                    <button
                        type="button"
                        onClick={toggleMic}
                        className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-white/10 text-gray-400'}`}
                    >
                        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/report')}
                        className="p-3 hover:bg-white/10 text-gray-400 rounded-xl transition-all flex items-center justify-center"
                        title="Analyze Reports"
                    >
                        <Plus size={22} />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your medical query here..."
                        className="flex-1 bg-transparent border-none outline-none text-white py-3 px-2 placeholder:text-gray-600"
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-gradient-to-tr from-purple-600 to-purple-400 rounded-xl text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chatbot;
