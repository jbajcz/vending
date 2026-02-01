import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

const DB_NAME = 'vending.db';

export const getDatabase = async () => {
    // Ensuring the SQLite directory exists
    const dbDir = FileSystem.documentDirectory + 'SQLite';
    if (!(await FileSystem.getInfoAsync(dbDir)).exists) {
        await FileSystem.makeDirectoryAsync(dbDir);
    }

    const dbPath = dbDir + '/' + DB_NAME;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    // For Development/Demo: Always overwrite the DB to get fresh data
    if (fileInfo.exists) {
        await FileSystem.deleteAsync(dbPath, { idempotent: true });
    }

    const dbAsset = require('../../assets/vending.db');
    const asset = Asset.fromModule(dbAsset);
    await asset.downloadAsync();

    await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: dbPath,
    });

    return await SQLite.openDatabaseAsync(DB_NAME);
};

// Helper for queries
export const runQuery = async (query: string, params: any[] = []): Promise<any[]> => {
    try {
        const db = await getDatabase();

        // Simple Check to differentiate READ vs WRITE
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            const result = await db.getAllAsync(query, params);
            return result;
        } else {
            const result = await db.runAsync(query, params);
            return []; // runAsync returns RunResult { changes, lastInsertRowId }
        }
    } catch (e) {
        console.error("Query Error", e);
        return [];
    }
};
