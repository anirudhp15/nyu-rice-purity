/**
 * Script to check the most recent submissions in MongoDB
 *
 * This script connects to MongoDB and retrieves the 10 most recent submissions
 * to analyze if demographic fields are being properly saved.
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function checkRecentSubmissions() {
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

    // Get the 10 most recent submissions
    const recentSubmissions = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    console.log(`\n======= 10 MOST RECENT SUBMISSIONS =======`);
    console.log(`Found ${recentSubmissions.length} recent submissions`);

    recentSubmissions.forEach((record, index) => {
      console.log(
        `\n[Submission ${index + 1}] Date: ${new Date(
          record.timestamp
        ).toLocaleString()}`
      );
      console.log(`  ID: ${record._id}`);
      console.log(`  Score: ${record.score}`);

      // Check demographic fields
      console.log(
        `  Gender: ${
          record.gender === null
            ? "null (legacy)"
            : record.gender === "not_provided"
            ? "Not provided (opted out)"
            : record.hasOwnProperty("gender")
            ? record.gender || "Empty string"
            : "FIELD MISSING"
        }`
      );

      console.log(
        `  School: ${
          record.school === null
            ? "null (legacy)"
            : record.school === "not_provided"
            ? "Not provided (opted out)"
            : record.hasOwnProperty("school")
            ? record.school || "Empty string"
            : "FIELD MISSING"
        }`
      );

      console.log(
        `  Year: ${
          record.year === null
            ? "null (legacy)"
            : record.year === "not_provided"
            ? "Not provided (opted out)"
            : record.hasOwnProperty("year")
            ? record.year || "Empty string"
            : "FIELD MISSING"
        }`
      );

      console.log(
        `  Living: ${
          record.living === null
            ? "null (legacy)"
            : record.living === "not_provided"
            ? "Not provided (opted out)"
            : record.hasOwnProperty("living")
            ? record.living || "Empty string"
            : "FIELD MISSING"
        }`
      );

      // Other relevant info
      console.log(`  Device Type: ${record.deviceType}`);
      console.log(`  Referrer: ${record.referrer}`);
    });

    // Count submissions by date to see if the issue occurred after a specific date
    console.log(`\n======= SUBMISSIONS BY DATE =======`);
    const submissionDates = await collection
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 10 },
      ])
      .toArray();

    submissionDates.forEach((date) => {
      console.log(
        `  ${date._id.year}-${date._id.month
          .toString()
          .padStart(2, "0")}-${date._id.day.toString().padStart(2, "0")}: ${
          date.count
        } submissions`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
checkRecentSubmissions().catch(console.error);
