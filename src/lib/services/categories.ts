import type { Database } from '$lib/DatabaseDefinitions';
import { supabaseClient } from '$lib/api';

export async function getCategories(subjectId: string) {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('subject_id', subjectId)
    .order('name');

  if (error) throw error;
  return data;
}

export async function getCategory(id: string) {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}