// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCX9jrXU9EmS6pRu5U94MzhldbXYV3CqrM",
  authDomain: "sample-firebase-ai-app-5c1af.firebaseapp.com",
  projectId: "sample-firebase-ai-app-5c1af",
  storageBucket: "sample-firebase-ai-app-5c1af.firebasestorage.app",
  messagingSenderId: "1030956896329",
  appId: "1:1030956896329:web:3cc01ae68f8ab9fe5fef98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
