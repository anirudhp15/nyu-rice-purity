# NYU/NYC Purity Test

A web application inspired by the Rice Purity Test, but with NYU and NYC-specific questions. This application allows users to take the purity test, see their score, share their results, and view aggregated statistics.

## Features

- 100 NYU/NYC-specific purity test questions
- Results page with score interpretation and social sharing
- Comprehensive statistics visualization
- Mobile-responsive design
- Anonymous data collection

## Tech Stack

- **Frontend**: Next.js with TypeScript, React.js, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB
- **Analytics**: Google Analytics 4, Vercel Analytics
- **Sharing**: React-Share, QR code generation
- **Deployment**: Vercel (frontend), MongoDB Atlas (database)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB server or MongoDB Atlas account

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/nyu-purity-test.git
   cd nyu-purity-test
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following environment variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Set up the environment variables in Vercel's dashboard.
4. Deploy!

## Database Schema

The application uses three MongoDB collections:

- **Results**: Stores individual test results
- **AggregatedStats**: Stores pre-calculated aggregated statistics
- **TimeBasedStats**: Stores time-series statistics for trend analysis

## Analytics Implementation

The application tracks the following events:

- Test started
- Questions answered
- Test completed
- Results shared
- Statistics viewed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the Rice Purity Test
- Built with love for the NYU and NYC community
