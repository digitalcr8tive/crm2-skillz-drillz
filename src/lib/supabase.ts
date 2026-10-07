import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && key)
export const isDemo = import.meta.env.DEV && !hasSupabase
export const bookingUnavailableMessage = 'Online booking is temporarily unavailable. Please email crm2skillzanddrillz@gmail.com or call 980-208-7327 to arrange your session before paying a deposit.'
export const supabase = hasSupabase ? createClient(url, key) : null
