import { getDashboardStats, getDb, getRevenueSeries, getTopProducts } from '@/lib/db';
import TopProductsChart from './components/TopProductsChart';

export const dynamic = 'force-dynamic'; // Refresh on every request

export default function Home() {
  const stats = getDashboardStats();

  // Fetch machines for the list
  const db = getDb();
  const machines = db.prepare('SELECT * FROM vending_machines LIMIT 10').all() as any[];
  const topProducts = getTopProducts(5);
  const revenueSeries = getRevenueSeries(8);

  const maxRevenue = Math.max(...revenueSeries.map((d) => d.total_revenue), 1);
  const chartWidth = 520;
  const chartHeight = 160;
  const points = revenueSeries.map((d, i) => {
    const x = (i / (revenueSeries.length - 1)) * chartWidth;
    const y = chartHeight - (d.total_revenue / maxRevenue) * (chartHeight - 20) - 10;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Sales Overview</div>
          <div className="page-subtitle">Your current sales summary and activity</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Total Sales */}
        <div className="card total-sales">
          <div className="card-header">
            <div className="card-title">Total Sales</div>
          </div>
          <div className="card-metric">${stats.totalRevenue.toFixed(2)}</div>
          <div className="sales-chip">
            <span className="chip-dot" />
            {stats.revenueChangePercent >= 0 ? '+' : ''}{stats.revenueChangePercent.toFixed(1)}% vs last month
          </div>
        </div>

        {/* Vending Machines Carousel */}
        <div className="card machine-carousel">
          <div className="card-header">
            <div className="card-title">Vending Machines</div>
          </div>
          <div className="carousel-track">
            {machines.map((m) => (
              <div key={m.machine_id} className="carousel-card">
                <img src="/vending-machine.png" alt="vending machine" className="carousel-thumb" />
                <div className="carousel-name">{m.address || `Machine ${m.machine_id}`}</div>
                <div className="carousel-sub">ID: {m.machine_id}</div>
              </div>
            ))}
          </div>
        </div>

      {/* 4. Recent Orders */}
      <div className="card recent-orders">
        <div className="card-header">
          <div className="card-title">Recent order</div>
          <button className="pill" type="button">Filter</button>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Date</th>
              <th>Status</th>
              <th>Price</th>
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
                  1.50 as price,
                  u.name as customer_name
                FROM purchases p
                JOIN items i ON p.item_id = i.item_id
                JOIN users u ON p.user_id = u.user_id
                ORDER BY p.timestamp DESC
                LIMIT 5
              `).all() as any[];
              
              return purchases.map((order, index) => (
                <tr key={order.purchase_id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="order-product">
                      <div className="order-thumb" />
                      <div className="order-name">{order.product_name}</div>
                    </div>
                  </td>
                  <td>{new Date(order.timestamp).toLocaleDateString()}</td>
                  <td>
                    <span className="status-pill">{order.status}</span>
                  </td>
                  <td>${order.price.toFixed(2)}</td>
                  <td>{order.customer_name}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
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

        {/* Top Products */}
        <div className="card products-card">
          <div className="card-header">
            <div className="card-title">Products sold</div>
            <button className="icon-btn" type="button" aria-label="More">⋯</button>
          </div>
          <div className="products-list">
            {topProducts.map((p, idx) => (
              <div key={idx} className="product-row">
                <div className="product-thumb"></div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-meta">{p.total_sold} sold</div>
                </div>
                <div className="product-price">${p.total_revenue.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

      {/* Top Products Chart */}
      <div style={{ gridColumn: '1 / -1' }}>
        <TopProductsChart data={topProducts.map((p) => ({ name: p.name, count: p.total_sold }))} />
      </div>

      </div>
    </div>
  );
}
