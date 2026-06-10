import React from 'react';
import { motion } from 'motion/react';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full py-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] sm:max-w-[75%]",
        isUser ? "flex-row-reverse" : "flex-row gap-4"
      )}>
        
        {/* Avatar purely for Assistant (Gemini style usually implies it, user is just right aligned) - but let's add subtle icons if desired. */}
        {!isUser && (
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
             <Sparkles size={16} className="text-white" />
           </div>
        )}

        <div className={cn(
          "px-5 py-3.5 text-[15px] leading-relaxed",
          isUser 
            ? "bg-[#e3e3e3] text-gray-900 rounded-[24px] rounded-br-[8px]" 
            : "bg-transparent text-gray-800"
        )}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-headings:font-medium prose-a:text-blue-600 hover:prose-a:underline">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full py-6 justify-start"
    >
      <div className="flex gap-4">
         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 mt-1 animate-pulse">
             <Sparkles size={16} className="text-white" />
         </div>
        
        <div className="px-1 py-4 flex items-center gap-1.5 h-[50px]">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
            className="w-2 h-2 rounded-full bg-indigo-500" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-indigo-500" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-indigo-500" 
          />
        </div>
      </div>
    </motion.div>
  );
}
