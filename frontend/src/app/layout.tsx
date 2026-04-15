import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sales CRM',
  description: 'Sales CRM Mobile Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen max-w-lg mx-auto relative">
        {children}
      </body>
    </html>
  )
}
