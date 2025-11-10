'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white/10 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:rounded-lg',
          description: 'group-[.toast]:text-gray-400',
          actionButton:
            'group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:hover:bg-gray-100',
          cancelButton:
            'group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30',
        },
      }}
    />
  )
}
