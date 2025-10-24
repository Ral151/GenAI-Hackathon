import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgccnhhrycmmzlfoosyq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnY2NuaGhyeWNtbXpsZm9vc3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDI0NjAsImV4cCI6MjA3NjQ3ODQ2MH0.yAvcWX6FOWMCVppDpDOkyU5DVUN8nqWV1cQGFhqXBfQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
