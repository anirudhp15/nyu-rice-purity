// scripts/findLowScores.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is not set.");
  console.error(
    "Make sure your .env file contains the MongoDB connection string."
  );
  process.exit(1);
}

async function findLowScores() {
  // Create a new MongoClient
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB successfully");

    // Get database (use the same database name as your application)
    const database = client.db();

    // Mongoose typically uses lowercase plural collection names
    const resultsCollection = database.collection("results");

    // Find documents where score is less than 5
    const query = { score: { $lt: 5 } };

    // Only return _id, score and timestamp
    const projection = { _id: 1, score: 1, timestamp: 1 };

    const lowScores = await resultsCollection
      .find(query)
      .project(projection)
      .toArray();

    // Print results
    console.log(`Found ${lowScores.length} results with scores less than 5:\n`);

    if (lowScores.length === 0) {
      console.log("No results found with scores less than 5.");

      // Try with the singular collection name as fallback
      console.log("\nTrying alternative collection name...");
      const altCollection = database.collection("result");
      const altLowScores = await altCollection
        .find(query)
        .project(projection)
        .toArray();

      if (altLowScores.length > 0) {
        console.log(
          `Found ${altLowScores.length} results with scores less than 5 in 'result' collection:\n`
        );
        altLowScores.forEach((result, index) => {
          console.log(`${index + 1}. ObjectID: ${result._id}`);
          console.log(`   Score: ${result.score}`);
          if (result.timestamp) {
            console.log(
              `   Date: ${new Date(result.timestamp).toLocaleString()}`
            );
          }
          console.log("");
        });

        // Print just the IDs for easy copying
        console.log("Object IDs only (for copying):");
        altLowScores.forEach((result) => {
          console.log(result._id.toString());
        });
      } else {
        console.log("No results found in alternative collection either.");
      }
    } else {
      lowScores.forEach((result, index) => {
        console.log(`${index + 1}. ObjectID: ${result._id}`);
        console.log(`   Score: ${result.score}`);
        if (result.timestamp) {
          console.log(
            `   Date: ${new Date(result.timestamp).toLocaleString()}`
          );
        }
        console.log("");
      });

      // Print just the IDs for easy copying
      console.log("Object IDs only (for copying):");
      lowScores.forEach((result) => {
        console.log(result._id.toString());
      });
    }

    // List all collections to help troubleshoot
    console.log("\nAvailable collections in database:");
    const collections = await database.listCollections().toArray();
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });
  } catch (error) {
    console.error("Error occurred while querying MongoDB:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the function
findLowScores();
