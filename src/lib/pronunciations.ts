import { supabase } from '@/integrations/supabase/client';

export interface Pronunciation {
  id: number;
  word: string;
  pronunciation: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function getAllPronunciations() {
  const { data, error } = await supabase
    .from('pronunciations')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pronunciations:', error);
    return [];
  }

  return data || [];
}

export async function addPronunciation(word: string, pronunciation: string) {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('pronunciations')
    .insert({
      word,
      pronunciation,
      created_at: now,
      updated_at: now,
      is_active: true
    });

  if (error) {
    console.error('Error adding pronunciation:', error);
    throw new Error('Failed to save pronunciation');
  }

  return true;
}

export async function updatePronunciation(word: string, pronunciation: string) {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('pronunciations')
    .update({
      pronunciation,
      updated_at: now
    })
    .eq('word', word)
    .eq('is_active', true);

  if (error) {
    console.error('Error updating pronunciation:', error);
    throw new Error('Failed to update pronunciation');
  }

  return true;
}

export async function removePronunciation(word: string) {
  const { error } = await supabase
    .from('pronunciations')
    .update({ is_active: false })
    .eq('word', word);

  if (error) {
    console.error('Error removing pronunciation:', error);
    throw new Error('Failed to remove pronunciation');
  }

  return true;
} 