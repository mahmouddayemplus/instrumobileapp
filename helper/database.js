import * as SQLite from 'expo-sqlite';

let db;

export const initDb = async ( update =false) => {
    // console.log('========= xxxxxxxxxx initDb xxxxxxxx===============');
    // console.log(update);
    // console.log('====================================');

    try {
        db = await SQLite.openDatabaseAsync('pmTasks.db');
        if (update) {
        await db.execAsync(`DROP TABLE IF EXISTS tasks;`);
        }

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        section TEXT NOT NULL,
        "order" INTEGER
      );
    `);
     } catch (error) {
        console.error('❌ Error initializing DB:', error);
    }
};


export const saveTasksToSQLite = async (id, section, order) => {
    // console.log('========= saveTasksToSQLite ===============');
    // console.log(id, section, order);
    // console.log('====================================');

    try {
        await db.runAsync(
            `INSERT OR REPLACE INTO tasks (id, section, "order") VALUES (?, ?, ?);`,
            [id, section, order]
        );
     } catch (error) {
        console.error('❌ Insert error:', error);
    }
};



export const getTasksFromSQLite = async () => {
    try {
        const result = await db.getAllAsync(`SELECT * FROM tasks ORDER BY "order" ASC;`);
        return result; // array of rows
    } catch (error) {
        console.error('❌ Fetch error:', error);
        return [];
    }
};
