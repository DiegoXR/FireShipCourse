import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { writable, type Readable } from "svelte/store";
import { doc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { derived } from "svelte/store";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBlE62RM6eeWwLtIxR7xp97N2akumvtQko",
    authDomain: "fireshipcourse-5c467.firebaseapp.com",
    projectId: "fireshipcourse-5c467",
    storageBucket: "fireshipcourse-5c467.appspot.com",
    messagingSenderId: "143495474829",
    appId: "1:143495474829:web:a8a3f5dc8ffaf970173cc4",
    measurementId: "G-KPV134Y499"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();


/* /**
 * @returns a store with the current firebase user
 */
/* function userStore() {
  let unsubscribe: () => void;

  if (!auth || !globalThis.window) {
    console.warn('Auth is not initialized or not in browser');
    const { subscribe } = writable<User | null>(null);
    return {
      subscribe,
    }
  }

  const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      set(user);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
  };
}

export const user = userStore(); */ 




// Define a function named userStore that returns a Svelte store
function userStore() {
  // Declare a variable to hold the unsubscribe function
  let unsubscribe: () => void;

  // Check if the Firebase auth object is available and if the code is running in a browser environment
  if (!auth || !globalThis.window) {
    console.warn('Auth is not initialized or not in the browser');
    
    // If not available or not in the browser, create a simple writable store with null initial value
    const { subscribe } = writable<User | null>(null);

    // Return the subscribe method of the writable store
    return {
      subscribe,
    };
  }

  // If auth and window are available, create a writable store with the current user or null as the initial value
  const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
    // Set up a listener using onAuthStateChanged to update the store value when the authentication state changes
    unsubscribe = onAuthStateChanged(auth, (user) => {
      set(user);
    });

    // Return a cleanup function that unsubscribes the listener when the store is no longer needed
    return () => unsubscribe();
  });

  // Return the subscribe method of the writable store
  return {
    subscribe,
  };
}

// Create an instance of the user store and export it
export const user = userStore();



/*  @param  {string} path document path or reference
 @returns a store with realtime updates on document data */

export function docStore<T>(path: string,) 
{

  let unsubscribe: () => void;

  const docRef = doc(db, path);

  const { subscribe } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      set((snapshot.data() as T) ?? null);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
    ref: docRef,
    id: docRef.id,
  }; 

}


/* export const userData= derived(user, ($user, set) => { 
  if ($user) {
    return docStore (`users/${$user.uid}`).subscribe(set);
  } else {
    set(null); 
  }
});  */


interface UserData {
  username: string;
  bio: string;
  photoURL: string;
  links: any[];
}

export const userData: Readable<UserData | null> = derived(user, ($user, set) => { 
  if ($user) {
    return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
  } else {
    set(null); 
  }
});  