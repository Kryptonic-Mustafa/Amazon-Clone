const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function dumpData() {
    console.log("⏳ Fetching database records...");
    let output = "=== AMAZON CLONE DATABASE DUMP ===\n\n";

    // Get the names of all 14 models Prisma just discovered
    const models = Prisma.dmmf.datamodel.models;
    
    for (const model of models) {
        const modelName = model.name;
        // Convert PascalCase (e.g., 'AdminUser') to camelCase ('adminUser') for the query
        const delegateName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
        
        try {
            if (prisma[delegateName]) {
                const records = await prisma[delegateName].findMany();
                output += `\n--- TABLE: ${modelName} (${records.length} records) ---\n`;
                output += JSON.stringify(records, null, 2) + "\n\n";
                console.log(`✅ Fetched ${records.length} records from ${modelName}`);
            }
        } catch (e) {
            console.log(`⚠️ Could not fetch data for ${modelName}`);
        }
    }

    fs.writeFileSync('database_data.txt', output);
    console.log("\n🎉 ALL DONE! Your data is safely saved in 'database_data.txt'.");
}

dumpData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });