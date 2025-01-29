-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incorrect_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system settings
CREATE POLICY "Only admins can manage system settings"
    ON system_settings FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Create profile email trigger function
CREATE OR REPLACE FUNCTION create_profile_with_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email = (
        SELECT email FROM auth.users WHERE id = NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set email on profile creation
CREATE TRIGGER set_profile_email
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_with_email();

-- Profiles policies
CREATE POLICY "Users can manage their own profile"
    ON profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Content policies (subjects, categories, questions, choices)
CREATE POLICY "Anyone can view subjects"
    ON subjects FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage subjects"
    ON subjects FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage categories"
    ON categories FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view active questions"
    ON questions FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage questions"
    ON questions FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view choices for active questions"
    ON choices FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM questions 
        WHERE questions.id = choices.question_id 
        AND (is_active = true OR is_admin(auth.uid()))
    ));

CREATE POLICY "Only admins can manage choices"
    ON choices FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Quiz related policies
CREATE POLICY "Users can view active quizzes"
    ON quizzes FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage quizzes"
    ON quizzes FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view quiz questions for active quizzes"
    ON quiz_questions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM quizzes 
        WHERE quizzes.id = quiz_questions.quiz_id 
        AND (is_active = true OR is_admin(auth.uid()))
    ));

CREATE POLICY "Only admins can manage quiz questions"
    ON quiz_questions FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Users can manage their own quiz attempts (view, insert, update, delete)
CREATE POLICY "Users can manage their own attempts"
    ON quiz_attempts FOR ALL
    USING (user_id = auth.uid() OR is_admin(auth.uid()))
    WITH CHECK (user_id = auth.uid());

-- Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts"
    ON quiz_attempts FOR SELECT
    USING (is_admin(auth.uid()));

-- Users can manage their own incorrect responses (view, insert, update, delete)
CREATE POLICY "Users can manage their own incorrect responses"
    ON incorrect_responses FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can view all incorrect responses
CREATE POLICY "Admins can view all incorrect responses"
    ON incorrect_responses FOR SELECT
    USING (is_admin(auth.uid()));

-- Bookmark policies
CREATE POLICY "Users can manage their own bookmarks"
    ON bookmarks FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Flagged questions policies
CREATE POLICY "Only admins can manage flagged questions"
    ON flagged_questions FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can flag questions"
    ON flagged_questions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions (Only if needed)
GRANT INSERT ON incorrect_responses TO authenticated;
GRANT INSERT ON bookmarks TO authenticated;
GRANT INSERT ON flagged_questions TO authenticated;
