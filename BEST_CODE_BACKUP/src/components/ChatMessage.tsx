
import React from 'react';
import { Volume2, VolumeX, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis is not supported in your browser');
      return;
    }
    
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      toast.info('Speaking response...');
      onSpeak(message.text);
    }
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.isUser 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
            : 'bg-gradient-to-r from-green-500 to-blue-500'
        }`}>
          {message.isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl px-4 py-3 max-w-full break-words ${
              message.isUser
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'bg-gradient-to-r from-green-100 to-blue-100 text-gray-800 border border-green-200'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
          
          {/* Message Actions */}
          <div className={`flex items-center mt-1 space-x-2 opacity-70 group-hover:opacity-100 transition-opacity ${
            message.isUser ? 'flex-row-reverse' : ''
          }`}>
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
            
            {!message.isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className="h-6 w-6 p-0 text-gray-500 hover:text-green-600"
              >
                {isSpeaking ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
