/*
  # Fix update_updated_at_column function search path

  1. Security Fix
    - Set search_path to empty string to prevent search path injection attacks
    - Add SECURITY DEFINER for proper privilege handling
    - Ensure all function references are schema-qualified

  2. Function Updates
    - Replace existing function with secure version
    - Maintain same functionality while improving security
    - Follow PostgreSQL security best practices
*/

-- Drop and recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Set the updated_at column to current timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Ensure the function owner has proper permissions
ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

-- Add comment explaining the security measures
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at timestamp. Uses empty search_path for security.';