# Cooking Lab

Your personal AI chef. Create any recipe, for any number of people, from anywhere in the world.

## Firebase Setup

This app uses Firebase for Authentication and Firestore.

### 1. Enable Authentication Providers
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Authentication** > **Sign-in method**.
4. Enable **Email/Password** and **Google**.
5. For Google, set a support email and click save.

### 2. Security Rules
The security rules are automatically managed, but ensure you have initialized Firestore in your project.

## YouTube Search Setup

This app uses the YouTube Data API v3 to find recipe videos.

### Local Development
1. Create a `.env` file in the root directory.
2. Add your API key: `YOUTUBE_API_KEY=your_actual_key_here`

### Vercel Deployment
To make search work on Vercel:
1. Go to your Project Settings in the Vercel Dashboard.
2. Navigate to **Environment Variables**.
3. Add a new variable:
   - **Key**: `YOUTUBE_API_KEY`
   - **Value**: [Your Google Cloud API Key]
4. Redeploy your application.

## API Details
- **Endpoint**: `https://www.googleapis.com/youtube/v3/search`
- **Required Scopes**: None (Public Data API)
