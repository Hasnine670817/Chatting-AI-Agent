import React from 'react';
import { Menu, Plus, MessageSquare, MenuIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ isOpen, setIsOpen, sessions, currentSessionId, onSelectSession, onNewChat }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          width: isOpen ? 260 : 0, 
          opacity: isOpen ? 1 : 0 
        }}
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 bg-[#f0f4f9] border-r border-gray-200 overflow-hidden flex flex-col shrink-0 h-full",
          !isOpen && "md:border-r-0"
        )}
        style={{ originX: 0 }}
      >
        <div className="p-4 flex items-center h-[72px]">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-200"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="px-3 pb-2">
           <button 
             onClick={onNewChat}
             className="flex w-full items-center gap-3 px-4 py-3 bg-[#e3e3e3] hover:bg-[#d5d5d5] text-gray-800 rounded-full font-medium transition-colors"
           >
             <Plus size={20} />
             New chat
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {sessions.length > 0 && (
             <div className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
          )}
          {sessions.slice().reverse().map(session => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-full text-sm text-left truncate transition-colors",
                currentSessionId === session.id 
                  ? "bg-[#d3e3fd] text-[#041e49] font-medium" 
                  : "text-gray-700 hover:bg-gray-200"
              )}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Toggle button when closed (Desktop mainly, or top header) */}
      {!isOpen && (
        <div className="fixed top-0 left-0 p-4 z-50">
           <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-200"
          >
            <Menu size={24} />
          </button>
        </div>
      )}
    </>
  );
}
