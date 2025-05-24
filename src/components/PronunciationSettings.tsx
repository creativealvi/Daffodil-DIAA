import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Volume2, Trash2, Edit2, Check, X } from 'lucide-react';
import { usePronunciationStore } from '@/store/pronunciation';

interface PronunciationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditingEntry {
  word: string;
  pronunciation: string;
}

const PronunciationSettings: React.FC<PronunciationSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const { dictionary, addPronunciation, removePronunciation } = usePronunciationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !pronunciation.trim()) {
      toast.error('Please fill in both fields');
      return;
    }
    addPronunciation(word.trim(), pronunciation.trim());
    toast.success('Pronunciation added');
    setWord('');
    setPronunciation('');
  };

  const handleEdit = (word: string, currentPronunciation: string) => {
    setEditingEntry({ word, pronunciation: currentPronunciation });
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    
    if (!editingEntry.pronunciation.trim()) {
      toast.error('Pronunciation cannot be empty');
      return;
    }

    removePronunciation(editingEntry.word);
    addPronunciation(editingEntry.word, editingEntry.pronunciation.trim());
    toast.success('Pronunciation updated');
    setEditingEntry(null);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleTest = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Custom Pronunciations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add new pronunciation */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="word">Word or Phrase</Label>
                <Input
                  id="word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="e.g., DIAA"
                  className="border-[#00C896]/30 focus:border-[#007BFF] focus:ring-[#007BFF]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pronunciation">Pronunciation</Label>
                <Input
                  id="pronunciation"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="e.g., diiaa"
                  className="border-[#00C896]/30 focus:border-[#007BFF] focus:ring-[#007BFF]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#007BFF] to-[#00C896] text-white hover:from-[#1DA1F2] hover:to-[#17C1B3] transition-all hover:scale-105"
              >
                Add Pronunciation
              </Button>
            </div>
          </form>

          {/* List of pronunciations */}
          <div className="space-y-2">
            <Label>Current Pronunciations</Label>
            <div className="border rounded-lg divide-y">
              {Object.entries(dictionary).map(([word, pronunciation]) => (
                <div key={word} className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    {editingEntry?.word === word ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{word}</span>
                        <span className="mx-2">→</span>
                        <Input
                          value={editingEntry.pronunciation}
                          onChange={(e) => setEditingEntry({ ...editingEntry, pronunciation: e.target.value })}
                          className="border-[#00C896]/30 focus:border-[#007BFF] focus:ring-[#007BFF] w-48"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{word}</span>
                        <span className="mx-2">→</span>
                        <span className="text-gray-600">{pronunciation}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingEntry?.word === word ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTest(pronunciation)}
                          className="text-[#007BFF] hover:text-[#1DA1F2]"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(word, pronunciation)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removePronunciation(word);
                            toast.success('Pronunciation removed');
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {Object.keys(dictionary).length === 0 && (
                <div className="p-3 text-center text-gray-500">
                  No custom pronunciations added yet
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PronunciationSettings; 