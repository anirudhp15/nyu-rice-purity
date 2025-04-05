const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

// Mapping of values to their standardized form
const standardizations = {
  gender: {
    "Non-binary": "non-binary",
    "non-binary": "non-binary",
    Male: "male",
    Female: "female",
  },
  school: {
    CAS: "cas",
    Tisch: "tisch",
    TISCH: "tisch",
    Stern: "stern",
    STERN: "stern",
    Tandon: "tandon",
    TANDON: "tandon",
    Gallatin: "gallatin",
    SPS: "sps",
    Steinhardt: "steinhardt",
    STEINHARDT: "steinhardt",
    Wagner: "wagner",
    Silver: "silver",
    Law: "law",
    LAW: "law",
  },
  year: {
    Freshman: "freshman",
    Sophomore: "sophomore",
    Junior: "junior",
    Senior: "senior",
    "Grad Student": "graduate",
    "Graduate Student": "graduate",
    Alumni: "alumni",
  },
  living: {
    "On-campus dorm": "dorm",
    "Off-campus apartment": "offcampus",
    "With roommates": "offcampus",
    Commuter: "commuter",
    "With family": "family",
  },
  race: {
    Asian: "asian",
    White: "white",
    Black: "black",
    "Black or African American": "black",
    Hispanic: "hispanic",
    "Hispanic or Latino": "hispanic",
    "Middle Eastern": "other",
    "Native American": "native",
    "Pacific Islander": "other",
    Multiracial: "multiracial",
  },
  relationship: {
    Single: "single",
    "In a relationship": "relationship",
    Married: "married",
    "It's complicated": "complicated",
    Casual: "casual",
    Engaged: "engaged",
    Situationship: "situationship",
    Talking: "talking",
  },
};

async function standardizeDemographics() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    const database = client.db();
    const collection = database.collection("results");

    // Update each demographic field
    for (const [field, mappings] of Object.entries(standardizations)) {
      for (const [original, standardized] of Object.entries(mappings)) {
        const query = {};
        query[field] = original;

        const update = {
          $set: {},
        };
        update.$set[field] = standardized;

        const result = await collection.updateMany(query, update);
        if (result.modifiedCount > 0) {
          console.log(
            `Updated ${result.modifiedCount} records: ${field} "${original}" → "${standardized}"`
          );
        }
      }
    }

    // Log the current unique values for each field after standardization
    for (const field of Object.keys(standardizations)) {
      const uniqueValues = await collection.distinct(field);
      console.log(
        `\nUnique ${field} values after standardization:`,
        uniqueValues
      );
    }
  } catch (error) {
    console.error("Error standardizing demographics:", error);
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the script
standardizeDemographics()
  .then(() => console.log("Standardization complete"))
  .catch(console.error);
