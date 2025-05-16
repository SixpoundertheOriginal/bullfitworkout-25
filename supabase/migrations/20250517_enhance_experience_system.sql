
-- Create a new function to manually add experience to a user
CREATE OR REPLACE FUNCTION public.add_user_experience(
  user_id UUID,
  xp_amount INTEGER,
  training_type TEXT DEFAULT NULL,
  experience_source TEXT DEFAULT 'manual',
  metadata_value JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exp JSONB;
  new_total_xp INTEGER;
  type_xp INTEGER;
  result JSONB;
BEGIN
  -- Get user's current experience data
  SELECT training_experience INTO user_exp
  FROM public.user_profiles
  WHERE id = user_id;
  
  -- If no experience data, initialize it
  IF user_exp IS NULL THEN
    user_exp := '{"totalXp": 0, "trainingTypeLevels": {"Strength": {"xp": 0}, "Cardio": {"xp": 0}, "Yoga": {"xp": 0}, "Calisthenics": {"xp": 0}, "Hypertrophy": {"xp": 0}, "Stretching": {"xp": 0}}}'::jsonb;
  END IF;
  
  -- Update total XP directly
  new_total_xp := COALESCE((user_exp->>'totalXp')::INTEGER, 0) + xp_amount;
  user_exp = user_exp || jsonb_build_object('totalXp', new_total_xp);
  
  -- Update training type specific XP if provided
  IF training_type IS NOT NULL THEN
    -- Check if training type exists in the data structure
    IF user_exp->'trainingTypeLevels'->>training_type IS NULL THEN
      -- Create the training type if it doesn't exist
      user_exp := user_exp || 
        jsonb_build_object(
          'trainingTypeLevels', 
          user_exp->'trainingTypeLevels' || 
            jsonb_build_object(
              training_type, 
              jsonb_build_object('xp', xp_amount)
            )
        );
    ELSE
      -- Update existing training type
      type_xp := COALESCE((user_exp->'trainingTypeLevels'->training_type->>'xp')::INTEGER, 0) + xp_amount;
      
      user_exp := user_exp || 
        jsonb_build_object(
          'trainingTypeLevels', 
          user_exp->'trainingTypeLevels' || 
            jsonb_build_object(
              training_type, 
              jsonb_build_object('xp', type_xp)
            )
        );
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE public.user_profiles
  SET training_experience = user_exp
  WHERE id = user_id;
  
  -- Log the experience gain
  INSERT INTO public.experience_logs (
    user_id,
    amount,
    training_type,
    source,
    metadata
  ) VALUES (
    user_id,
    xp_amount,
    training_type,
    experience_source,
    metadata_value
  );
  
  -- Return updated experience data
  result := jsonb_build_object(
    'success', true,
    'totalXp', new_total_xp,
    'xpAdded', xp_amount
  );
  
  RETURN result;
END;
$$;

-- Add exercise_specific_experience to the user_profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'exercise_specific_experience'
  ) THEN
    -- Add the new column if it doesn't exist
    ALTER TABLE public.user_profiles 
    ADD COLUMN exercise_specific_experience JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create function to record exercise-specific experience
CREATE OR REPLACE FUNCTION public.add_exercise_experience(
  user_id UUID,
  exercise_name TEXT,
  xp_amount INTEGER,
  training_type TEXT DEFAULT NULL,
  metadata_value JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exp JSONB;
  exercise_exp JSONB;
  current_exercise_xp INTEGER;
  result JSONB;
BEGIN
  -- First add to overall experience
  PERFORM add_user_experience(
    user_id, 
    xp_amount, 
    training_type, 
    'exercise_completion', 
    metadata_value || jsonb_build_object('exercise_name', exercise_name)
  );
  
  -- Then update exercise-specific experience
  SELECT exercise_specific_experience INTO exercise_exp
  FROM public.user_profiles
  WHERE id = user_id;
  
  -- Initialize if needed
  IF exercise_exp IS NULL THEN
    exercise_exp := '{}'::jsonb;
  END IF;
  
  -- Update or create exercise entry
  IF exercise_exp ? exercise_name THEN
    -- Exercise exists, update its XP
    current_exercise_xp := COALESCE((exercise_exp->exercise_name->>'xp')::INTEGER, 0);
    exercise_exp := exercise_exp || jsonb_build_object(
      exercise_name, 
      (exercise_exp->exercise_name)::jsonb || jsonb_build_object('xp', current_exercise_xp + xp_amount)
    );
  ELSE
    -- Exercise doesn't exist, create it
    exercise_exp := exercise_exp || jsonb_build_object(
      exercise_name, 
      jsonb_build_object(
        'xp', xp_amount,
        'last_performed', now()
      )
    );
  END IF;
  
  -- Update the user profile
  UPDATE public.user_profiles
  SET exercise_specific_experience = exercise_exp
  WHERE id = user_id;
  
  -- Return result
  result := jsonb_build_object(
    'success', true,
    'exercise', exercise_name,
    'xpAdded', xp_amount
  );
  
  RETURN result;
END;
$$;

-- Update the trigger to handle custom training types
CREATE OR REPLACE FUNCTION public.update_user_experience()
RETURNS TRIGGER AS $$
DECLARE
  xp_gained INTEGER;
  workout_duration INTEGER;
  user_exp JSONB;
  training_type TEXT;
  new_total_xp INTEGER;
  type_xp INTEGER;
BEGIN
  -- Calculate XP based on workout duration (improved formula)
  workout_duration := COALESCE(NEW.duration, 0);
  xp_gained := GREATEST(10, workout_duration / 60 * 10); -- 10 XP per minute, minimum 10
  
  -- Get user's current experience data
  SELECT training_experience INTO user_exp
  FROM public.user_profiles
  WHERE id = NEW.user_id;
  
  -- If no experience data, initialize it with more training types
  IF user_exp IS NULL THEN
    user_exp := '{"totalXp": 0, "trainingTypeLevels": {"Strength": {"xp": 0}, "Cardio": {"xp": 0}, "Yoga": {"xp": 0}, "Calisthenics": {"xp": 0}, "Hypertrophy": {"xp": 0}, "Stretching": {"xp": 0}}}'::jsonb;
  END IF;
  
  -- Update total XP directly without using jsonb_set
  new_total_xp := COALESCE((user_exp->>'totalXp')::INTEGER, 0) + xp_gained;
  user_exp = user_exp || jsonb_build_object('totalXp', new_total_xp);
  
  -- Get the training type, handling custom types
  training_type := NEW.training_type;
  
  -- Update training type specific XP - handle case where type doesn't exist yet
  IF training_type IS NOT NULL THEN
    IF user_exp->'trainingTypeLevels'->>training_type IS NULL THEN
      -- Create a new entry for this training type
      user_exp := user_exp || 
        jsonb_build_object(
          'trainingTypeLevels', 
          user_exp->'trainingTypeLevels' || 
            jsonb_build_object(
              training_type, 
              jsonb_build_object('xp', xp_gained)
            )
        );
    ELSE
      -- Update existing training type
      type_xp := COALESCE((user_exp->'trainingTypeLevels'->training_type->>'xp')::INTEGER, 0) + xp_gained;
      
      user_exp := user_exp || 
        jsonb_build_object(
          'trainingTypeLevels', 
          user_exp->'trainingTypeLevels' || 
            jsonb_build_object(
              training_type, 
              jsonb_build_object('xp', type_xp)
            )
        );
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE public.user_profiles
  SET training_experience = user_exp
  WHERE id = NEW.user_id;
  
  -- Log the experience gain with more metadata
  INSERT INTO public.experience_logs (
    user_id,
    amount,
    training_type,
    source,
    metadata
  ) VALUES (
    NEW.user_id,
    xp_gained,
    training_type,
    'workout_completion',
    jsonb_build_object(
      'workout_id', NEW.id,
      'workout_duration', workout_duration,
      'timestamp', NOW(),
      'workout_name', NEW.name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly created
DROP TRIGGER IF EXISTS on_workout_completed ON public.workout_sessions;

CREATE TRIGGER on_workout_completed
  AFTER INSERT OR UPDATE ON public.workout_sessions
  FOR EACH ROW
  WHEN (NEW.end_time IS NOT NULL)
  EXECUTE FUNCTION public.update_user_experience();
