# Feedback System for NYU Purity Test

This document provides information about the feedback system implemented in the NYU Purity Test application.

## Overview

The feedback system is designed to collect user feedback and store it in a MongoDB database for later analysis. The system:

1. Collects user feedback and optional email
2. Associates the feedback with demographic information when available
3. Stores all data in a structured MongoDB collection
4. Provides a seamless user experience with a simple form and success message

## How It Works

1. The client-side feedback form collects user input
2. It saves the feedback data to MongoDB via an API route (`/api/save-feedback`)
3. All user demographic information is included in the database for comprehensive analysis
4. Upon successful submission, the user sees a confirmation message

## MongoDB Feedback Collection

All feedback is stored in a dedicated "Feedback" collection in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,                // Unique identifier
  resultId: ObjectId,           // Reference to the original Result document
  feedback: String,             // User's feedback text
  email: String,                // User's email (if provided)
  score: Number,                // User's test score
  demographics: {               // Demographic information
    gender: String,
    school: String,
    year: String,
    living: String
  },
  deviceType: String,           // User's device type
  createdAt: Date,              // Timestamp when feedback was submitted
  updatedAt: Date               // Timestamp of last update
}
```

This structure allows for comprehensive analysis of feedback patterns in relation to demographic data and test scores.

## Accessing and Analyzing Feedback Data

### Connecting to MongoDB

To access the feedback data for analysis, you can connect to your MongoDB database using the MongoDB Compass GUI or a script.

Using MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your MongoDB deployment using the connection string
3. Navigate to your database and open the "Feedback" collection

### Example Queries for Data Analysis

Here are some useful MongoDB queries to analyze your feedback data:

1. **Find all feedback with specific demographics:**

```javascript
db.Feedback.find({
  "demographics.gender": "Male",
  "demographics.school": "CAS",
});
```

2. **Find feedback by score range:**

```javascript
db.Feedback.find({
  score: { $gte: 50, $lte: 70 },
});
```

3. **Aggregate average scores by demographic:**

```javascript
db.Feedback.aggregate([
  { $match: { "demographics.gender": { $exists: true } } },
  {
    $group: {
      _id: "$demographics.gender",
      averageScore: { $avg: "$score" },
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1 } },
]);
```

4. **Join feedback with the original test results:**

```javascript
db.Feedback.aggregate([
  {
    $lookup: {
      from: "results",
      localField: "resultId",
      foreignField: "_id",
      as: "fullResult",
    },
  },
  { $unwind: "$fullResult" },
  {
    $project: {
      feedback: 1,
      score: 1,
      email: 1,
      demographics: 1,
      "fullResult.answers": 1,
      "fullResult.timestamp": 1,
    },
  },
]);
```

5. **Export data for external analysis:**

You can export the feedback data to CSV or JSON using MongoDB Compass:

1. Run your query in MongoDB Compass
2. Click "Export" in the query results
3. Choose your preferred format (CSV or JSON)
4. Import the exported file into your preferred analysis tool (Excel, R, Python, etc.)

## Security Considerations

- All demographic data is securely stored in your MongoDB database
- Consider implementing rate limiting on your API route if spam becomes an issue
- Ensure your MongoDB connection is secure and properly authenticated to protect user data
- Regularly back up your feedback data to prevent loss

That's it! Your feedback system is now set up to collect and store user feedback in MongoDB for analysis.
