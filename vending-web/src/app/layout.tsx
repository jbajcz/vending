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
            <img src="/logo.svg" alt="Logo" className="brand-icon" />
            <div className="brand-text">Vendor</div>
          </div>

          <ul className="menu" role="navigation" aria-label="Main menu">
            <li className="menu-item active" role="button" aria-label="Dashboard" tabIndex={0}>
              <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="menu-label">Dashboard</span>
              <span className="tooltip">Dashboard</span>
            </li>
            <li className="menu-item" role="button" aria-label="Machines" tabIndex={0}>
              <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="menu-label">Machines</span>
              <span className="tooltip">Machines</span>
            </li>
            <li className="menu-item" role="button" aria-label="Inventory" tabIndex={0}>
              <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="menu-label">Inventory</span>
              <span className="tooltip">Inventory</span>
            </li>
            <li className="menu-item" role="button" aria-label="Reports" tabIndex={0}>
              <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="menu-label">Reports</span>
              <span className="tooltip">Reports</span>
            </li>
          </ul>

          <div className="bottom">
            <div className="menu-item" role="button" aria-label="Settings" tabIndex={0}>
              <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24M4.93 19.07l4.24-4.24m5.66-5.66 4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="tooltip">Settings</span>
            </div>
            <div className="menu-item logout" role="button" aria-label="Log Out" tabIndex={0}>
              <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
