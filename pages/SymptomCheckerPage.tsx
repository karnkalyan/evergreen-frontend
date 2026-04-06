import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Product, ChatMessage } from '../types';
import { PRODUCTS } from '../data/mockData';
import Button from '../components/shared/Button';
import ChatMessageComponent from '../components/symptom-checker/ChatMessage';
import ProductSuggestion from '../components/symptom-checker/ProductSuggestion';

const SymptomCheckerPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            type: 'text',
            sender: 'ai',
            text: "Hello! I'm your AI Health Assistant. Please describe your symptoms, and I'll suggest some over-the-counter products that might help. \n\n**Disclaimer:** I am not a medical professional. Please consult with a doctor for any medical advice."
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: ChatMessage = { type: 'text', sender: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const productListForAI = PRODUCTS.map(p => ({
                name: p.name,
                slug: p.slug,
                description: p.description,
                treats_symptoms: p.symptoms,
                category: p.category.name
            })).slice(0, 30); // Limiting context size

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: trimmedInput,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            reply: {
                                type: Type.STRING,
                                description: 'A friendly, conversational response explaining product suggestions. This response MUST include the disclaimer: "Disclaimer: I am not a medical professional. Please consult with a doctor for any medical advice."',
                            },
                            suggested_slugs: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: 'An array of product slugs from the provided list that are relevant to the user\'s symptoms. The array can be empty if no products are relevant.',
                            },
                        },
                        required: ['reply', 'suggested_slugs']
                    },
                    systemInstruction: `You are an AI health assistant for an online pharmacy called Evergreen Medicine.
Your task is to analyze user-described symptoms and suggest relevant over-the-counter products from a provided list.
You MUST follow these rules:
1.  Your suggestions must ONLY come from this list of products: ${JSON.stringify(productListForAI)}.
2.  Provide a friendly, conversational response explaining your suggestions.
3.  You are NOT a medical professional. You MUST NOT provide medical advice.
4.  You MUST include this exact disclaimer in your response: "Disclaimer: I am not a medical professional. Please consult with a doctor for any medical advice."
5.  Keep your response concise.
6.  You MUST return your response in the specified JSON format.`,
                },
            });
            
            const jsonResponse = JSON.parse(response.text);
            const aiReply = jsonResponse.reply;
            const suggestedSlugs = jsonResponse.suggested_slugs || [];

            const aiMessage: ChatMessage = { type: 'text', sender: 'ai', text: aiReply };
            setMessages(prev => [...prev, aiMessage]);
            
            if (suggestedSlugs.length > 0) {
                const suggestedProducts = PRODUCTS.filter(p => suggestedSlugs.includes(p.slug));
                if (suggestedProducts.length > 0) {
                    const suggestionMessage: ChatMessage = { type: 'suggestion', products: suggestedProducts };
                    setMessages(prev => [...prev, suggestionMessage]);
                }
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: ChatMessage = { type: 'text', sender: 'ai', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft-lg flex flex-col h-[calc(100vh-10rem)]">
                    <div className="p-4 border-b">
                        <h1 className="text-xl font-poppins font-bold text-slate-800">AI Health Assistant</h1>
                        <p className="text-sm text-slate-500">Get product suggestions based on your symptoms</p>
                    </div>
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {messages.map((msg, index) => {
                            if (msg.type === 'text') {
                                return <ChatMessageComponent key={index} message={msg} />;
                            }
                            if (msg.type === 'suggestion') {
                                return <ProductSuggestion key={index} products={msg.products} />;
                            }
                            return null;
                        })}
                        {isLoading && (
                            <ChatMessageComponent message={{ type: 'text', sender: 'ai', text: 'Thinking...' }} isLoading={true} />
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t bg-slate-50">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Describe your symptoms..."
                            className="flex-grow p-3 bg-white border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !userInput.trim()}>
                            Send
                        </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SymptomCheckerPage;