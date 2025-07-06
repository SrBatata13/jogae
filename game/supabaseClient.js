import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
  // Configuração do Supabase
  const supabaseUrl = 'https://soopobfpnbrwdongeszg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3BvYmZwbmJyd2Rvbmdlc3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MDkyNzEsImV4cCI6MjA2MzA4NTI3MX0.646nptjmHIiTvlueCIMk8jG7ELmGY8FJvjYPjf-huT0'; 
  export const supabase = createClient(supabaseUrl, supabaseKey);