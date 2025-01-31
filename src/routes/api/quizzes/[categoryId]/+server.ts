import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { categoryId } = params;
  const { supabase } = locals;

  try {
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select(`
        *,
        category:categories(*),
        questions:quiz_questions(
          question:questions(
            *,
            choices(*)
          )
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('title');

    if (quizzesError) throw error(500, 'Failed to load quizzes');

    return json(quizzes);
  } catch (err) {
    throw error(500, 'Internal Server Error');
  }
};