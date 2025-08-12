import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'warehouse.db';

// Step 1: Copy DB from assets to document directory
async function copyDatabase() {
  const dbFile = `${FileSystem.documentDirectory}${DB_NAME}`;
  const fileInfo = await FileSystem.getInfoAsync(dbFile);

  if (!fileInfo.exists) {
    const asset = Asset.Asset.fromModule(require('../assets/warehouse.db'));
    await asset.downloadAsync();
    await FileSystem.copyAsync({
      from: asset.localUri,
      to: dbFile,
    });
  }

  return dbFile;
}

// Step 2: Open the DB asynchronously
async function openDatabase(dbFile) {
  return SQLite.openDatabaseAsync(dbFile);
}

// Step 3: Updated helper to run SQL with proper result handling
async function executeSqlAsync(db, sql, params = []) {
  try {
    // For SELECT queries, we need to use getAllAsync
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return await db.getAllAsync(sql, params);
    }
    // For other queries (INSERT, UPDATE, DELETE)
    return await db.runAsync(sql, params);
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
}

// Public function to get DB handle
export async function getDatabase() {
  const dbFile = await copyDatabase();
  return await openDatabase(dbFile);
}

// Example: get rows from "items" table
export async function getItems(limit = 10) {
  try {
    const db = await getDatabase();
    // For SELECT queries, getAllAsync returns the rows directly
    const rows = await db.getAllAsync('SELECT * FROM items LIMIT ?;', [limit]);
    return rows || []; // Return empty array if undefined
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return [];
  }
}

// Example: search items by term in multiple columns
export async function searchItems(term, limit = 100) {
  console.log('==============term=============');
  console.log(term);
  console.log('====================================');
  try {
    const db = await getDatabase();
    const likeTerm = `%${term.replace(/[%_]/g, '\\$&')}%`;

    const sql = `
      SELECT * FROM items
      WHERE "new" LIKE ? ESCAPE '\\'
        OR "old" LIKE ? ESCAPE '\\'
        OR "description" LIKE ? ESCAPE '\\'
      LIMIT ?;
    `;

    const rows = await db.getAllAsync(sql, [likeTerm, likeTerm, likeTerm, limit]);
    return rows || [];
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}