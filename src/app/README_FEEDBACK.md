# Setting up the Feedback Form with EmailJS

This document provides instructions for setting up the feedback form with EmailJS so that user feedback is delivered directly to your email inbox.

## Overview

The feedback form uses a server-side API route to send emails via EmailJS. This approach avoids Content Security Policy (CSP) issues that can occur when calling EmailJS directly from the client.

In addition, all feedback is now stored in a MongoDB "Feedback" collection with detailed user information for better analysis.

## How It Works

1. The client-side feedback form collects user input
2. It sends this data to a Next.js API route (`/api/send-feedback`)
3. The API route:
   - Stores the feedback in MongoDB with user details
   - Makes the request to EmailJS using your credentials
4. The API route returns success/error to the client

## Step 1: Install the EmailJS Package (Optional)

The server-side implementation doesn't require the EmailJS client library, but you may install it if you want:

```bash
npm install @emailjs/browser
```

## Step 2: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account
2. The free tier includes 200 emails per month, which should be sufficient for most needs

## Step 3: Create an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps to connect your email account

## Step 4: Create an Email Template

1. In your EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Name your template (e.g., "NYU Purity Test Feedback")
4. Design your email template using the following variables:
   - `{{user_email}}` - The email address provided by the user (optional)
   - `{{user_feedback}}` - The feedback text
   - `{{user_score}}` - The user's score on the test
   - `{{user_id}}` - The MongoDB ObjectId of the result (if available)
   - `{{user_gender}}` - User's gender (if provided)
   - `{{user_school}}` - User's school (if provided)
   - `{{user_year}}` - User's class year (if provided)
   - `{{user_living}}` - User's living situation (if provided)
   - `{{date}}` - The date and time the feedback was submitted

Example template:

```html
<h2>New Feedback from NYU Purity Test</h2>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>User ID:</strong> {{user_id}}</p>
<p><strong>User Score:</strong> {{user_score}}</p>
<p><strong>User Email:</strong> {{user_email}}</p>

<h3>User Demographics:</h3>
<ul>
  <li><strong>Gender:</strong> {{user_gender}}</li>
  <li><strong>School:</strong> {{user_school}}</li>
  <li><strong>Year:</strong> {{user_year}}</li>
  <li><strong>Living:</strong> {{user_living}}</li>
</ul>

<h3>Feedback:</h3>
<p>{{user_feedback}}</p>
```

## Step 5: Get Your API Keys

1. In your EmailJS dashboard, go to "Account" > "API Keys"
2. Note down your "Public Key" (called "user_id" in our API route)
3. Also note your "Service ID" (from the Email Services tab)
4. And your "Template ID" (from the Email Templates tab)

## Step 6: Update the API Route

Open `src/app/api/send-feedback/route.ts` and update the credentials:

```javascript
const payload = {
  service_id: "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
  template_id: "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
  user_id: "YOUR_PUBLIC_KEY", // Replace with your EmailJS public key
  template_params: templateParams,
};
```

## MongoDB Feedback Collection

All feedback is now automatically stored in a dedicated "Feedback" collection in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,
  resultId: ObjectId, // Reference to the original Result document
  feedback: String,   // User's feedback text
  email: String,      // User's email (if provided)
  score: Number,      // User's test score
  demographics: {     // Demographic information
    gender: String,
    school: String,
    year: String,
    living: String
  },
  deviceType: String, // User's device type
  createdAt: Date,    // Timestamp when feedback was submitted
  updatedAt: Date     // Timestamp of last update
}
```

You can query this collection to analyze feedback patterns in relation to demographic data and test scores.

## Accessing and Analyzing Feedback Data

### Connecting to MongoDB

To access the feedback data for analysis, you can connect to your MongoDB database using the MongoDB Compass GUI or a script.

Using MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your MongoDB deployment
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

- The EmailJS keys are now stored server-side, which is more secure than exposing them in the client code
- The server-side approach avoids Content Security Policy (CSP) issues
- Consider implementing rate limiting on your API route if spam becomes an issue
- The free tier of EmailJS is limited to 200 emails per month. If you expect more feedback, consider upgrading.
- Ensure your MongoDB connection is secure and properly authenticated to protect user data

That's it! Your feedback form should now be fully functional and will send all user feedback directly to your email inbox while avoiding CSP issues. Additionally, all feedback data is stored in MongoDB for later analysis.
