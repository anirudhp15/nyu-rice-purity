/**
 * Script to check demographic data submissions in MongoDB
 *
 * This script connects to MongoDB and runs queries to check
 * which submissions have demographic data.
 *
 * Usage:
 * 1. node src/app/lib/checkDemographics.js [query-type]
 *
 * Query types:
 * - school: Show all submissions with school data
 * - gender: Show all submissions with gender data
 * - year: Show all submissions with year data
 * - living: Show all submissions with living situation data
 * - summary: Show counts for each demographic category (default)
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function checkDemographics() {
  // Get command line arg for query type
  const queryType = process.argv[2] || "summary";

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

    // Run appropriate query based on command line arg
    switch (queryType) {
      case "school":
        await showSchoolData(collection);
        break;
      case "gender":
        await showGenderData(collection);
        break;
      case "year":
        await showYearData(collection);
        break;
      case "living":
        await showLivingData(collection);
        break;
      case "summary":
      default:
        await showSummary(collection);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

async function showSummary(collection) {
  const totalCount = await collection.countDocuments();

  const schoolCounts = await getFieldStatusCounts(collection, "school");
  const genderCounts = await getFieldStatusCounts(collection, "gender");
  const yearCounts = await getFieldStatusCounts(collection, "year");
  const livingCounts = await getFieldStatusCounts(collection, "living");

  console.log("\n========= DEMOGRAPHIC DATA SUMMARY =========");
  console.log(`Total submissions in database: ${totalCount}`);
  console.log("\nBREAKDOWN BY DATA TYPE:");

  console.log("\nSCHOOL DATA:");
  logCounts(schoolCounts, totalCount);

  console.log("\nGENDER DATA:");
  logCounts(genderCounts, totalCount);

  console.log("\nYEAR DATA:");
  logCounts(yearCounts, totalCount);

  console.log("\nLIVING SITUATION DATA:");
  logCounts(livingCounts, totalCount);

  // Distribution by school
  console.log("\n----- School Distribution -----");
  const schoolDistribution = await collection
    .aggregate([
      { $match: { school: { $ne: null, $ne: "not_provided" } } },
      { $group: { _id: "$school", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  schoolDistribution.forEach((item) => {
    console.log(
      `${item._id}: ${item.count} (${((item.count / totalCount) * 100).toFixed(
        1
      )}%)`
    );
  });

  // Distribution by gender
  console.log("\n----- Gender Distribution -----");
  const genderDistribution = await collection
    .aggregate([
      { $match: { gender: { $ne: null, $ne: "not_provided" } } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  genderDistribution.forEach((item) => {
    console.log(
      `${item._id}: ${item.count} (${((item.count / totalCount) * 100).toFixed(
        1
      )}%)`
    );
  });
}

async function getFieldStatusCounts(collection, field) {
  // Check how many results have the field set to different values
  const notExist = await collection.countDocuments({
    [field]: { $exists: false },
  });
  const nullValue = await collection.countDocuments({ [field]: null });
  const notProvided = await collection.countDocuments({
    [field]: "not_provided",
  });
  const provided = await collection.countDocuments({
    [field]: { $exists: true, $ne: null, $ne: "not_provided" },
  });

  return {
    notExist,
    nullValue,
    notProvided,
    provided,
  };
}

function logCounts(counts, total) {
  console.log(
    `  Field missing: ${counts.notExist} (${(
      (counts.notExist / total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `  Null (legacy): ${counts.nullValue} (${(
      (counts.nullValue / total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `  Not provided (opted out): ${counts.notProvided} (${(
      (counts.notProvided / total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `  Provided: ${counts.provided} (${(
      (counts.provided / total) *
      100
    ).toFixed(1)}%)`
  );
}

async function showSchoolData(collection) {
  const results = await collection
    .find(
      { school: { $exists: true, $ne: null, $ne: "not_provided" } },
      { projection: { timestamp: 1, score: 1, school: 1, _id: 0 } }
    )
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  console.log("\n======= SUBMISSIONS WITH SCHOOL DATA =======");
  console.log(`Found ${results.length} recent submissions with school data`);

  results.forEach((result, index) => {
    console.log(
      `\n[${index + 1}] Date: ${new Date(result.timestamp).toLocaleString()}`
    );
    console.log(`  Score: ${result.score}`);
    console.log(`  School: ${result.school}`);
  });
}

async function showGenderData(collection) {
  const results = await collection
    .find(
      { gender: { $exists: true, $ne: null, $ne: "not_provided" } },
      { projection: { timestamp: 1, score: 1, gender: 1, _id: 0 } }
    )
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  console.log("\n======= SUBMISSIONS WITH GENDER DATA =======");
  console.log(`Found ${results.length} recent submissions with gender data`);

  results.forEach((result, index) => {
    console.log(
      `\n[${index + 1}] Date: ${new Date(result.timestamp).toLocaleString()}`
    );
    console.log(`  Score: ${result.score}`);
    console.log(`  Gender: ${result.gender}`);
  });
}

async function showYearData(collection) {
  const results = await collection
    .find(
      { year: { $exists: true, $ne: null, $ne: "not_provided" } },
      { projection: { timestamp: 1, score: 1, year: 1, _id: 0 } }
    )
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  console.log("\n======= SUBMISSIONS WITH YEAR DATA =======");
  console.log(`Found ${results.length} recent submissions with year data`);

  results.forEach((result, index) => {
    console.log(
      `\n[${index + 1}] Date: ${new Date(result.timestamp).toLocaleString()}`
    );
    console.log(`  Score: ${result.score}`);
    console.log(`  Year: ${result.year}`);
  });
}

async function showLivingData(collection) {
  const results = await collection
    .find(
      { living: { $exists: true, $ne: null, $ne: "not_provided" } },
      { projection: { timestamp: 1, score: 1, living: 1, _id: 0 } }
    )
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  console.log("\n======= SUBMISSIONS WITH LIVING SITUATION DATA =======");
  console.log(
    `Found ${results.length} recent submissions with living situation data`
  );

  results.forEach((result, index) => {
    console.log(
      `\n[${index + 1}] Date: ${new Date(result.timestamp).toLocaleString()}`
    );
    console.log(`  Score: ${result.score}`);
    console.log(`  Living Situation: ${result.living}`);
  });
}

// Run the script
checkDemographics().catch(console.error);
