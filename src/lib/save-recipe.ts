'use client';

import { initializeFirebase } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  setDoc,
  getDoc
} from 'firebase/firestore';

const { firestore: db } = initializeFirebase();

export interface SavedRecipe {
  id?: string;
  recipeName: string;
  cuisine: string;
  servings: number;
  dietType: string;
  language: string;
  ingredients: string[];
  steps: string[];
  generatedAt?: any;
  isFavourite: boolean;
  isPublic?: boolean;
  sharedBy?: string;
  sharedByName?: string;
  sharedAt?: any;
  savedFromExplore?: boolean;
  originalSharedBy?: string;
  originalSharedByName?: string;
  originalRecipeId?: string;
  likes?: number;
  likedBy?: string[];
}

// Save a recipe to Firestore
export async function saveRecipe(
  userId: string,
  recipe: SavedRecipe
): Promise<string> {
  const ref = collection(db, 'users', userId, 'savedRecipes');
  const docRef = await addDoc(ref, {
    ...recipe,
    generatedAt: serverTimestamp(),
    isFavourite: false,
    isPublic: false,
  });
  return docRef.id;
}

// Get all saved recipes for a user
export async function getSavedRecipes(
  userId: string
): Promise<SavedRecipe[]> {
  const ref = collection(db, 'users', userId, 'savedRecipes');
  const q = query(ref, orderBy('generatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as SavedRecipe[];
}

// Delete a recipe
export async function deleteRecipe(
  userId: string,
  recipeId: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'savedRecipes', recipeId);
  await deleteDoc(ref);
}

// Toggle favourite
export async function toggleFavourite(
  userId: string,
  recipeId: string,
  current: boolean
): Promise<void> {
  const ref = doc(db, 'users', userId, 'savedRecipes', recipeId);
  await updateDoc(ref, { isFavourite: !current });
}

// Share recipe to public
export async function shareRecipePublic(
  userId: string,
  userName: string,
  recipeId: string,
  recipe: SavedRecipe
): Promise<void> {
  const publicRef = doc(db, 'publicRecipes', recipeId);
  
  await setDoc(publicRef, {
    recipeName: recipe.recipeName,
    cuisine: recipe.cuisine,
    servings: recipe.servings,
    dietType: recipe.dietType,
    language: recipe.language,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    id: recipeId,
    sharedBy: userId,
    sharedByName: userName || 'Anonymous Chef',
    sharedAt: serverTimestamp(),
    originalRecipeId: recipeId,
    likes: 0,
    likedBy: [],
  });

  const userRecipeRef = doc(db, 'users', userId, 'savedRecipes', recipeId);
  await updateDoc(userRecipeRef, { isPublic: true });
}

// Remove recipe from public
export async function unshareRecipePublic(
  userId: string,
  recipeId: string
): Promise<void> {
  const publicRef = doc(db, 'publicRecipes', recipeId);
  await deleteDoc(publicRef);

  const userRecipeRef = doc(db, 'users', userId, 'savedRecipes', recipeId);
  await updateDoc(userRecipeRef, { isPublic: false });
}

// Get all public recipes
export async function getPublicRecipes(): Promise<SavedRecipe[]> {
  const ref = collection(db, 'publicRecipes');
  const q = query(
    ref,
    orderBy('sharedAt', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as SavedRecipe[];
}

// Save recipe from Explore to cookbook
export async function saveFromExplore(
  userId: string,
  userName: string,
  recipe: SavedRecipe
): Promise<string> {
  const ref = collection(db, 'users', userId, 'savedRecipes');
  const docRef = await addDoc(ref, {
    recipeName: recipe.recipeName,
    cuisine: recipe.cuisine,
    servings: recipe.servings,
    dietType: recipe.dietType,
    language: recipe.language,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    generatedAt: serverTimestamp(),
    isFavourite: false,
    isPublic: false,
    savedFromExplore: true,
    originalSharedBy: recipe.sharedBy,
    originalSharedByName: recipe.sharedByName,
    originalRecipeId: recipe.id,
  });
  return docRef.id;
}

// Toggle like on a public recipe
export async function toggleRecipeLike(
  recipeId: string,
  userId: string
): Promise<void> {
  const ref = doc(db, 'publicRecipes', recipeId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) return;
  
  const data = snap.data();
  const likedBy: string[] = data.likedBy || [];
  const alreadyLiked = likedBy.includes(userId);
  
  if (alreadyLiked) {
    // Unlike
    await updateDoc(ref, {
      likes: Math.max(0, (data.likes || 0) - 1),
      likedBy: likedBy.filter(id => id !== userId)
    });
  } else {
    // Like
    await updateDoc(ref, {
      likes: (data.likes || 0) + 1,
      likedBy: [...likedBy, userId]
    });
  }
}

// Check if user liked a recipe
export function isRecipeLikedByUser(
  recipe: any,
  userId: string
): boolean {
  const likedBy: string[] = recipe.likedBy || [];
  return likedBy.includes(userId);
}
