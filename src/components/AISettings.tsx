import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ExternalLink, Save, Settings, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PronunciationSettings from './PronunciationSettings';
import ThemeSelector from './ThemeSelector';
import { setMistralApiKey } from '@/lib/apiKeys';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const AISettings: React.FC<AISettingsProps> = ({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(false);

  const handleSave = async () => {
    try {
      await setMistralApiKey(tempApiKey);
      onApiKeyChange(tempApiKey);
      toast.success('API key saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save API key');
    }
  };

  const handleTestConnection = async () => {
    if (!tempApiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${tempApiKey}`,
        },
      });

      if (response.ok) {
        toast.success('API key is valid! Connection successful.');
      } else {
        toast.error('Invalid API key or connection failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>AI Settings</DialogTitle>
        </DialogHeader>
          <Tabs defaultValue="api" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api">API Key</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="api" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Mistral AI API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your Mistral AI API key"
                    className="pr-10 border-[#00C896]/30 focus:border-[#007BFF] focus:ring-[#007BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    onClick={handleTestConnection}
                    variant="outline"
                    className="text-[#007BFF] border-[#007BFF]/30 hover:bg-[#007BFF]/10"
                  >
                    Test Connection
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-[#007BFF] to-[#00C896] text-white hover:from-[#1DA1F2] hover:to-[#17C1B3]"
                  >
                    Save API Key
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="voice" className="space-y-4">
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => setShowPronunciation(true)}
                  className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C896] text-white hover:from-[#1DA1F2] hover:to-[#17C1B3] transition-all hover:scale-105"
                >
                  Manage Custom Pronunciations
                </Button>
                <div className="text-sm text-gray-500">
                  Add custom pronunciations for words and phrases to make the AI speak them correctly.
                </div>
              </div>
            </TabsContent>
            <TabsContent value="theme" className="space-y-4">
              <ThemeSelector />
            </TabsContent>
          </Tabs>
        </DialogContent>
    </Dialog>
    {showPronunciation && (
      <PronunciationSettings
        isOpen={showPronunciation}
        onClose={() => setShowPronunciation(false)}
      />
    )}
    </>
  );
};

export default AISettings;
