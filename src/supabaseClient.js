import { createClient } from '@supabase/supabase-js'

// ⚠️ Coloque suas chaves aqui novamente se precisar
const supabaseUrl = 'https://oqxflayprloscppcvzhr.supabase.co'
const supabaseKey = 'sb_publishable_PDPTBFJ2uaCcUlA2gx40Mg_Iyn16v9t'

export const supabase = createClient(supabaseUrl, supabaseKey)