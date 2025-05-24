import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Save, Upload, Download, Info, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import {
  KnowledgeBaseEntry,
  getAllKnowledgeBase,
  addKnowledgeBaseEntry,
  updateKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
  combineKnowledgeBaseContent,
} from '@/lib/knowledgeBase';

interface KnowledgeBaseProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBase: string;
  onKnowledgeBaseChange: (content: string) => void;
}

const CATEGORIES = [
  'General Information',
  'Admissions',
  'Programs',
  'Campus Life',
  'Facilities',
  'Contact',
  'Other',
];

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  isOpen,
  onClose,
  onKnowledgeBaseChange,
}) => {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEntries();
    }
  }, [isOpen]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await getAllKnowledgeBase();
      setEntries(data);
      const combinedContent = combineKnowledgeBaseContent(data);
      onKnowledgeBaseChange(combinedContent);
    } catch (error) {
      toast.error('Failed to load knowledge base entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      if (selectedEntry) {
        await updateKnowledgeBaseEntry(selectedEntry.id, {
          title,
          content,
          category,
        });
        toast.success('Entry updated successfully!');
      } else {
        await addKnowledgeBaseEntry({
          title,
          content,
          category,
        });
        toast.success('Entry added successfully!');
      }
      await loadEntries();
      resetForm();
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteKnowledgeBaseEntry(id);
      toast.success('Entry deleted successfully!');
      await loadEntries();
      if (selectedEntry?.id === id) {
        resetForm();
      }
    } catch (error) {
      toast.error('Failed to delete entry');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEntry(null);
    setTitle('');
    setContent('');
    setCategory(CATEGORIES[0]);
  };

  const handleEntrySelect = (entry: KnowledgeBaseEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setContent(content);
        toast.success('File uploaded successfully!');
      };
      reader.readAsText(file);
    } else {
      toast.error('Please upload a text file (.txt)');
    }
  };

  const handleDownload = () => {
    if (!content.trim()) {
      toast.error('No content to download');
      return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'knowledge-base-entry'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#39b24a]" />
            <span>Knowledge Base Management</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4">
          {/* Left side - Entries List */}
          <div className="col-span-4 border-r pr-4 border-[#39b24a]/20">
            <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Entries</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-[#39b24a] hover:text-[#39b24a]/80"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className={`p-2 cursor-pointer hover:bg-gray-50 ${
                      selectedEntry?.id === entry.id ? 'border-[#39b24a] bg-[#39b24a]/5' : ''
                    }`}
                    onClick={() => handleEntrySelect(entry)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{entry.title}</h4>
                        <p className="text-xs text-gray-500">{entry.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Entry Editor */}
          <div className="col-span-8">
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter entry title..."
                    className="border-[#39b24a]/30 focus:border-[#39b24a] focus:ring-[#39b24a]"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="border-[#39b24a]/30 focus:border-[#39b24a] focus:ring-[#39b24a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content">Content</Label>
                    <div className="flex items-center space-x-2">
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                          className="text-[#09509e] border-[#09509e]/30 hover:border-[#09509e]/50"
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                        className="text-[#39b24a] border-[#39b24a]/30 hover:border-[#39b24a]/50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter entry content..."
                    className="min-h-[300px] font-mono text-sm border-[#39b24a]/30 focus:border-[#39b24a] focus:ring-[#39b24a]"
                  />
            </div>
          </div>

          {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#39b24a]/20">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#09509e] to-[#39b24a] hover:from-[#09509e]/90 hover:to-[#39b24a]/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
                  {selectedEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeBase;
