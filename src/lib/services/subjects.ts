import type { Database } from '$lib/DatabaseDefinitions';
import { supabaseClient } from '$lib/api';

export async function getSubjects() {
  const { data, error } = await supabaseClient
    .from('subjects')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getSubject(id: string) {
  const { data, error } = await supabaseClient
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}