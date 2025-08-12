// import * as SQLite from 'expo-sqlite';

// let db;

// export const initDb = async ( update =false) => {
//     try {
//         db = await SQLite.openDatabaseAsync('qcc_hcc_all_warehouse.db');
//         if (update) {
//         await db.execAsync(`DROP TABLE IF EXISTS tasks;`);
//         }

//         await db.execAsync(`
//       CREATE TABLE IF NOT EXISTS tasks (
//         new TEXT PRIMARY KEY NOT NULL,
//         old  TEXT NOT NULL,
//         description TEXT NOT NULL
//       );
//     `);
//      } catch (error) {
//         console.error('❌ Error initializing DB:', error);
//     }
// };

 



// export const getTasksFromSQLite = async () => {
//     try {
//         const result = await db.getAllAsync(`SELECT * FROM tasks ORDER BY "order" ASC;`);
//         return result; // array of rows
//     } catch (error) {
//         console.error('❌ Fetch error:', error);
//         return [];
//     }
// };
