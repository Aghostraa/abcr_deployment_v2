import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/contexts/UserContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import FooterSection from '@/components/FooterSection'

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
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex flex-col">
              <div className="flex-grow">
                {children}
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