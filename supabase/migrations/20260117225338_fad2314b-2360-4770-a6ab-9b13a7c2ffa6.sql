-- Allow public insert on questions table (admin import feature)
CREATE POLICY "Allow public insert on questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (true);

-- Allow public delete on questions table (admin delete feature)
CREATE POLICY "Allow public delete on questions" 
ON public.questions 
FOR DELETE 
USING (true);