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
  dietType?: string;
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
  grocerySections?: GrocerySection[];
  createdAt?: any;
  updatedAt?: any;
}

export interface UnavailableItem {
  id?: string;
  itemName: string;
  addedOn?: any;
  boughtOn?: any;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  neededFor: string[];
  category: string;
}

export interface GrocerySection {
  days: string;
  daysLabel: string;
  items: GroceryItem[];
  generatedAt: number;
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
  newSection: GrocerySection,
  existingSections: GrocerySection[]
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'weeklyMealPlan', weekStartDate);

  const updatedSections = existingSections.filter(
    s => s.days !== newSection.days
  );
  updatedSections.push(newSection);

  await setDoc(docRef, {
    grocerySections: updatedSections,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteGrocerySection(
  userId: string,
  weekStartDate: string,
  days: string,
  existingSections: GrocerySection[]
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'weeklyMealPlan', weekStartDate);

  const updatedSections = existingSections.filter(
    s => s.days !== days
  );

  await setDoc(docRef, {
    grocerySections: updatedSections,
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

/**
 * Adds an item to the bought items list.
 */
export async function addBoughtItem(userId: string, item: UnavailableItem): Promise<string> {
  const colRef = collection(db, 'users', userId, 'boughtItems');
  const docRef = await addDoc(colRef, {
    itemName: item.itemName,
    boughtOn: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Retrieves all bought items for a user.
 */
export async function getBoughtItems(userId: string): Promise<UnavailableItem[]> {
  const colRef = collection(db, 'users', userId, 'boughtItems');
  const q = query(colRef, orderBy('boughtOn', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as UnavailableItem[];
}

/**
 * Clears all unavailable items for a user.
 */
export async function clearAllUnavailableItems(userId: string): Promise<void> {
  const colRef = collection(db, 'users', userId, 'unavailableItems');
  const snapshot = await getDocs(colRef);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

/**
 * Clears all bought items for a user.
 */
export async function clearAllBoughtItems(userId: string): Promise<void> {
  const colRef = collection(db, 'users', userId, 'boughtItems');
  const snapshot = await getDocs(colRef);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}
