require("dotenv").config();
const mongoose = require("mongoose");

// Define Result Schema
const resultSchema = new mongoose.Schema({
  score: Number,
});

const Result = mongoose.model("Result", resultSchema);

async function findZeroScores() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all results with score less than 10 and no gender, school, year, living, race, relationship data
    const results = await Result.find({
      score: { $lt: 10 },
      //   gender: { $exists: false },
      //   school: { $exists: false },
      //   year: { $exists: false },
      //   living: { $exists: false },
    });

    console.log(
      "\nResults with score less than 10 and no gender, school, year, living, race, relationship data:"
    );
    results.forEach((result) => {
      console.log(result._id.toString());
    });
    console.log(`\nTotal count: ${results.length}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

findZeroScores();
