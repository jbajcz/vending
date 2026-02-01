import Database from 'better-sqlite3';
import path from 'path';

// Database is located in the parent directory of the web project root
const DB_PATH = path.resolve(process.cwd(), '../vending.db');

let db: Database.Database | null = null;

export function getDb() {
    if (!db) {
        try {
            console.log(`Connecting to DB at: ${DB_PATH}`);
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

    // Calculate revenue from purchases (fixed $1.50 per purchase)
    const purchaseCount = db.prepare('SELECT COUNT(*) as count FROM purchases').get() as { count: number };
    const totalRevenue = purchaseCount.count * 1.50;

    // Calculate revenue change from last week
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekDate = lastWeek.toISOString().split('T')[0];
    
    const lastWeekPurchases = db.prepare(`
        SELECT COUNT(*) as count FROM purchases 
        WHERE DATE(timestamp) < ?
        AND DATE(timestamp) >= DATE(?, '-7 days')
    `).get(lastWeekDate, lastWeekDate) as { count: number };
    
    const lastWeekRevenue = lastWeekPurchases.count * 1.50;
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
export function getTopProducts(limit = 5): { name: string; count: number }[] {
    const db = getDb();
    const rows = db.prepare(`
        SELECT i.name as name, COUNT(p.purchase_id) as count
        FROM purchases p
        JOIN items i ON p.item_id = i.item_id
        GROUP BY p.item_id
        ORDER BY count DESC
        LIMIT ?
    `).all(limit) as { name: string; count: number }[];
    return rows;
}
