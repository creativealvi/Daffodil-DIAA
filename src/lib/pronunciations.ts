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
    throw new Error('Failed to fetch pronunciations');
  }

  return data || [];
}

export async function addPronunciation(word: string, pronunciation: string) {
  const now = new Date().toISOString();
  
  // First, check if the word already exists and is active
  const { data: existing } = await supabase
    .from('pronunciations')
    .select('id')
    .eq('word', word)
    .eq('is_active', true)
    .single();

  if (existing) {
    // If it exists, update it
    const { error: updateError } = await supabase
      .from('pronunciations')
      .update({
        pronunciation,
        updated_at: now
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Error updating existing pronunciation:', updateError);
      throw new Error('Failed to update pronunciation');
    }
  } else {
    // If it doesn't exist, insert new
    const { error: insertError } = await supabase
      .from('pronunciations')
      .insert({
        word,
        pronunciation,
        created_at: now,
        updated_at: now,
        is_active: true
      });

    if (insertError) {
      console.error('Error adding pronunciation:', insertError);
      throw new Error('Failed to add pronunciation');
    }
  }

  return true;
}

export async function updatePronunciation(word: string, pronunciation: string) {
  const now = new Date().toISOString();
  
  // First, get the existing record
  const { data: existing, error: fetchError } = await supabase
    .from('pronunciations')
    .select('id')
    .eq('word', word)
    .eq('is_active', true)
    .single();

  if (fetchError) {
    console.error('Error fetching pronunciation:', fetchError);
    throw new Error('Failed to find pronunciation to update');
  }

  if (!existing) {
    throw new Error('Pronunciation not found');
  }

  const { error } = await supabase
    .from('pronunciations')
    .update({
      pronunciation,
      updated_at: now
    })
    .eq('id', existing.id);

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
    .eq('word', word)
    .eq('is_active', true);

  if (error) {
    console.error('Error removing pronunciation:', error);
    throw new Error('Failed to remove pronunciation');
  }

  return true;
} 