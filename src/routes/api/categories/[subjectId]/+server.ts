import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { subjectId } = params;
  const { supabase } = locals;

  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('subject_id', subjectId)
      .order('name');

    if (categoriesError) throw error(500, 'Failed to load categories');

    return json(categories);
  } catch (err) {
    throw error(500, 'Internal Server Error');
  }
};