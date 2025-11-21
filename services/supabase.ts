import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdjwefaofgdjnbwrrybu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkandlZmFvZmdkam5id3JyeWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTc5NDQsImV4cCI6MjA3OTI5Mzk0NH0.iAhf6jIzawWFyFBGbjCR48CiIJDJukuQfUzNeWEzDwI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);