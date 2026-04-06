import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Trash2 } from 'lucide-react';
import { ChatbotMessage } from '../../types';

interface ChatWindowProps {
    messages: ChatbotMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onClose: () => void;
    onClearChat: () => void;
    user?: any;
    isAuthenticated: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    onSendMessage,
    isLoading,
    onClose,
    onClearChat,
    user,
    isAuthenticated
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-focus input after sending message or when component mounts
    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading, messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && !isLoading) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

    // Safe message formatting with error handling
    const formatMessage = (text: string | undefined) => {
        if (!text) {
            return [<div key="empty">Message unavailable</div>];
        }
        
        try {
            return text.split('\n').map((line, index) => (
                <div key={index}>
                    {line}
                    {index < text.split('\n').length - 1 && <br />}
                </div>
            ));
        } catch (error) {
            console.error('Error formatting message:', error);
            return [<div key="error">Error displaying message</div>];
        }
    };

    return (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-primary-gradient text-white p-4 rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                    </div>
                    <div>
                        <h3 className="font-semibold">Evergreen AI</h3>
                        <p className="text-white/80 text-sm">
                            {isAuthenticated ? `Hello ${user?.firstName || 'there'}!` : 'Online Pharmacy Assistant'}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onClearChat}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        title="Clear chat"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                            }`}
                        >
                            <div className="whitespace-pre-wrap">
                                {formatMessage(message.parts[0]?.text)}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-xs text-gray-500 text-center mt-2">
                    {isAuthenticated ? '🔒 Your data is secure' : '🔓 Public mode - limited access'}
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;