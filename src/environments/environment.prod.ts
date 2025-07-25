// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNdRrewWf7mqCd0QlTVcCHdrgwiozLLtI",
  authDomain: "chat-app-5087b.firebaseapp.com",
  projectId: "chat-app-5087b",
  storageBucket: "chat-app-5087b.firebasestorage.app",
  messagingSenderId: "928327921374",
  appId: "1:928327921374:web:6a32d84807ca447a745c4f",
  measurementId: "G-FC04XRT0PX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);