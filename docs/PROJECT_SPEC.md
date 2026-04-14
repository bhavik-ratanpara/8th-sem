# Cooking Lab - Project Specification & Architecture

This document provides a detailed overview of the Cooking Lab platform, intended for technical reference and feature planning.

## 1. Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Icons:** Lucide React
- **Backend:** Firebase (Authentication & Firestore)
- **Generative AI:** Genkit + Google Gemini 2.0 Flash
- **Animations:** Lottie React (Chef animations) + CSS Keyframes

## 2. Authentication (Firebase Auth)
- **Providers:** Email/Password and Google OAuth.
- **Verification:** Mandatory email verification for Email/Password signups.
- **Flow:**
  - Users sign up/login.
  - Profiles are synchronized to the `/users/{uid}` Firestore collection upon first login.
  - Verification links redirect to `/auth/action`.

## 3. Firestore Database Structure
The database follows a "User-Centric" private storage model with a shared "Community" collection.

### Collection: `/users/{userId}`
- **User Profile:** Stores `displayName`, `email`, `profilePictureUrl`, and timestamps.
- **Sub-collection: `/users/{userId}/savedRecipes/{recipeId}`**
  - Private collection of recipes generated or saved by the user.
  - Fields: `recipeName`, `cuisine`, `servings`, `dietType`, `ingredients` (array), `steps` (array), `isFavourite`, `isPublic` (flag).

### Collection: `/publicRecipes/{recipeId}`
- **Shared Content:** Recipes published by users to the "Explore" section.
- **Fields:** Mirror the saved recipe but include `sharedBy` (UID), `sharedByName`, `likes` (count), and `likedBy` (array of UIDs).

## 4. Security Rules Logic
- **Private Data:** Only the owner (`request.auth.uid == userId`) can read or write to their `/users/{userId}` path.
- **Public Data:** 
  - Read: Open to everyone.
  - Create: Any authenticated user can share.
  - Update: Only allowed for the `likes` and `likedBy` fields (atomic increments/decrements).
  - Delete: Only the original sharer can remove from public view.

## 5. AI Architecture (Genkit)
The app uses server-side Genkit flows to interact with Gemini.

- **`createRecipeFlow`:** Generates full recipes from scratch or modifies existing ones based on "Make Changes" prompts.
- **`suggestDishesFlow`:** Interprets cravings/moods to suggest 4-5 dish names.
- **`regenerateInstructionsFlow`:** Rewrites steps if a user removes specific ingredients from a generated recipe.

## 6. Key Application Flows
1. **Recipe Generation:** User inputs preferences -> AI returns structured JSON -> UI renders interactive recipe card.
2. **Recipe Modification:** User provides text feedback -> AI receives current recipe context + new constraints -> AI returns updated structured JSON.
3. **Local Persistence:** The last generated recipe is cached in `localStorage` to prevent data loss on refresh.
4. **Search:** Integrated YouTube Data API v3 to find live tutorial videos for any dish name typed in the search bar.
5. **Community Interaction:** Users can "Like" public recipes and "Save" them to their private collection (cloning the document into their sub-collection).

## 7. UI/UX Principles
- **Responsive:** Mobile-first approach with a bottom-sheet filter menu for small screens.
- **Themes:** Full Light/Dark mode support using `next-themes` and HSL CSS variables.
- **Design:** Modern SaaS aesthetic using "Cal Sans" for headings and neutral grays with a primary blue accent.
