import React, { useState, useRef, useEffect } from 'react';
    import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
    import { getSnakeCareAdvice } from '../services/geminiService';
    import { ChatMessage } from '../types';
    
    const AIAssistant: React.FC = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: '您好，請問今天有什麼可以幫您？我可以協助回答關於球蟒飼養、基因與環境設置的問題。' }
      ]);
      const [input, setInput] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const messagesEndRef = useRef<HTMLDivElement>(null);
    
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };
    
      useEffect(() => {
        scrollToBottom();
      }, [messages]);
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
    
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);
    
        const responseText = await getSnakeCareAdvice(userText);
    
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        setIsLoading(false);
      };
    
      return (
        <div className="fixed bottom-6 right-6 z-50">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="group bg-white border border-concrete-200 text-concrete-900 p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles size={20} className="text-urban-green" />
              <span className="hidden md:inline text-sm font-medium">智能助理</span>
            </button>
          )}
    
          {isOpen && (
            <div className="bg-white/90 backdrop-blur-2xl border border-white/20 w-[90vw] sm:w-[400px] h-[80vh] sm:h-[600px] rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden ring-1 ring-black/5">
              {/* Header */}
              <div className="p-5 flex justify-between items-center border-b border-concrete-100 bg-white/50">
                <div className="flex items-center gap-3">
                  <div className="bg-urban-green/10 p-2 rounded-lg">
                    <Sparkles size={18} className="text-urban-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-concrete-900 text-sm">Royal AI 顧問</h3>
                    <p className="text-concrete-400 text-xs">24H 飼養諮詢</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="bg-concrete-100 p-2 rounded-full hover:bg-concrete-200 transition-colors text-concrete-500"
                >
                  <X size={18} />
                </button>
              </div>
    
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-concrete-50/50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-concrete-900 text-white rounded-br-none'
                          : 'bg-white text-concrete-800 border border-concrete-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-concrete-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex space-x-1">
                         <div className="w-1.5 h-1.5 bg-urban-green rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-urban-green rounded-full animate-bounce delay-75"></div>
                         <div className="w-1.5 h-1.5 bg-urban-green rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
    
              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-concrete-100">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="請問有什麼關於球蟒的問題嗎？"
                    className="w-full bg-concrete-50 border border-concrete-200 rounded-xl pl-5 pr-12 py-4 text-sm text-concrete-900 placeholder-concrete-400 focus:ring-2 focus:ring-urban-green/20 focus:border-urban-green focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 p-2 bg-urban-green rounded-lg text-white hover:bg-urban-lightGreen disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      );
    };
    
    export default AIAssistant;