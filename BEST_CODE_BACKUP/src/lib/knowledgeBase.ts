import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeBaseEntry {
  id: number;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAllKnowledgeBase() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching knowledge base: ${error.message}`);
  }

  return data as KnowledgeBaseEntry[];
}

export async function addKnowledgeBaseEntry(entry: {
  title: string;
  content: string;
  category: string;
}) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert([
      {
        ...entry,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Error adding knowledge base entry: ${error.message}`);
  }

  return data as KnowledgeBaseEntry;
}

export async function updateKnowledgeBaseEntry(
  id: number,
  updates: Partial<Omit<KnowledgeBaseEntry, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating knowledge base entry: ${error.message}`);
  }

  return data as KnowledgeBaseEntry;
}

export async function deleteKnowledgeBaseEntry(id: number) {
  const { error } = await supabase
    .from('knowledge_base')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting knowledge base entry: ${error.message}`);
  }
}

export function combineKnowledgeBaseContent(entries: KnowledgeBaseEntry[]): string {
  return entries
    .map(
      (entry) => `# ${entry.title}\nCategory: ${entry.category}\n\n${entry.content}\n\n---\n`
    )
    .join('\n');
} 