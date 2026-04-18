// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGCy5piT9oNUVmrYl4DF3uJOQbUujf1Tc",
  authDomain: "beadwire-app.firebaseapp.com",
  projectId: "beadwire-app",
  storageBucket: "beadwire-app.firebasestorage.app",
  messagingSenderId: "653997402100",
  appId: "1:653997402100:web:4c9a7de89621d989c67ba1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// السطر التالي هو الأهم: يجب أن يبدأ بكلمة export
export const auth = getAuth(app);