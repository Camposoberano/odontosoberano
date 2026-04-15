/**
 * Cliente Supabase configurado para o CRM SOBERANO
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Configurações do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

/**
 * Cliente principal do Supabase
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-crm-version': '7.4.2.12'
    }
  }
})

/**
 * Helpers para tratamento de erros
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error)

  if (error.code === 'PGRST116') {
    return { error: 'Registro não encontrado', code: 404 }
  }

  if (error.code === '23505') {
    return { error: 'Registro duplicado', code: 409 }
  }

  if (error.code === '23503') {
    return { error: 'Violação de integridade referencial', code: 400 }
  }

  return { error: error.message || 'Erro desconhecido', code: 500 }
}

/**
 * Helper para criar resposta padronizada
 */
export type SupabaseResponse<T> = {
  data: T | null
  error: { message: string; code: number } | null
  count?: number
}

export const createResponse = <T>(
  data: T | null,
  error: any = null,
  count?: number
): SupabaseResponse<T> => {
  if (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      count: 0
    }
  }

  return {
    data,
    error: null,
    count
  }
}

/**
 * Helper para queries paginadas
 */
export const paginatedQuery = async <T>(
  query: any,
  page: number = 1,
  pageSize: number = 20
) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .range(from, to)
    .select('*', { count: 'exact' })

  return createResponse(data as T[], error, count || 0)
}

export default supabase
