
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
  onTestVoice?: () => void; // New prop for testing voice
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onTestVoice,
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
        const testUtterance = new SpeechSynthesisUtterance('Hello, this is a test to check if speech synthesis is working.');
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
    <div className="flex items-center space-x-2">
      {/* Voice Input Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isListening ? onStopListening : onStartListening}
        className={`border-green-300 hover:border-green-500 ${
          isListening ? 'bg-red-100 text-red-600 border-red-300' : 'text-green-600'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 mr-1" />
            Stop
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-1" />
            Speak
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
            className="border-blue-300 text-blue-600 hover:border-blue-500"
          >
            <VolumeX className="w-4 h-4 mr-1" />
            Stop Voice
          </Button>
        )}
        
        {/* Test Voice Button */}
        {!isSpeaking && speechAvailable && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestVoice}
            className="border-green-300 text-green-600 hover:border-green-500"
          >
            <Volume2 className="w-4 h-4 mr-1" />
            Test Voice
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceControls;
