import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { UserProvider } from '@/contexts/UserContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ABC Blockchain Club',
  description: 'Community of builders, innovators, and blockchain enthusiasts',
}

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
            {children}
            <div id="root-portal" />
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  )
}