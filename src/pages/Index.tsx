import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Settings, BookOpen, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ChatMessage from '@/components/ChatMessage';
import VoiceControls from '@/components/VoiceControls';
import KnowledgeBase from '@/components/KnowledgeBase';
import AISettings from '@/components/AISettings';
import { supabase } from '@/integrations/supabase/client';
import DIAALogo from '../DIAA LOGO.png';
import { useAuthStore } from '@/store/auth';
import AdminLogin from '@/components/AdminLogin';
import { usePronunciationStore } from '@/store/pronunciation';
import BengaliSpeechRecognition from '@/components/BengaliSpeechRecognition';
import { useThemeStore } from '@/store/theme';
import { motion, AnimatePresence } from "framer-motion";
import { getMistralApiKey } from '@/lib/apiKeys';

// Add TypeScript declarations at the top of the file
interface CustomWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
  preferredVoice: SpeechSynthesisVoice | null;
  bengaliVoice: SpeechSynthesisVoice | null;
}

declare const window: CustomWindow;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const { currentTheme } = useThemeStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! 👋 I'm DIAA, your friendly guide to Daffodil International University! Whether you're curious about admissions, courses, campus life, or anything DIU-related, I'm here to help with a smile. What would you like to know? 😊",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'bn-BD' | 'en-US'>('en-US');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isAdmin, logout } = useAuthStore();
  const [isIntentionalStop, setIsIntentionalStop] = useState(false);
  const [isSpeechCanceled, setIsSpeechCanceled] = useState(false);
  const { loadPronunciations } = usePronunciationStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add mouse position tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    loadKnowledgeBase();
    loadApiKey();
    loadPronunciations();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      const { data: entries } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (entries) {
        const combinedContent = entries
          .map((entry) => `# ${entry.title}\nCategory: ${entry.category}\n\n${entry.content}\n\n---\n`)
          .join('\n');
        setKnowledgeBase(combinedContent);
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      toast.error('Failed to load knowledge base');
    }
  };

  const loadApiKey = async () => {
    try {
      const key = await getMistralApiKey();
      if (key) {
        setApiKey(key);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      toast.error('Failed to load API key');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'bn-BD' ? 'en-US' : 'bn-BD';
    setCurrentLanguage(newLang);
    toast.success(`Switched to ${newLang === 'bn-BD' ? 'Bengali' : 'English'} mode`);
  };

  const startListening = () => {
    setIsListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Warm up the speech synthesis engine
      const warmup = new SpeechSynthesisUtterance('');
      speechSynthesis.speak(warmup);
      
      // Get available voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        if (voices.length > 0) {
          // Try to find the best Bengali voice
          const bengaliVoice = voices.find(
            voice => 
              // Try Microsoft's or Google's Bengali voices first
              (voice.name.includes('Microsoft') || voice.name.includes('Google')) &&
              (voice.lang.includes('bn') || 
               voice.name.toLowerCase().includes('bangla') ||
               voice.name.toLowerCase().includes('bengali'))
          ) || voices.find(
            // Then try any Bengali voice
            voice => 
              voice.lang.includes('bn') || 
              voice.name.toLowerCase().includes('bangla') ||
              voice.name.toLowerCase().includes('bengali')
          );

          // Store Bengali voice if found
          if (bengaliVoice) {
            window.bengaliVoice = bengaliVoice;
            console.log('Selected Bengali voice:', bengaliVoice.name);
          } else {
            // Try to find a South Asian voice as fallback
            const southAsianVoice = voices.find(
              voice => 
                voice.name.toLowerCase().includes('hindi') || 
                voice.name.toLowerCase().includes('indian')
            );
            if (southAsianVoice) {
              window.bengaliVoice = southAsianVoice;
              console.log('Using South Asian voice as fallback:', southAsianVoice.name);
            }
          }

          // Find English voice for non-Bengali text
          const preferredVoice = voices.find(
            voice => 
              voice.lang.includes('en') && 
              voice.name.toLowerCase().includes('female')
          ) || voices.find(
            voice => voice.lang.includes('en-US')
          ) || voices[0];
          
          window.preferredVoice = preferredVoice;
          console.log('Selected English voice:', preferredVoice.name);
        }
      };

      // Load voices when they become available
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();

      // Clean up
      return () => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsSpeechCanceled(true);
      };
    }
  }, []);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      setIsSpeechCanceled(true);
      setTimeout(() => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }, 0);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        setIsSpeechCanceled(false);
        speechSynthesis.cancel();

        // Get custom pronunciations
        const getPronunciation = usePronunciationStore.getState().getPronunciation;
        
        // Remove emojis from text before processing
        let processedText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F191}-\u{1F251}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{23F3}]|[\u{24C2}]|[\u{23E9}-\u{23EF}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{0023}-\u{0039}]\u{FE0F}?\u{20E3}|[\u{200D}]|[\u{FE0F}]/gu, '').trim();
        
        // Replace words with their custom pronunciations
        const words = Object.keys(usePronunciationStore.getState().dictionary);
        words.forEach(word => {
          const pronunciation = getPronunciation(word);
          if (pronunciation) {
            const regex = new RegExp(word, 'gi');
            processedText = processedText.replace(regex, pronunciation);
          }
        });

        // Clean up multiple spaces that might be left after emoji removal
        processedText = processedText.replace(/\s+/g, ' ').trim();

        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Detect if the text contains Bengali script
        const containsBengali = /[\u0980-\u09FF]/.test(processedText);
        
        if (containsBengali) {
          const voices = speechSynthesis.getVoices();
          const bengaliVoice = voices.find(
            voice => 
              voice.lang.includes('bn') || 
              voice.name.toLowerCase().includes('bangla') ||
              voice.name.toLowerCase().includes('bengali')
          );
          
          if (bengaliVoice) {
            utterance.voice = bengaliVoice;
            utterance.lang = 'bn-BD';
          } else {
            const southAsianVoice = voices.find(
              voice => 
                voice.name.toLowerCase().includes('hindi') || 
                voice.name.toLowerCase().includes('indian')
            );
            
            if (southAsianVoice) {
              utterance.voice = southAsianVoice;
            }
            
            utterance.lang = 'bn-BD';
          }

      utterance.rate = 0.9;
          utterance.pitch = 1.0;
        } else {
          if (window.preferredVoice) {
            utterance.voice = window.preferredVoice;
          }
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
        }
      
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsSpeechCanceled(false);
        };

        utterance.onend = () => {
          if (!isSpeechCanceled) {
            setIsSpeaking(false);
          }
        };

        utterance.onerror = (event) => {
          // Ignore errors if speech was canceled or if it's the initial setup
          if (!isSpeechCanceled && event.error !== 'canceled') {
            const containsBengali = /[\u0980-\u09FF]/.test(processedText);
            toast.error(containsBengali ? 'বাংলা উচ্চারণে সমস্যা হয়েছে' : 'Error in speech synthesis');
            setIsSpeaking(false);
    }
  };

        speechSynthesis.speak(utterance);
      } catch (error) {
        // Ignore any errors during speech synthesis if it was canceled
        if (!isSpeechCanceled) {
          console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
      }
    }
  };

  const testVoice = () => {
    const testText = "Hello! I am your DIU Assistant. আমি ডাফোডিল ইন্টারন্যাশনাল ইউনিভার্সিটির AI সহকারী। আপনি কীভাবে সাহায্য পেতে চান?";
    speakText(testText);
  };

  const voiceControlProps = {
    isListening,
    isSpeaking,
    onStartListening: startListening,
    onStopListening: stopListening,
    onStopSpeaking: stopSpeaking,
    onTestVoice: testVoice
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (!apiKey) {
      toast.error('Please set your Mistral AI API key in settings');
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are DIAA (Daffodil Intelligent Admission Assistant), a friendly and helpful AI assistant for Daffodil International University (DIU). You sound human, engaging, and helpful, like a cheerful DIU student guide. Your personality traits:

1. Friendly and Engaging:
- Use a warm, welcoming tone
- Include appropriate emojis occasionally (1-2 max per message)
- Address users casually but respectfully
- Show enthusiasm when discussing DIU

2. Conversational Style:
- Keep responses brief and focused (2-3 short paragraphs max)
- Use natural, everyday language
- Break information into small, digestible chunks
- Ask follow-up questions to maintain engagement

3. Response Format:
- Start with a brief, direct answer
- Add relevant details if needed (but keep it concise)
- End with a question or engaging prompt when appropriate

4. Knowledge Sharing:
- Prioritize most relevant information first
- Use bullet points for lists (keep them short)
- Share interesting facts about DIU when relevant
- Admit when you need more information

5. Security Guidelines:
- NEVER share internal or sensitive information from the knowledge base
- For requests about exports, PDFs, or documents, respond with:
  "I can help you with information about DIU, but I can't create or send files. For official documents, please contact the university administration directly."
- If users request to save or export information, suggest they:
  1. Take notes from our conversation
  2. Visit the official DIU website
  3. Contact the relevant department
- Maintain privacy and confidentiality of internal university data

${knowledgeBase ? `Here's the university knowledge base to inform your responses:\n${knowledgeBase}\n\n` : ''}

Remember: Be friendly and fun, but maintain professionalism. Keep responses concise and engaging. If you don't have specific information or if someone requests documents/exports, guide them to contact the university directly.`;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      speakText(aiResponse);
      
    } catch (error) {
      console.error('Error calling Mistral AI:', error);
      toast.error('Failed to get AI response. Please check your API key and try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleTranscript = (text: string) => {
    setInputText(text);
  };

  const renderTheme1Layout = () => (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-[${currentTheme.colors.background.from}] via-[${currentTheme.colors.background.via}] to-[${currentTheme.colors.background.to}]`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-[${currentTheme.colors.primary.from}] to-[${currentTheme.colors.primary.to}] sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start mb-4 sm:mb-0">
              <img 
                src={DIAALogo} 
                alt="DIAA Logo" 
                className="h-auto w-[180px] sm:w-[140px]"
              />
            </div>
            <div className="flex justify-end">
              {renderAdminButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 mb-16">
        <Card className={`bg-white/90 backdrop-blur-sm border-[${currentTheme.colors.primary.to}]/20 shadow-xl`}>
          {/* Messages */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSpeak={speakText}
                isSpeaking={isSpeaking}
                onStopSpeaking={stopSpeaking}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-[#D0F1FF] to-[#E0FFF6] rounded-lg px-4 py-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#007BFF] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#00C896] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#007BFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-[#555555]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[${currentTheme.colors.primary.to}]/20 p-4">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentLanguage === 'bn-BD' 
                    ? 'আপনার প্রশ্ন লিখুন...' 
                    : 'Ask me anything about DIU! I\'m here to help...'}
                  className={`w-full min-h-[50px] sm:min-h-[44px] px-4 py-3 border-[${currentTheme.colors.primary.to}]/30 focus:border-[${currentTheme.colors.primary.from}] focus:ring-[${currentTheme.colors.primary.from}] text-base sm:text-sm`}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="grid grid-cols-2 sm:flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleLanguage}
                    className={`h-[50px] sm:h-10 px-4 border-[${currentTheme.colors.primary.to}]/30 hover:border-[${currentTheme.colors.primary.to}] transition-all hover:scale-105 w-full sm:w-auto`}
                  >
                    {currentLanguage === 'bn-BD' ? 'En' : 'বাং'}
                  </Button>
              
              <VoiceControls
                isListening={isListening}
                isSpeaking={isSpeaking}
                onStartListening={startListening}
                onStopListening={stopListening}
                onStopSpeaking={stopSpeaking}
                    currentLanguage={currentLanguage}
                    className="w-full sm:w-auto"
              />
                </div>
              
              <Button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                  className={`h-[50px] sm:h-10 bg-gradient-to-r from-[${currentTheme.colors.primary.from}] to-[${currentTheme.colors.primary.to}] hover:from-[${currentTheme.colors.accent.from}] hover:to-[${currentTheme.colors.accent.to}] text-white transition-all hover:scale-105 w-full sm:w-auto flex items-center justify-center gap-2`}
              >
                  <Send className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="block sm:hidden">Send Message</span>
              </Button>
              </div>
            </form>
            
            <div className={`mt-2 text-xs text-[${currentTheme.colors.text.secondary}] text-center`}>
              {currentLanguage === 'bn-BD' 
                ? 'Enter চাপুন অথবা মাইক এ ক্লিক করুন • বাংলা/ইংরেজি ভাষা পরিবর্তন করুন'
                : 'Press Enter to send • Click mic to speak • Switch to Bengali mode'}
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className={`bg-gradient-to-r from-[${currentTheme.colors.primary.from}] to-[${currentTheme.colors.primary.to}] fixed bottom-0 left-0 right-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-center items-center">
            <p className="text-white font-medium text-sm">Made by Team AARSO</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminButtonsTheme2 = () => (
    <>
      {isAdmin ? (
        <>
          <motion.button
            onClick={() => setShowKnowledgeBase(true)}
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </motion.button>
          <motion.button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4" />
            Settings
          </motion.button>
          <motion.button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      ) : (
        <motion.button
          onClick={() => setShowAdminLogin(true)}
          className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogIn className="w-4 h-4" />
          Admin Login
        </motion.button>
      )}
    </>
  );

  const renderTheme2Layout = () => (
    <div className="min-h-screen flex flex-col w-full items-center bg-[#0A0A0B] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Mouse Follow Effect */}
      <motion.div 
        className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
        animate={{
          x: mousePosition.x - 400,
          y: mousePosition.y - 400,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 150,
          mass: 0.5,
        }}
      />

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto relative z-10 p-6 mb-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start mb-4 sm:mb-0">
              <img 
                src={DIAALogo} 
                alt="DIAA Logo" 
                className="h-auto w-[180px] sm:w-[140px]"
              />
            </div>
            <div className="flex justify-end">
              {renderAdminButtonsTheme2()}
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div 
          className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl overflow-hidden"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Messages Area */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-white/[0.02] text-white/90'
                }`}>
                  <ChatMessage
                    message={message}
                    onSpeak={speakText}
                    isSpeaking={isSpeaking}
                    onStopSpeaking={stopSpeaking}
                  />
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white/[0.02] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-white/60 rounded-full"
                          animate={{ 
                            opacity: [0.3, 0.9, 0.3],
                            scale: [0.85, 1.1, 0.85]
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.15
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-white/40">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                />
              </div>
              <Button
                onClick={() => sendMessage(inputText)}
                className="bg-gradient-to-r from-[#09509e] to-[#39b24a] text-white hover:opacity-90"
              >
                Send
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-center items-center">
            <p className="text-white font-medium text-sm">Made by Team AARSO</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminButtons = () => (
    <>
      {isAdmin ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKnowledgeBase(true)}
            className="text-white hover:bg-white/10"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Knowledge Base
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdminLogin(true)}
          className="text-white hover:bg-white/10"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Admin Login
        </Button>
      )}
    </>
  );

  return (
    <>
      {currentTheme.id === 'theme1' ? renderTheme1Layout() : renderTheme2Layout()}

      {/* Modals */}
      <BengaliSpeechRecognition
        onTranscript={handleTranscript}
        isListening={isListening}
        onListeningChange={setIsListening}
        language={currentLanguage}
      />

      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />

      {isAdmin && (
        <>
      <AISettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      <KnowledgeBase
        isOpen={showKnowledgeBase}
        onClose={() => setShowKnowledgeBase(false)}
        knowledgeBase={knowledgeBase}
        onKnowledgeBaseChange={setKnowledgeBase}
      />
        </>
      )}
    </>
  );
};

export default Index;
