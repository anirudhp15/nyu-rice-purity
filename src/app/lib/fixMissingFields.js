/**
 * Script to fix record with missing demographic fields
 *
 * This script connects to MongoDB and adds null values for demographic fields
 * to any records where these fields are completely missing.
 */

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

async function fixMissingFields() {
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

    // Fix the specific record we identified
    const specificRecordId = "67eb5152596f87fbfe097478";
    const specificFix = await collection.updateOne(
      { _id: new ObjectId(specificRecordId) },
      {
        $set: {
          gender: null,
          school: null,
          year: null,
          living: null,
        },
      }
    );

    console.log(
      `Updated specific record (${specificRecordId}): ${specificFix.modifiedCount} document modified`
    );

    // Fix any other records that might have missing fields
    const generalFix = await collection.updateMany(
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

    console.log(
      `Updated all records with missing fields: ${generalFix.modifiedCount} documents modified`
    );

    // Verify the fix worked
    const remainingIssues = await collection.countDocuments({
      $or: [
        { gender: { $exists: false } },
        { school: { $exists: false } },
        { year: { $exists: false } },
        { living: { $exists: false } },
      ],
    });

    console.log(`Records with missing fields after fix: ${remainingIssues}`);

    if (remainingIssues === 0) {
      console.log("✅ All records now have proper demographic fields!");
    } else {
      console.log(
        "⚠️ Some records still have issues - further investigation needed"
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
fixMissingFields().catch(console.error);
