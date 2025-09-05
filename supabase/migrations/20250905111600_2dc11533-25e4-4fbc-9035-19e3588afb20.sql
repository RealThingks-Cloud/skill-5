-- Fix RLS policies for skill_categories to accept 'manager' role
DROP POLICY IF EXISTS "Management can manage skill categories" ON skill_categories;

CREATE POLICY "Managers can manage skill categories" 
ON skill_categories 
FOR ALL 
USING (
  EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'management', 'manager')
  )
);

-- Fix RLS policies for skills to accept 'manager' role  
DROP POLICY IF EXISTS "Management can manage skills" ON skills;

CREATE POLICY "Managers can manage skills" 
ON skills 
FOR ALL 
USING (
  EXISTS ( 
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'management', 'manager')
  )
);