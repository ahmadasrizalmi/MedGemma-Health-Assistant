import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, MessagePart } from '../types';
import { Role } from '../types';
import { UserIcon, BotIcon } from './icons';

interface MessageProps {
  message: Message;
}

const MessageFilePreview: React.FC<{ part: MessagePart }> = ({ part }) => {
    if (!part.fileData) return null;

    if (part.fileData.type.startsWith('image/')) {
        return (
            <div className="mt-2">
                <img src={part.fileData.previewUrl} alt={part.fileData.name} className="max-w-xs rounded-lg border border-gray-600" />
            </div>
        );
    }

    return (
        <div className="mt-2 p-3 bg-gray-700 rounded-lg flex items-center space-x-3 border border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-sm font-medium text-gray-300">{part.fileData.name}</span>
        </div>
    );
};

export const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isModel = message.role === Role.MODEL;

  const combinedText = message.parts.map(p => p.text).join('');

  return (
    <div className={`flex items-start gap-4 my-6 ${isUser ? 'justify-end' : ''}`}>
        {isModel && (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <BotIcon />
            </div>
        )}
        <div className={`max-w-2xl w-full ${isUser ? 'order-1' : 'order-2'}`}>
            <div className={`px-5 py-4 rounded-2xl ${isUser ? 'bg-blue-600' : 'bg-gray-800'}`}>
                {message.parts.map((part, index) => (
                    <MessageFilePreview key={index} part={part} />
                ))}
                {combinedText && (
                    <div className="prose prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {combinedText}
                       </ReactMarkdown>
                    </div>
                )}
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </p>
        </div>
        {isUser && (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 order-2">
                <UserIcon />
            </div>
        )}
    </div>
  );
};