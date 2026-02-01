import { getDashboardStats, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Refresh on every request

export default function Home() {
  const stats = getDashboardStats();

  // Fetch machines for the list
  const db = getDb();
  const machines = db.prepare('SELECT * FROM vending_machines LIMIT 5').all() as any[];

  return (
    <div className="dashboard-grid">
      {/* 1. Vending Machines List */}
      <div className="card machine-list">
        <div className="card-title">Vending Machines</div>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.machine_id} style={{ borderBottom: '1px solid #eee', height: '40px' }}>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Messages / Alerts */}
      <div className="card message-list">
        <div className="card-title">New Messages</div>

        {/* Mock Messages */}
        <div className="message-item">
          <div className="message-avatar"></div>
          <div className="message-content">
            <strong>System Alert</strong>
            <span>Weekly report generated.</span>
          </div>
        </div>
        <div className="message-item">
          <div className="message-avatar"></div>
          <div className="message-content">
            <strong>Inventory Low</strong>
            <span>Abbot Hall is low on Coke.</span>
          </div>
        </div>
        <div className="message-item">
          <div className="message-avatar"></div>
          <div className="message-content">
            <strong>Maintenance</strong>
            <span>Gym machine scheduled for service.</span>
          </div>
        </div>
        <div className="message-item">
          <div className="message-avatar"></div>
          <div className="message-content">
            <strong>New User</strong>
            <span>John Doe registered an account.</span>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards (Split) */}
      <div className="stat-card-1">
        <div className="card">
          <div className="card-title">Total Revenue</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${stats.totalRevenue.toFixed(2)}</div>
          <div style={{ color: 'green', fontSize: '12px' }}>+12% from last week</div>
        </div>
        <div className="card">
          <div className="card-title">Active Machines</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalMachines}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>All systems operational</div>
        </div>
      </div>

      {/* 4. Recent Orders */}
      <div className="card full-width">
        <div className="card-title">Recent Order</div>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Order Time</th>
              <th>Status</th>
              <th>Qty</th>
              <th>Total Price</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const db = getDb();
              const purchases = db.prepare(`
                SELECT 
                  p.purchase_id, 
                  i.name as product_name, 
                  p.timestamp, 
                  'Completed' as status,
                  1 as qty,
                  1.50 as price,
                  u.name as customer_name
                FROM purchases p
                JOIN items i ON p.item_id = i.item_id
                JOIN users u ON p.user_id = u.user_id
                LIMIT 5
              `).all() as any[];
              
              return purchases.map((order) => (
                <tr key={order.purchase_id} style={{ borderBottom: '1px solid #eee', height: '40px' }}>
                  <td>{order.purchase_id}</td>
                  <td>{order.product_name}</td>
                  <td>{order.timestamp}</td>
                  <td><span style={{ color: 'green', fontWeight: 'bold' }}>●</span> {order.status}</td>
                  <td>{order.qty}</td>
                  <td>${order.price.toFixed(2)}</td>
                  <td>{order.customer_name}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

    </div>
  );
}
