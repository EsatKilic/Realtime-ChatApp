import { initializeApp } from "firebase/app";

import {getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA37UV9LBClCZsdq1ITP8hoLdW35RwMLfs",
  authDomain: "mek-chat-app.firebaseapp.com",
  projectId: "mek-chat-app",
  storageBucket: "mek-chat-app.appspot.com",
  messagingSenderId: "832983733652",
  appId: "1:832983733652:web:5422e69514d6cb594a2b81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app,{
    persistence : getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app); 
export const usersRef = collection(db,'users');
export const roomRef = collection(db,'rooms');