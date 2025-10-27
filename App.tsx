
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, FileData } from './types';
import { Role } from './types';
import { chatModel, streamChatResponse } from './services/geminiService';
import { ChatInput } from './components/ChatInput';
import { MessageComponent } from './components/Message';
import { BotIcon } from './components/icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initial welcome message
    setMessages([
        {
          id: 'welcome-message',
          role: Role.MODEL,
          parts: [{ text: "Hello! I'm your MedGemma Health Assistant. You can ask me health-related questions or upload an image or document for analysis. How can I help you today?\n\n**Disclaimer: I am an AI assistant and not a medical professional. This information is not a substitute for professional medical advice. Please consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health.**"}],
          timestamp: new Date().toISOString(),
        }
    ]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string, file?: FileData) => {
    if (isLoading) return;
    
    setIsLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: Role.USER,
      parts: [
        { text },
        ...(file ? [{ fileData: file }] : [])
      ],
      timestamp: new Date().toISOString(),
    };
    
    const modelMessageId = `model-${Date.now()}`;
    const modelPlaceholder: Message = {
      id: modelMessageId,
      role: Role.MODEL,
      parts: [{ text: '...' }],
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage, modelPlaceholder]);

    try {
      const stream = await streamChatResponse(chatModel, text, file);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId
              ? { ...msg, parts: [{ text: fullResponse + "▌" }] }
              : msg
          )
        );
      }
      
       setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId
              ? { ...msg, parts: [{ text: fullResponse }] }
              : msg
          )
        );

    } catch (error) {
      console.error(error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMessageId
            ? { ...msg, parts: [{ text: `Sorry, I encountered an error. ${error instanceof Error ? error.message : ''}` }] }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 font-sans">
        <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-center shadow-md">
            <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                    <BotIcon />
                </div>
                <h1 className="text-xl font-bold text-gray-200">MedGemma Health Assistant</h1>
            </div>
        </header>
        
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                {messages.map(msg => (
                    <MessageComponent key={msg.id} message={msg} />
                ))}
            </div>
        </main>
        
        <footer className="flex-shrink-0 p-4 bg-gray-900">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <p className="text-center text-xs text-gray-600 mt-3">
               AI can make mistakes. Consider checking important information. Always consult a medical professional for health advice.
            </p>
        </footer>
    </div>
  );
};

export default App;
