import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onTestVoice?: () => void;
  currentLanguage: 'bn-BD' | 'en-US';
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onTestVoice,
  currentLanguage,
  className = '',
}) => {
  // Check if speech synthesis is available
  const [speechAvailable, setSpeechAvailable] = useState<boolean>(false);

  useEffect(() => {
    const isSpeechAvailable = 'speechSynthesis' in window;
    setSpeechAvailable(isSpeechAvailable);
    
    // Perform initialization for speech synthesis
    if (isSpeechAvailable) {
      // Pre-initialize speech synthesis to avoid delays
      window.speechSynthesis.cancel();
    }
  }, []);

  // Function to handle voice testing
  const handleTestVoice = () => {
    if (onTestVoice) {
      onTestVoice();
    } else {
      // Fallback if no test function provided
      if ('speechSynthesis' in window) {
        const testText = currentLanguage === 'bn-BD' 
          ? 'হ্যালো, ভয়েস টেস্টিং চলছে।'
          : 'Hello, Yes Voice is working.';
        
        const testUtterance = new SpeechSynthesisUtterance(testText);
        testUtterance.lang = currentLanguage;
        testUtterance.volume = 1.0;
        testUtterance.rate = 1.0;
        testUtterance.pitch = 1.0;
        
        window.speechSynthesis.speak(testUtterance);
        toast.info('Playing test voice...');
      } else {
        toast.error('Speech synthesis is not supported in your browser');
      }
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Voice Input Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isListening ? onStopListening : onStartListening}
        className={`w-full border-[#00C896]/30 hover:border-[#00C896] transition-all hover:scale-105 ${
          isListening ? 'bg-red-100 text-red-600 border-red-300' : 'bg-gradient-to-r from-[#1DA1F2] to-[#17C1B3] text-white'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 mr-1" />
            {currentLanguage === 'bn-BD' ? 'থামুন' : 'Stop'}
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-1" />
            {currentLanguage === 'bn-BD' ? 'বলুন' : 'Speak'}
          </>
        )}
      </Button>

      {/* Voice Controls */}
      <div className="flex items-center space-x-2">
        {/* Stop Speaking Button */}
        {isSpeaking && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStopSpeaking}
            className="w-full border-[#007BFF]/30 bg-gradient-to-r from-[#1DA1F2] to-[#17C1B3] text-white hover:scale-105 transition-all"
          >
            <VolumeX className="w-4 h-4 mr-1" />
            {currentLanguage === 'bn-BD' ? 'থামুন' : 'Stop Voice'}
          </Button>
        )}
        
        {/* Test Voice Button */}
        {!isSpeaking && speechAvailable && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestVoice}
            className="w-full border-[#00C896]/30 bg-gradient-to-r from-[#007BFF] to-[#00C896] text-white hover:scale-105 transition-all"
          >
            <Volume2 className="w-4 h-4 mr-1" />
            {currentLanguage === 'bn-BD' ? 'টেস্ট' : 'Test'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceControls;
