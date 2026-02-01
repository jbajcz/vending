import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vending Dashboard',
  description: 'Business dashboard for vending machines',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <aside class="sidebar">
          <div class="brand">
            <div class="brand-icon"></div>
            Vendor
          </div>

          <ul class="menu">
            <li class="menu-item"><span class="menu-icon">◎</span> Dashboard</li>
            <li class="menu-item"><span class="menu-icon">◎</span> Machines</li>
            <li class="menu-item"><span class="menu-icon">◎</span> Inventory</li>
            <li class="menu-item"><span class="menu-icon">◎</span> Reports</li>
            <li class="menu-item"><span class="menu-icon">◎</span> Settings</li>
          </ul>

          <div class="logout">
            Log Out
          </div>
        </aside>

        <main class="main-content">
          {/* Top Header */}
          <header class="top-bar">
            Home Dash
          </header>

          {/* Page Content */}
          {children}
        </main>
      </body>
    </html>
  );
}
