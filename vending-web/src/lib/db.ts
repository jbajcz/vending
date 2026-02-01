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
}

export function getDashboardStats(): DashboardStats {
    const db = getDb();

    const machineCount = db.prepare('SELECT COUNT(*) as count FROM vending_machines').get() as { count: number };

    // Revenue (mocked sum of all purchases)
    // Assuming mock credits_earned is actually price spent? Or we can just sum a fixed price since schema didn't have price on purchase
    // The schema had 'credits_earned' which sounds like points. Let's assume $1.50 per transaction for now
    const purchaseCount = db.prepare('SELECT COUNT(*) as count FROM purchases').get() as { count: number };

    return {
        totalMachines: machineCount.count,
        activeAlerts: 3, // Mocked for now (Out of stock items)
        totalRevenue: purchaseCount.count * 1.50,
        topProduct: 'Cheez-its' // Placeholder, will query proper later
    };
}
