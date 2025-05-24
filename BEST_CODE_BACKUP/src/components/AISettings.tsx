
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ExternalLink, Key, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleSave = () => {
    onApiKeyChange(tempApiKey);
    localStorage.setItem('mistral_api_key', tempApiKey);
    toast.success('API key saved successfully!');
    onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-green-600" />
            <span>AI Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Section */}
          <Card className="p-4 border-green-200">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="text-sm font-medium">
                  Mistral AI API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your Mistral AI API key"
                  className="mt-1"
                />
              </div>

              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">How to get your Mistral AI API key:</p>
                  <ol className="mt-2 list-decimal list-inside space-y-1">
                    <li>Visit the Mistral AI console</li>
                    <li>Sign up or log in to your account</li>
                    <li>Navigate to API Keys section</li>
                    <li>Create a new API key</li>
                    <li>Copy and paste it here</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  className="text-blue-600 border-blue-300 hover:border-blue-500"
                >
                  Test Connection
                </Button>
                
                <Button
                  asChild
                  variant="ghost"
                  className="text-green-600 hover:text-green-700"
                >
                  <a
                    href="https://console.mistral.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* Model Information */}
          <Card className="p-4 border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Current AI Model</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Model:</strong> mistral-large-latest</p>
              <p><strong>Capabilities:</strong> Advanced reasoning, multilingual support, conversation</p>
              <p><strong>Context:</strong> Optimized for university assistance and student queries</p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettings;
