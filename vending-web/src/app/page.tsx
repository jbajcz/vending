import { getDashboardStats, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Refresh on every request

export default function Home() {
  const stats = getDashboardStats();

  // Fetch machines for the list
  const db = getDb();
  const machines = db.prepare('SELECT * FROM vending_machines LIMIT 5').all() as any[];

  return (
    <div class="dashboard-grid">
      {/* 1. Vending Machines List */}
      <div class="card machine-list">
        <div class="card-title">Vending Machines</div>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Address</th>
              <th>Accessibility</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.machine_id} style={{ borderBottom: '1px solid #eee', height: '40px' }}>
                <td><span style={{ color: 'green' }}>● Online</span></td>
                <td>{m.address}</td>
                <td>{m.accessible_features || 'Standard'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Messages / Alerts */}
      <div class="card message-list">
        <div class="card-title">New Messages</div>

        {/* Mock Messages */}
        <div class="message-item">
          <div class="message-avatar"></div>
          <div class="message-content">
            <strong>System Alert</strong>
            <span>Weekly report generated.</span>
          </div>
        </div>
        <div class="message-item">
          <div class="message-avatar"></div>
          <div class="message-content">
            <strong>Inventory Low</strong>
            <span>Abbot Hall is low on Coke.</span>
          </div>
        </div>
        <div class="message-item">
          <div class="message-avatar"></div>
          <div class="message-content">
            <strong>Maintenance</strong>
            <span>Gym machine scheduled for service.</span>
          </div>
        </div>
        <div class="message-item">
          <div class="message-avatar"></div>
          <div class="message-content">
            <strong>New User</strong>
            <span>John Doe registered an account.</span>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards (Split) */}
      <div class="stat-card-1">
        <div class="card">
          <div class="card-title">Total Revenue</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${stats.totalRevenue.toFixed(2)}</div>
          <div style={{ color: 'green', fontSize: '12px' }}>+12% from last week</div>
        </div>
        <div class="card">
          <div class="card-title">Active Machines</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalMachines}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>All systems operational</div>
        </div>
      </div>

      {/* 4. Map View (Placeholder for now, implementation complex) */}
      <div class="card full-width">
        <div class="card-title">Live Map</div>
        <div style={{ background: '#eee', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          Map Component would go here (Requires Client Component with Leaflet)
        </div>
      </div>

    </div>
  );
}
