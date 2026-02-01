import Database from 'better-sqlite3';
import path from 'path';

// Database is located in the parent directory of the web project root
const DB_PATH = path.join(process.cwd(), '../vending.db');

let db: Database.Database | null = null;

export function getDb() {
    if (!db) {
        try {
            console.log(`Connecting to DB at: ${DB_PATH} `);
            db = new Database(DB_PATH, { verbose: console.log });
            db.pragma('journal_mode = WAL');
        } catch (error) {
            console.error("Failed to connect to database:", error);
            throw error;
        }
    }
    return db;
}

// Queries
export interface DashboardStats {
    totalMachines: number;
    activeAlerts: number;
    totalRevenue: number;
    topProduct: string;
    revenueChangePercent: number;
}

export function getDashboardStats(): DashboardStats {
    const db = getDb();

    const machineCount = db.prepare('SELECT COUNT(*) as count FROM vending_machines').get() as { count: number };

    // Calculate revenue from purchases (Sum of credits_earned)
    const revenueQuery = db.prepare('SELECT SUM(credits_earned) as total FROM purchases').get() as { total: number };
    const totalRevenue = revenueQuery.total || 0;

    // Calculate revenue change from last week
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekDate = lastWeek.toISOString().split('T')[0];

    const lastWeekPurchases = db.prepare(`
        SELECT SUM(credits_earned) as total FROM purchases 
        WHERE DATE(timestamp) < ?
        AND DATE(timestamp) >= DATE(?, '-7 days')
    `).get(lastWeekDate, lastWeekDate) as { total: number };

    const lastWeekRevenue = lastWeekPurchases.total || 0;
    const revenueChangePercent = lastWeekRevenue > 0
        ? ((totalRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
        : 0;

    // Get top product by purchase count
    const topProduct = db.prepare(`
        SELECT i.name
        FROM purchases p
        JOIN items i ON p.item_id = i.item_id
        GROUP BY p.item_id
        ORDER BY COUNT(p.purchase_id) DESC
        LIMIT 1
    `).get() as { name: string } | undefined;

    return {
        totalMachines: machineCount.count,
        activeAlerts: 3, // Mocked for now (Out of stock items)
        totalRevenue: totalRevenue,
        topProduct: topProduct?.name || 'N/A',
        revenueChangePercent: revenueChangePercent
    };
}

// Return top N products by purchase count
export function getTopProducts(limit = 5): { name: string; total_sold: number; total_revenue: number }[] {
    const db = getDb();
    const rows = db.prepare(`
        SELECT i.name as name,
               COUNT(p.purchase_id) as total_sold,
               SUM(p.credits_earned) as total_revenue
        FROM purchases p
        JOIN items i ON p.item_id = i.item_id
        GROUP BY p.item_id
        ORDER BY total_sold DESC
        LIMIT ?
    `).all(limit) as { name: string; total_sold: number; total_revenue: number }[];
    return rows;
}

export function getRevenueSeries(days = 8): { date: string; total_revenue: number }[] {
    const db = getDb();
    const rows = db.prepare(`
        SELECT DATE(timestamp) as date,
               SUM(credits_earned) as total_revenue
        FROM purchases
        WHERE DATE(timestamp) >= DATE('now', ?)
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp) ASC
    `).all(`-${days - 1} days`) as { date: string; total_revenue: number }[];

    const map = new Map(rows.map((r) => [r.date, r.total_revenue]));
    const series: { date: string; total_revenue: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const iso = d.toISOString().split('T')[0];
        series.push({ date: iso, total_revenue: map.get(iso) ?? 0 });
    }
    return series;
}
