/**
 * Useful MongoDB queries for analyzing NYU Purity Test demographic data
 *
 * These queries can be run in MongoDB Compass GUI or mongosh CLI.
 * Simply copy and paste them as needed.
 */

// QUERY 1: Count submissions by school
const countBySchool = `
db.results.aggregate([
  { 
    $group: { 
      _id: { 
        school: { 
          $cond: [
            { $eq: ["$school", null] }, 
            "Legacy Entry (No Data)", 
            { $cond: [{ $eq: ["$school", "not_provided"] }, "Not Provided", "$school"] }
          ]
        } 
      }, 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { count: -1 } }
])
`;

// QUERY 2: Count submissions by gender
const countByGender = `
db.results.aggregate([
  { 
    $group: { 
      _id: { 
        gender: { 
          $cond: [
            { $eq: ["$gender", null] }, 
            "Legacy Entry (No Data)", 
            { $cond: [{ $eq: ["$gender", "not_provided"] }, "Not Provided", "$gender"] }
          ]
        } 
      }, 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { count: -1 } }
])
`;

// QUERY 3: Average score by school
const averageScoreBySchool = `
db.results.aggregate([
  { 
    $match: { 
      school: { $ne: null } 
    } 
  },
  { 
    $group: { 
      _id: "$school", 
      averageScore: { $avg: "$score" },
      count: { $sum: 1 }
    } 
  },
  { 
    $match: { 
      count: { $gt: 5 }  // Only show schools with at least 5 submissions
    } 
  },
  { $sort: { averageScore: 1 } }  // Sort from lowest (most wild) to highest (most pure)
])
`;

// QUERY 4: Find records with any demographic data
const findRecordsWithDemographicData = `
db.results.find({
  $or: [
    { gender: { $ne: null } },
    { school: { $ne: null } },
    { year: { $ne: null } },
    { living: { $ne: null } }
  ]
}, {
  score: 1,
  gender: 1,
  school: 1,
  year: 1,
  living: 1,
  timestamp: 1,
  _id: 0
}).sort({ timestamp: -1 }).limit(20)
`;

// QUERY 5: Find records where user explicitly chose not to provide data
const findRecordsWithOptOut = `
db.results.find({
  $or: [
    { gender: "not_provided" },
    { school: "not_provided" },
    { year: "not_provided" },
    { living: "not_provided" }
  ]
}, {
  score: 1,
  gender: 1,
  school: 1,
  year: 1,
  living: 1,
  timestamp: 1,
  _id: 0
}).sort({ timestamp: -1 })
`;

// QUERY 6: Compare average scores between demographic groups
const compareScoresByDemographic = `
db.results.aggregate([
  {
    $match: {
      gender: { $in: ["male", "female"] },  // Only compare male vs female for example
      score: { $exists: true }
    }
  },
  {
    $group: {
      _id: "$gender",
      averageScore: { $avg: "$score" },
      minScore: { $min: "$score" },
      maxScore: { $max: "$score" },
      count: { $sum: 1 }
    }
  },
  { $sort: { averageScore: 1 } }
])
`;

// Export these as strings to be used in documentation
module.exports = {
  countBySchool,
  countByGender,
  averageScoreBySchool,
  findRecordsWithDemographicData,
  findRecordsWithOptOut,
  compareScoresByDemographic,
};
