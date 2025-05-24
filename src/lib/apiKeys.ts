import { supabase } from '@/integrations/supabase/client';

export interface ApiKey {
  id: number;
  key_name: string;
  key_value: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function getMistralApiKey() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_name', 'mistral')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching Mistral API key:', error);
    return null;
  }

  return data?.key_value;
}

export async function setMistralApiKey(apiKey: string) {
  const now = new Date().toISOString();
  
  try {
    // First, deactivate any existing Mistral API keys
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('key_name', 'mistral');

    if (updateError) {
      console.error('Error deactivating existing API keys:', updateError);
      throw new Error(`Failed to deactivate existing keys: ${updateError.message}`);
    }

    // Then insert the new key
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        key_name: 'mistral',
        key_value: apiKey,
        created_at: now,
        updated_at: now,
        is_active: true
      });

    if (insertError) {
      console.error('Error inserting new API key:', insertError);
      throw new Error(`Failed to save API key: ${insertError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in setMistralApiKey:', error);
    throw error;
  }
} 