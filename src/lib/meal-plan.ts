'use client';

import { initializeFirebase } from '@/firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const { firestore: db } = initializeFirebase();

export interface MealSlot {
  dishName: string;
  servings?: number;
  cuisine?: string;
}

export interface DayPlan {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
}

export interface WeeklyMealPlan {
  id?: string;
  weekStartDate: string;
  monday?: DayPlan;
  tuesday?: DayPlan;
  wednesday?: DayPlan;
  thursday?: DayPlan;
  friday?: DayPlan;
  saturday?: DayPlan;
  sunday?: DayPlan;
  groceryList?: GroceryItem[];
  groceryDays?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UnavailableItem {
  id?: string;
  itemName: string;
  addedOn?: any;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  neededFor: string[];
  category: string;
}

/**
 * Saves or updates a weekly meal plan for a specific user and week.
 */
export async function saveMealPlan(userId: string, plan: WeeklyMealPlan): Promise<void> {
  const docRef = doc(db, 'users', userId, 'weeklyMealPlan', plan.weekStartDate);
  const docSnap = await getDoc(docRef);

  const data: any = {
    ...plan,
    updatedAt: serverTimestamp(),
  };

  if (!docSnap.exists()) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(docRef, data, { merge: true });
}

/**
 * Retrieves a meal plan for a specific week.
 */
export async function getMealPlan(userId: string, weekStartDate: string): Promise<WeeklyMealPlan | null> {
  const docRef = doc(db, 'users', userId, 'weeklyMealPlan', weekStartDate);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { ...docSnap.data(), id: docSnap.id } as WeeklyMealPlan;
}

export async function saveGroceryList(
  userId: string, 
  weekStartDate: string, 
  groceryList: GroceryItem[],
  groceryDays: string
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'weeklyMealPlan', weekStartDate);
  await setDoc(docRef, { 
    groceryList, 
    groceryDays,
    updatedAt: serverTimestamp() 
  }, { merge: true });
}

/**
 * Adds an item to the user's unavailable items list (Shopping List context).
 */
export async function addUnavailableItem(userId: string, itemName: string): Promise<string> {
  const colRef = collection(db, 'users', userId, 'unavailableItems');
  const docRef = await addDoc(colRef, {
    itemName,
    addedOn: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Retrieves all unavailable items for a user, ordered by date added.
 */
export async function getUnavailableItems(userId: string): Promise<UnavailableItem[]> {
  const colRef = collection(db, 'users', userId, 'unavailableItems');
  const q = query(colRef, orderBy('addedOn', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as UnavailableItem[];
}

/**
 * Removes an item from the unavailable items list.
 */
export async function removeUnavailableItem(userId: string, itemId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'unavailableItems', itemId);
  await deleteDoc(docRef);
}
