/*
  # Fix User Profiles RLS Policy Infinite Recursion

  1. Security Changes
    - Drop the problematic SELECT policy that causes infinite recursion
    - Create a simpler, more efficient SELECT policy
    - Maintain security while avoiding circular references

  2. Policy Changes
    - Users can view their own profile
    - Users can view public profiles (without complex subqueries)
    - Remove the following-based visibility check that causes recursion
*/

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can view public profiles" ON user_profiles;

-- Create a new, simpler SELECT policy that avoids recursion
CREATE POLICY "Users can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always see their own profile
    auth_user_id = auth.uid()
    OR
    -- Users can see public profiles
    (preferences ->> 'publicProfile')::boolean = true
  );

-- Note: Following-based visibility can be implemented at the application level
-- to avoid RLS recursion issues, or through a separate view/function