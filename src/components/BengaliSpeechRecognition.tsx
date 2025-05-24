import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface BengaliSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onListeningChange: (isListening: boolean) => void;
  language: 'bn-BD' | 'en-US';
}

const BengaliSpeechRecognition: React.FC<BengaliSpeechRecognitionProps> = ({
  onTranscript,
  isListening,
  onListeningChange,
  language,
}) => {
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition settings
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.maxAlternatives = 3;
        recognitionRef.current.lang = language;
      }
    } else {
      setIsSupported(false);
      toast.error('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.lang = language;
    
    // Set up recognition event handlers
    recognitionRef.current.onstart = () => {
      onListeningChange(true);
      toast.info(language === 'bn-BD' ? 'বাংলায় কথা বলুন...' : 'Start speaking...');
    };

    recognitionRef.current.onend = () => {
      onListeningChange(false);
      if (isListening && retryCount < maxRetries) {
        // Auto-restart if stopped unexpectedly
        setRetryCount(prev => prev + 1);
        startListening();
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      handleError(event);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Process interim results for better real-time feedback
      if (interimTranscript) {
        onTranscript(interimTranscript);
      }

      // Process final results
      if (finalTranscript) {
        setRetryCount(0); // Reset retry count on successful recognition
        onTranscript(finalTranscript);
        
        // Auto-stop after final result
        stopListening();
      }
    };

  }, [language, isListening, onTranscript, onListeningChange, retryCount]);

  const handleError = (error: any) => {
    switch (error.error) {
      case 'no-speech':
        toast.error(language === 'bn-BD' ? 'কোন কথা শোনা যায়নি' : 'No speech detected');
        break;
      case 'audio-capture':
        toast.error(language === 'bn-BD' ? 'মাইক্রোফোন সমস্যা' : 'Microphone error');
        break;
      case 'not-allowed':
        toast.error(language === 'bn-BD' ? 'মাইক্রোফোন অ্যাক্সেস দিন' : 'Please allow microphone access');
        break;
      case 'language-not-supported':
        if (language === 'bn-BD') {
          toast.error('বাংলা ভাষা সমর্থন করে না, ইংরেজিতে চেষ্টা করুন');
          // Fallback to English
          if (recognitionRef.current) {
            recognitionRef.current.lang = 'en-US';
          }
        } else {
          toast.error('Language not supported');
        }
        break;
      default:
        toast.error(language === 'bn-BD' ? 'একটি সমস্যা হয়েছে' : 'An error occurred');
    }
    onListeningChange(false);
  };

  const startListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Recognition start error:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setRetryCount(0);
      } catch (error) {
        console.error('Recognition stop error:', error);
      }
    }
  };

  // Start or stop listening based on isListening prop
  useEffect(() => {
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }
  }, [isListening]);

  return null; // This is a non-visual component
};

export default BengaliSpeechRecognition; 