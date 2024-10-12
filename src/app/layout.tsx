'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/contexts/UserContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import FooterSection from '@/components/FooterSection'
import { AnimatePresence } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

// Move metadata to a separate file, e.g., app/metadata.ts
// export const metadata = {
//   title: 'ABC Blockchain Club',
//   description: 'Community of builders, innovators, and blockchain enthusiasts',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex flex-col">
              <div className="flex-grow">
                <AnimatePresence mode="wait" initial={false}>
                  {children}
                </AnimatePresence>
              </div>
              <FooterSection />
            </div>
            <div id="root-portal" />
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  )
}