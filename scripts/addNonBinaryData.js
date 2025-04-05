const { MongoClient } = require("mongodb");
require("dotenv").config();

// MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

// Random data generation helper functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomScore() {
  // Generate scores between 50 and 100
  return getRandomInt(50, 100);
}

function generateRandomAnswers() {
  // Create an array of 100 boolean values
  // Make earlier questions (roughly first 50) more likely to be true
  const answers = [];

  for (let i = 0; i < 100; i++) {
    if (i < 50) {
      // First 50 questions: 70% chance of being true
      answers.push(Math.random() < 0.7);
    } else {
      // Last 50 questions: 30% chance of being true
      answers.push(Math.random() < 0.3);
    }
  }

  return answers;
}

function getRandomDate(startDate = new Date(2024, 0, 1)) {
  const now = new Date();
  return new Date(
    startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime())
  );
}

// Generate a single non-binary student record
function generateNonBinaryStudentRecord() {
  // Possible demographic values with standardized casing
  const schools = [
    "cas", // lowercase to match existing format
    "tisch",
    "stern",
    "tandon",
    "gallatin",
    "sps",
    "steinhardt",
    "wagner",
    "silver",
    "law",
  ];
  const years = [
    "freshman", // lowercase to match existing format
    "sophomore",
    "junior",
    "senior",
    "graduate",
    "alumni",
  ];
  const livingSituations = [
    "dorm", // simplified and lowercase to match existing format
    "offcampus",
    "commuter",
    "family",
    "other",
  ];
  const races = [
    "asian", // lowercase to match existing format
    "black",
    "white",
    "hispanic",
    "multiracial",
    "native",
  ];
  const relationshipStatuses = [
    "single", // lowercase to match existing format
    "relationship",
    "complicated",
    "situationship",
    "talking",
  ];
  const deviceTypes = ["mobile", "desktop", "tablet"];
  const referrers = ["direct", "social", "friend", "link"];

  // Generate answers and calculate score
  const answers = generateRandomAnswers();
  const score = getRandomScore();

  // Create the record
  return {
    score,
    answers,
    timestamp: getRandomDate(),
    deviceType: deviceTypes[getRandomInt(0, deviceTypes.length - 1)],
    referrer: referrers[getRandomInt(0, referrers.length - 1)],
    gender: "non-binary", // lowercase to match existing format
    school: schools[getRandomInt(0, schools.length - 1)],
    year: years[getRandomInt(0, years.length - 1)],
    living: livingSituations[getRandomInt(0, livingSituations.length - 1)],
    race: races[getRandomInt(0, races.length - 1)],
    relationship:
      relationshipStatuses[getRandomInt(0, relationshipStatuses.length - 1)],
  };
}

// Main function to add records to the database
async function addNonBinaryData(count = 50) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    const database = client.db();
    const collection = database.collection("results");

    // Generate and insert the records
    const records = [];
    for (let i = 0; i < count; i++) {
      records.push(generateNonBinaryStudentRecord());
    }

    // Log the first record for verification (without showing all answers)
    const sampleRecord = { ...records[0] };
    sampleRecord.answers = `[Array of ${sampleRecord.answers.length} booleans]`;
    console.log("Sample record:", JSON.stringify(sampleRecord, null, 2));

    // Insert all records
    const result = await collection.insertMany(records);
    console.log(
      `Successfully added ${result.insertedCount} non-binary student records`
    );

    // Verify the total count of non-binary records
    const nonBinaryCount = await collection.countDocuments({
      gender: "Non-binary",
    });
    console.log(`Total non-binary records in database: ${nonBinaryCount}`);

    return result.insertedCount;
  } catch (error) {
    console.error("Error occurred adding non-binary data:", error);
    return 0;
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// If the script is run directly (node addNonBinaryData.js)
if (require.main === module) {
  addNonBinaryData(50)
    .then((count) => {
      console.log(`Script completed. Added ${count} records.`);
    })
    .catch((err) => {
      console.error("Script failed:", err);
    });
}

// Export the function for use in other scripts
module.exports = { addNonBinaryData };
