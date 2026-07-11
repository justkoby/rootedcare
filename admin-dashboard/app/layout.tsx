import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'RootedCare Admin', template: '%s | RootedCare Admin' },
  description: 'RootedCare content & AI management dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.body.classList.add('light-theme');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
