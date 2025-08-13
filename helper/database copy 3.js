// import * as FileSystem from 'expo-file-system';
// import * as Asset from 'expo-asset';
// import * as SQLite from 'expo-sqlite';

// const dbFileName = 'warehouse.db';

// async function openDatabase() {
//   const dbFile = `${FileSystem.documentDirectory}${dbFileName}`;

//   // Check if DB file already copied
//   const fileInfo = await FileSystem.getInfoAsync(dbFile);
//   if (!fileInfo.exists) {
//     // Copy from assets to document directory
//     const asset = Asset.Asset.fromModule(require('../assets/warehouse.db'));
//     await asset.downloadAsync();
//     await FileSystem.copyAsync({
//       from: asset.localUri,
//       to: dbFile,
//     });
//   }

//   // Open DB from copied location
//   const db = SQLite.openDatabaseAsync(dbFile);
//   return db;
// }
// // export const initDb = async (update = false) => {
// //     try {
// //         db = await SQLite.openDatabaseAsync('qcc_hcc_all_warehouse.db');


// //         await db.execAsync(`
// //       CREATE TABLE IF NOT EXISTS qcc_hcc_all_warehouse (
// //         new TEXT PRIMARY KEY NOT NULL,
// //         old  TEXT NOT NULL,
// //         description TEXT NOT NULL
// //       );
// //     `);
// //     } catch (error) {
// //         console.error('❌ Error initializing DB:', error);
// //     }
// // };

// const db = await openDatabase();
// const rows = await db.getAllAsync(`SELECT * FROM "items" LIMIT 10;`);


// // console.log('==============ddddddd==================');
// // console.log(rows);
// // console.log('====================================');





// // export const getTasksFromSQLite = async () => {
// //         const db = await SQLite.openDatabaseAsync('qcc_hcc_all_warehouse.db');

// //     try {
// //         const result = await db.getAllAsync(`SELECT * FROM items limit 10 ASC;`);
// //         return result; // array of rows
// //     } catch (error) {
// //         console.error('❌ Fetch error:', error);
// //         return [];
// //     }
// // };


// // function escapeLike(term) {
// //     return term.replace(/[%_]/g, '\\$&');
// // }
// // const DB_NAME = 'qcc_hcc_all_warehouse.db'; // or 'qcc_hcc_all_warehouse.db'
// // const TABLE = 'items';
// // export async function searchWarehouse(term, limit = 100) {
// //     console.log('====================================');
// //     console.log(term);
// //     console.log('====================================');
// //     const db = await SQLite.openDatabaseAsync(DB_NAME);
// //     const like = `%${escapeLike( term )}%`;

// //     const sql = `
// //     SELECT id, "new", "old", "description"
// //     FROM "${TABLE}"
// //     WHERE "new" LIKE ? ESCAPE '\\'
// //        OR "old" LIKE ? ESCAPE '\\'
// //        OR "description" LIKE ? ESCAPE '\\'
// //     ORDER BY id DESC
// //     LIMIT ${limit};
// //   `;

// //     const rows = await db.getAllAsync(sql, [like, like, like]);
// //     console.log('====================================');
// //     console.log(rows);
// //     console.log('====================================');
// //     return rows; // array of objects
// // }
// // export const searchItems = async (searchTerm) => {
// //     const DB_NAME = 'qcc_hcc_all_warehouse'; // or 'qcc_hcc_all_warehouse.db'
// //     const TABLE = 'items';
// //     const db = await SQLite.openDatabaseAsync(DB_NAME);

// //     try {
// //         const query = `
// //       SELECT * FROM items
// //       WHERE new LIKE ? OR old LIKE ? OR description LIKE ?
// //       ORDER BY new ASC;
// //     `;
// //         const param = `%${searchTerm}%`;

// //         const result = await db.getAllAsync(query, [param, param, param]);
// //         console.log('Search results:', result);
// //         return result;
// //     } catch (error) {
// //         console.error('❌ Search error:', error);
// //         return [];
// //     }
// // };


