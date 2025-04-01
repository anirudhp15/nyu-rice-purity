/**
 * Script to find records with missing demographic fields
 *
 * This script connects to MongoDB and finds any records where
 * demographic fields are missing (not just null, but actually missing).
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function findMissingFields() {
  // Get MongoDB URI from environment variable
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is not set");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db(); // This uses the database specified in the connection string
    const collection = database.collection("results");

    // Find records where at least one demographic field is missing
    const missingAnyFields = await collection
      .find({
        $or: [
          { gender: { $exists: false } },
          { school: { $exists: false } },
          { year: { $exists: false } },
          { living: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`\n======= RECORDS WITH MISSING FIELDS =======`);
    console.log(
      `Found ${missingAnyFields.length} records with at least one missing demographic field`
    );

    if (missingAnyFields.length > 0) {
      // For each record, show which fields are missing
      missingAnyFields.forEach((record, index) => {
        console.log(`\n[Record ${index + 1}] ID: ${record._id}`);
        console.log(
          `  Submission Date: ${new Date(record.timestamp).toLocaleString()}`
        );
        console.log(`  Score: ${record.score}`);

        // Check each field
        console.log(
          `  Gender field exists: ${record.hasOwnProperty("gender")}`
        );
        console.log(
          `  School field exists: ${record.hasOwnProperty("school")}`
        );
        console.log(`  Year field exists: ${record.hasOwnProperty("year")}`);
        console.log(
          `  Living field exists: ${record.hasOwnProperty("living")}`
        );

        // Show available fields
        console.log(`  Available fields: ${Object.keys(record).join(", ")}`);

        // Show other potentially relevant fields
        if (record.deviceType)
          console.log(`  Device Type: ${record.deviceType}`);
        if (record.referrer) console.log(`  Referrer: ${record.referrer}`);
      });

      // Also look for records with weird values
      console.log(`\n======= CHECKING FOR OTHER ANOMALIES =======`);

      // Check for records where only some fields exist
      const partialFields = await collection
        .find({
          $and: [{ gender: { $exists: true } }, { school: { $exists: false } }],
        })
        .toArray();

      console.log(`Records with gender but no school: ${partialFields.length}`);

      const partialFields2 = await collection
        .find({
          $and: [{ school: { $exists: true } }, { gender: { $exists: false } }],
        })
        .toArray();

      console.log(
        `Records with school but no gender: ${partialFields2.length}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
findMissingFields().catch(console.error);
