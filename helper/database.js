import * as SQLite from 'expo-sqlite';

let db;

export const initDb = async () => {
  try {
    db = await SQLite.openDatabaseAsync('pmTasks.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        section TEXT NOT NULL,
        "order" INTEGER
      );
    `);
    console.log('✅ Table created successfully');
  } catch (error) {
    console.error('❌ Error initializing DB:', error);
  }
};
// export const saveTasksToSQLite = (tasks) => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql('DELETE FROM tasks'); // clear old data
//       tasks.forEach((task) => {
//         tx.executeSql(
//           'INSERT INTO tasks (id, section, "order") VALUES (?, ?, ?)',
//           [task.id, task.section, task.order]
//         );
//       });
//     },
//     reject,
//     resolve);
//   });
// };

export const saveTasksToSQLite = async (id, section, order) => {
    console.log('========= saveTasksToSQLite ===============');
    console.log(id,section,order);
    console.log('====================================');
  try {
    await db.runAsync(
      `INSERT INTO tasks (id, section, "order") VALUES (?, ?, ?);`,
      [id, section, order]
    );
    console.log('✅ Task inserted');
  } catch (error) {
    console.error('❌ Insert error:', error);
  }
};


// export const getTasksFromSQLite = () => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         'SELECT * FROM tasks ORDER BY "order"',
//         [],
//         (_, result) => resolve(result.rows._array),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

export const getTasksFromSQLite = async () => {
  try {
    const result = await db.getAllAsync(`SELECT * FROM tasks ORDER BY "order" ASC;`);
    return result; // array of rows
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return [];
  }
};
