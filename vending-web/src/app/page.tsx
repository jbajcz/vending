import { getDashboardStats, getDb, getTopProducts } from '@/lib/db';
import TopProductsChart from './components/TopProductsChart';

export const dynamic = 'force-dynamic'; // Refresh on every request

export default function Home() {
  const stats = getDashboardStats();

  // Fetch machines for the list
  const db = getDb();
  const machines = db.prepare('SELECT * FROM vending_machines LIMIT 5').all() as any[];
  const topProducts = getTopProducts(5);

  return (
    <div className="dashboard-grid">
      {/* 1. Vending Machines List */}
      <div className="card machine-list">
        <div className="card-title">Vending Machines</div>
        <div className="machines-grid">
          {machines.map((m) => (
            <div key={m.machine_id} className="machine-card">
              <img src="/vending-machine.png" alt="vending" />
              <div className="machine-name">{m.address || `Machine ${m.machine_id}`}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Messages / Alerts */}
      <div className="card message-list">
        <div className="card-title">Inbox</div>
        {/* Messages (scrollable) */}
        {(() => {
          const messages = [
            { id: 1, title: 'System Alert', body: 'Weekly report generated.', unread: true, time: '2h' },
            { id: 2, title: 'Inventory Low', body: 'Abbot Hall is low on Coke.', unread: true, time: '3h' },
            { id: 3, title: 'Maintenance', body: 'Gym machine scheduled for service.', unread: false, time: '6h' },
            { id: 4, title: 'New User', body: 'John Doe registered an account.', unread: false, time: '1d' },
            { id: 5, title: 'Survey', body: 'New feedback submitted for Doritos.', unread: true, time: '2d' },
            { id: 6, title: 'Alert', body: 'Sensor reported a jam at Library.', unread: false, time: '2d' },
            { id: 7, title: 'Promo', body: 'New promo code available: SAVE10.', unread: true, time: '3d' },
            { id: 8, title: 'Report', body: 'Monthly sales report ready.', unread: false, time: '4d' },
            { id: 9, title: 'Restock', body: 'Tray refill requested at Gym.', unread: true, time: '5d' },
            { id: 10, title: 'Reminder', body: 'Check machine 12 battery.', unread: false, time: '6d' }
          ];

          return messages.map((m) => (
            <div key={m.id} className="message-item">
              <div className="message-avatar"></div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {m.unread && <span className="unread-dot" />}
                    <strong style={{ fontSize: 13 }}>{m.title}</strong>
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>{m.time}</span>
                </div>
                <span style={{ fontSize: 11, color: '#666' }}>{m.body}</span>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* 3. Stat Cards (Split) */}
      <div className="stat-card-1">
        <div className="card">
          <div className="card-title">Total Revenue</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${stats.totalRevenue.toFixed(2)}</div>
          <div style={{ color: stats.revenueChangePercent >= 0 ? 'green' : 'red', fontSize: '12px' }}>
            {stats.revenueChangePercent >= 0 ? '+' : ''}{stats.revenueChangePercent.toFixed(1)}% from last week
          </div>
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
               <th>Machine</th>
               <th>Order Time</th>
              <th>Status</th>
              <th>Qty</th>
              <th>Total Price</th>
                           <th>Credits Earned</th>
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
                                   p.machine_id,
                  p.timestamp, 
                  'Completed' as status,
                  1 as qty,
                  1.50 as price,
                                   p.credits_earned,
                  u.name as customer_name
                FROM purchases p
                JOIN items i ON p.item_id = i.item_id
                JOIN users u ON p.user_id = u.user_id
                ORDER BY p.timestamp DESC
                LIMIT 5
              `).all() as any[];
              
              return purchases.map((order) => (
                <tr key={order.purchase_id} style={{ borderBottom: '1px solid #eee', height: '40px' }}>
                  <td>{order.purchase_id}</td>
                  <td>{order.product_name}</td>
                                   <td>{order.machine_id}</td>
                  <td>{new Date(order.timestamp).toLocaleString()}</td>
                  <td><span style={{ color: 'green', fontWeight: 'bold' }}>●</span> {order.status}</td>
                  <td>{order.qty}</td>
                  <td>${order.price.toFixed(2)}</td>
                                   <td>{order.credits_earned}</td>
                  <td>{order.customer_name}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Top Products Chart */}
      <div style={{ gridColumn: '1 / -1' }}>
        <TopProductsChart data={topProducts} />
      </div>

    </div>
  );
}
