const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function pushData() {
    console.log("🚀 Starting data push to live TiDB Server...");

    // 1. Read the local dump file
    if (!fs.existsSync('database_data.txt')) {
        console.error("❌ database_data.txt not found. Please ensure it is in the root folder.");
        process.exit(1);
    }
    const fileContent = fs.readFileSync('database_data.txt', 'utf-8');

    try {
        // 2. Disable Foreign Key Checks to prevent relationship order crashes
        console.log("🔓 Temporarily disabling foreign key checks...");
        await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

        // 3. Regex to extract Table Names and their JSON arrays
        const regex = /--- TABLE: (\w+) \(\d+ records\) ---\n(\[[\s\S]*?\])/g;
        let match;

        while ((match = regex.exec(fileContent)) !== null) {
            const tableName = match[1];
            const jsonData = match[2];

            const records = JSON.parse(jsonData);
            if (records.length === 0) {
                console.log(`⏩ Skipping ${tableName} (0 records)`);
                continue;
            }

            if (prisma[tableName]) {
                console.log(`⏳ Pushing ${records.length} records to ${tableName}...`);
                await prisma[tableName].createMany({
                    data: records,
                    skipDuplicates: true // Safe push: won't crash if data already exists
                });
                console.log(`✅ Success: ${tableName}`);
            } else {
                console.log(`⚠️ Warning: Prisma model for ${tableName} not found.`);
            }
        }

        // 4. Re-enable Foreign Key Checks
        console.log("🔒 Re-enabling foreign key checks...");
        await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

        console.log("\n🎉 ALL LOCAL DATA SUCCESSFULLY PUSHED TO TiDB!");

    } catch (e) {
        console.error("🚨 Fatal Error during push:", e);
        // Ensure we turn FK checks back on even if it fails
        await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
    }
}

pushData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });