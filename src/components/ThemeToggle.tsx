/**
 * Toggle para alternar entre modo claro e escuro
 */

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Carregar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }

    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        relative
        w-14 h-7
        bg-gray-200 dark:bg-gray-700
        rounded-full
        transition-colors duration-300
        focus:outline-none focus:ring-4 focus:ring-blue-500/30
        group
      "
      aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className={`
            absolute inset-0
            bg-gradient-to-r from-blue-600 to-purple-600
            transition-opacity duration-300
            ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}
          `}
        />
      </div>

      {/* Thumb */}
      <div
        className={`
          absolute top-0.5 left-0.5
          w-6 h-6
          bg-white dark:bg-gray-900
          rounded-full
          shadow-lg
          flex items-center justify-center
          transition-all duration-300
          ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
          group-hover:scale-110
        `}
      >
        {/* Ícones */}
        <Sun
          className={`
            absolute w-3.5 h-3.5 text-yellow-500
            transition-all duration-300
            ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}
          `}
        />
        <Moon
          className={`
            absolute w-3.5 h-3.5 text-blue-500
            transition-all duration-300
            ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}
          `}
        />
      </div>
    </button>
  )
}

/**
 * Hook personalizado para usar o tema
 */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }

    localStorage.setItem('theme', newTheme)
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
