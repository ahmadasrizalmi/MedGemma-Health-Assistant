
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { FileData } from '../types';
import { readFileAsBase64 } from '../utils/fileUtils';
import { SendIcon, PaperclipIcon, XCircleIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (text: string, file?: FileData) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<FileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      try {
        const fileData = await readFileAsBase64(selectedFile);
        setFile(fileData);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  const handleSend = useCallback(() => {
    if ((text.trim() || file) && !isLoading) {
      onSendMessage(text.trim(), file ?? undefined);
      setText('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [text, file, isLoading, onSendMessage]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [text]);

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-2 flex flex-col">
        {file && (
            <div className="bg-gray-700/50 rounded-lg p-2 mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-hidden">
                    {file.type.startsWith('image/') ? (
                        <img src={file.previewUrl} alt={file.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                        <div className="h-10 w-10 bg-gray-600 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                    )}
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                </div>
                <button onClick={removeFile} className="text-gray-400 hover:text-white transition-colors p-1">
                    <XCircleIcon />
                </button>
            </div>
        )}
        <div className="flex items-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Attach file"
            >
              <PaperclipIcon className="h-6 w-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,text/plain,text/markdown"
            />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MedGemma..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none max-h-48 text-lg px-2"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!text.trim() && !file)}
              className="p-3 bg-blue-600 rounded-full text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <SendIcon className="h-5 w-5" />
              )}
            </button>
        </div>
      </div>
    </div>
  );
};
