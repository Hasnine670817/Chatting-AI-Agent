import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6">
      <motion.div 
        layout
        className={cn(
          "bg-white rounded-[2rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 flex items-center px-4 py-2 relative overflow-hidden transition-all duration-300",
          isLoading ? "opacity-80" : "opacity-100"
        )}
      >
        {/* Subtle glowing border effect when typing (optional) */}
        {input && (
           <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-10 animate-pulse pointer-events-none" />
        )}

        <button className="p-3 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 shrink-0">
          <Plus size={20} className="stroke-[2.5]" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini"
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none px-2 py-3 text-gray-800 placeholder:text-gray-500 text-base max-h-[150px]"
          style={{ minHeight: '48px', lineHeight: '24px' }}
        />

        <div className="flex items-center gap-1 shrink-0">
          {input.trim() ? (
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          ) : (
            <>
              <button className="flex items-center gap-1 p-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100">
                Flash <ChevronDown size={14} />
              </button>
               <button className="p-3 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100">
                <Mic size={20} />
              </button>
            </>
          )}
        </div>
      </motion.div>
      <div className="text-center mt-3 text-xs text-gray-400 font-medium tracking-wide">
        Gemini is AI and can make mistakes.
      </div>
    </div>
  );
}
