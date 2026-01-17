-- Add UPDATE policy for questions table
CREATE POLICY "Allow public update on questions" 
ON public.questions 
FOR UPDATE 
USING (true)
WITH CHECK (true);