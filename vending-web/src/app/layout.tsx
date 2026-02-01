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
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon"></div>
            Vendor
          </div>

          <ul className="menu">
            <li className="menu-item"><span className="menu-icon">◎</span> Dashboard</li>
            <li className="menu-item"><span className="menu-icon">◎</span> Machines</li>
            <li className="menu-item"><span className="menu-icon">◎</span> Inventory</li>
            <li className="menu-item"><span className="menu-icon">◎</span> Reports</li>
            <li className="menu-item"><span className="menu-icon">◎</span> Settings</li>
          </ul>

          <div className="logout">
            Log Out
          </div>
        </aside>

        <main className="main-content">
          {/* Top Header */}
          <header className="top-bar">
            Home Dash
          </header>

          {/* Page Content */}
          {children}
        </main>
      </body>
    </html>
  );
}
