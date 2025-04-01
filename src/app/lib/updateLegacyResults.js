/**
 * Migration script to update legacy records in the Result collection
 *
 * This script updates all existing records that don't have the new fields,
 * setting them to null to indicate they were created before these fields existed.
 *
 * Usage:
 * 1. Run this script directly via Node.js
 * 2. node src/app/lib/updateLegacyResults.js
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function updateLegacyRecords() {
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

    // Count total documents
    const totalCount = await collection.countDocuments();
    console.log(`Total documents in collection: ${totalCount}`);

    // Query for documents without the new fields
    const missingFields = await collection.countDocuments({
      $or: [
        { gender: { $exists: false } },
        { school: { $exists: false } },
        { year: { $exists: false } },
        { living: { $exists: false } },
      ],
    });
    console.log(`Documents missing new fields: ${missingFields}`);

    if (missingFields > 0) {
      console.log("Updating legacy records...");

      // Update records: set all missing fields to null (indicating legacy record)
      const updateResult = await collection.updateMany(
        {
          $or: [
            { gender: { $exists: false } },
            { school: { $exists: false } },
            { year: { $exists: false } },
            { living: { $exists: false } },
          ],
        },
        {
          $set: {
            gender: null,
            school: null,
            year: null,
            living: null,
          },
        }
      );

      console.log(`Updated ${updateResult.modifiedCount} documents`);
    } else {
      console.log("No legacy records to update");
    }

    // Validate the update worked
    const remainingMissing = await collection.countDocuments({
      $or: [
        { gender: { $exists: false } },
        { school: { $exists: false } },
        { year: { $exists: false } },
        { living: { $exists: false } },
      ],
    });

    console.log(`Remaining documents with missing fields: ${remainingMissing}`);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
updateLegacyRecords().catch(console.error);
