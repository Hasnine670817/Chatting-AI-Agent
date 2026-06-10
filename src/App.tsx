import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatMessage, TypingIndicator } from './components/ChatMessage';
import { Message, ChatSession } from './types';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const WEBHOOK_URL = 'https://n8n.srv1106977.hstgr.cloud/webhook/1a18f5b1-4ea8-4db6-a53d-526f89053d49';
const STORAGE_KEY = 'gemini-chat-sessions';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[parsed.length - 1].id);
        }
      } catch (e) {
        console.error("Failed to load sessions from local storage", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const handleNewChat = () => {
    setCurrentSessionId(null);
  };

  const syncMessageToSession = (newMsg: Message) => {
    let sessionDetailsId = currentSessionId;

    if (!sessionDetailsId) {
      // Create new session if one doesn't exist
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: newMsg.content.slice(0, 30) + (newMsg.content.length > 30 ? '...' : ''),
        messages: [newMsg],
        updatedAt: Date.now(),
      };
      setSessions(prev => [...prev, newSession]);
      setCurrentSessionId(newSession.id);
      return newSession.id;
    } else {
      // Update existing session
      setSessions(prev => prev.map(session => {
        if (session.id === sessionDetailsId) {
          return {
             ...session,
             messages: [...session.messages, newMsg],
             updatedAt: Date.now(),
             // Update title if it's the first message
             title: session.messages.length === 0 ? (newMsg.content.slice(0, 30) + '...') : session.title
          };
        }
        return session;
      }));
      return sessionDetailsId;
    }
  };


  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: Date.now()
    };

    const targetSessionId = syncMessageToSession(userMsg);
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const textResponse = await response.text();
      let assistantContent = textResponse;
      
      // Try parsing JSON if webhook responds with structured data
      try {
        const jsonResponse = JSON.parse(textResponse);
        if (jsonResponse.output) assistantContent = jsonResponse.output;
        else if (jsonResponse.response) assistantContent = jsonResponse.response;
        else if (jsonResponse.message) assistantContent = jsonResponse.message;
        else if (jsonResponse[0] && jsonResponse[0].output) assistantContent = jsonResponse[0].output; // Common n8n array format
        else assistantContent = textResponse; // fallback to stringified JSON
      } catch (e) {
        // Not a JSON response, fallback to text
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        createdAt: Date.now()
      };

      // Add assistant response to the targeted session
      setSessions(prev => prev.map(session => {
        if (session.id === targetSessionId) {
          return {
             ...session,
             messages: [...session.messages, assistantMsg],
             updatedAt: Date.now()
          };
        }
        return session;
      }));

    } catch (error) {
      console.error("Fetch error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "**Error:** We experienced a connection issue. Please make sure the webhook is active and CORS is permissive for UI endpoints.",
        createdAt: Date.now()
      };
      
      setSessions(prev => prev.map(session => {
        if (session.id === targetSessionId) {
          return {
             ...session,
             messages: [...session.messages, errorMsg],
             updatedAt: Date.now()
          };
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#f0f4f9] relative">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
      />
      
      <main className="flex-1 flex flex-col h-full w-full max-w-full relative transition-all duration-300">
        
        {/* Welcome Screen when no messages */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
               className="text-center"
             >
                <h1 className="text-[2.5rem] md:text-[3.5rem] font-medium tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  Hello, Hasnine
                </h1>
                <h2 className="text-[2rem] md:text-[2.5rem] font-medium tracking-tight text-gray-400">
                  How can I help you today?
                </h2>
             </motion.div>
          </div>
        ) : (
          /* Chat Area */
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 w-full pb-32">
            <div className="max-w-4xl mx-auto w-full flex flex-col items-center pt-8">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Floating Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#f0f4f9] via-[#f0f4f9] to-transparent pt-10 pb-2">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
