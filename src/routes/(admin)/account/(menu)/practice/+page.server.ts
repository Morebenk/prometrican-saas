import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { supabase } = locals;

  try {
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (subjectsError) throw error(500, 'Failed to load subjects');

    return {
      subjects
    };
  } catch (err) {
    throw error(500, 'Internal Server Error');
  }
};