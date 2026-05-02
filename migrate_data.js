const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const LOCAL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'Yahusain@128',
  database: 'amazon_clone_db'
};

const TIDB_URL = process.env.DATABASE_URL;

async function migrate() {
  let localConn, tidbConn;

  try {
    console.log("🚀 Connecting to local MySQL...");
    localConn = await mysql.createConnection(LOCAL_CONFIG);

    console.log("🚀 Connecting to TiDB...");
    // TiDB connection might need SSL
    tidbConn = await mysql.createConnection({
        uri: TIDB_URL,
        ssl: {
            rejectUnauthorized: true
        }
    });

    console.log("✅ Connections established.");

    // Disable foreign key checks on TiDB
    await tidbConn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Get all tables from local
    const [tables] = await localConn.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const tableName of tableNames) {
      console.log(`📦 Migrating table: ${tableName}...`);

      // Truncate TiDB table first
      await tidbConn.query(`TRUNCATE TABLE \`${tableName}\``);

      // Fetch data from local
      const [rows] = await localConn.query(`SELECT * FROM \`${tableName}\``);

      if (rows.length > 0) {
        // Insert data into TiDB
        const keys = Object.keys(rows[0]);
        const columns = keys.map(k => `\`${k}\``).join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const values = rows.map(row => keys.map(key => row[key]));

        // Use batch insert
        const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES ?`;
        
        // Ensure values are properly formatted for MySQL (especially JSON and Dates)
        const formattedValues = rows.map(row => 
          keys.map(key => {
            const val = row[key];
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
              return JSON.stringify(val);
            }
            return val;
          })
        );

        await tidbConn.query(sql, [formattedValues]);
        console.log(`✅ Migrated ${rows.length} rows for ${tableName}`);
      } else {
        console.log(`🟡 Table ${tableName} is empty, skipping.`);
      }
    }

    // Re-enable foreign key checks
    await tidbConn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log("\n🎉 DATA MIGRATION COMPLETE!");

  } catch (err) {
    console.error("🚨 Migration failed:", err);
  } finally {
    if (localConn) await localConn.end();
    if (tidbConn) await tidbConn.end();
  }
}

migrate();
