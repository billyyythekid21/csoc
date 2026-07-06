import 'react-native-url-polyfill/auto'

import Constants from 'expo-constants'
import { createClient } from '@supabase/supabase-js'

type Extra = {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as Extra

export const supabaseUrl = extra.supabaseUrl ?? ''
export const supabaseAnonKey = extra.supabaseAnonKey ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

