import React from 'react';
import { ChatMessageText } from '../../types';

interface ChatMessageProps {
    message: ChatMessageText;
    isLoading?: boolean;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
    const isUser = message.sender === 'user';

    const renderText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\n)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            if (part === '\n') {
                return <br key={index} />;
            }
            return part;
        });
    };

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-lg p-3 rounded-xl shadow-sm ${isUser ? 'bg-primary-gradient text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                {isLoading ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none prose-p:my-2 prose-strong:font-semibold">
                       {renderText(message.text)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessageComponent;
