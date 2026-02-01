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
            <div className="brand-text">Vendor</div>
          </div>

          <ul className="menu" role="navigation" aria-label="Main menu">
            <li className="menu-item active" role="button" aria-label="Dashboard" tabIndex={0}>
              <span className="menu-icon">🏠</span>
              <span className="menu-label">Dashboard</span>
              <span className="tooltip">Dashboard</span>
            </li>
            <li className="menu-item" role="button" aria-label="Machines" tabIndex={0}>
              <span className="menu-icon">🖲️</span>
              <span className="menu-label">Machines</span>
              <span className="tooltip">Machines</span>
            </li>
            <li className="menu-item" role="button" aria-label="Inventory" tabIndex={0}>
              <span className="menu-icon">📦</span>
              <span className="menu-label">Inventory</span>
              <span className="tooltip">Inventory</span>
            </li>
            <li className="menu-item" role="button" aria-label="Reports" tabIndex={0}>
              <span className="menu-icon">📊</span>
              <span className="menu-label">Reports</span>
              <span className="tooltip">Reports</span>
            </li>
          </ul>

          <div className="bottom">
            <div className="menu-item" role="button" aria-label="Settings" tabIndex={0}>
              <span className="menu-icon">⚙️</span>
              <span className="tooltip">Settings</span>
            </div>
            <div className="menu-item logout" role="button" aria-label="Log Out" tabIndex={0}>
              <span className="menu-icon">⎋</span>
              <span className="tooltip">Log Out</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          {/* Top Header */}
          <header className="top-bar">
            <div className="top-bar-search">
              <input className="top-search" placeholder="Search" aria-label="Search" />
              <button className="search-btn" type="button" aria-label="Search">🔍</button>
            </div>
            <div className="top-bar-right">
              <button className="icon-btn" type="button" aria-label="Notifications">🔔</button>
              <button className="icon-btn" type="button" aria-label="Inbox">✉️</button>
              <div className="user-chip">
                <div className="user-avatar"></div>
                <div className="user-meta">
                  <div className="user-name">Michelle Arnold</div>
                  <div className="user-email">Sales manager</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          {children}
        </main>
      </body>
    </html>
  );
}
