// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4no8cgz8IVqew3R0gsKVNWZEnIRxaU3k",
  authDomain: "shopskywalkphangao.firebaseapp.com",
  databaseURL: "https://shopskywalkphangao-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopskywalkphangao",
  storageBucket: "shopskywalkphangao.firebasestorage.app",
  messagingSenderId: "498923620518",
  appId: "1:498923620518:web:1b58ca326e9f70e8254c67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = firebase.database(app);