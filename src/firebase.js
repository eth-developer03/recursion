import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,  // ✅ Add this import
  createUserWithEmailAndPassword 
} from "firebase/auth";

// 🔥 Firebase Config (Replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyA8ySy6oQPa9uHeTYv8dF3uJPQKFyzsT2w",
  authDomain: "recursion-73d9c.firebaseapp.com",
  projectId: "recursion-73d9c",
  storageBucket: "recursion-73d9c.appspot.com",
  messagingSenderId: "278926409543",
  appId: "1:278926409543:web:26f20819c7f9b1a7ca5662"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Google Sign-In Function
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    throw error;
  }
};

// ✅ Email & Password Sign-In Function
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Email Sign-in Error:", error);
    throw error;
  }
};

// ✅ Email & Password Sign-Up Function
const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }
};

// ✅ Logout Function
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// ✅ Export Everything
export { auth, signInWithGoogle, loginWithEmail, signUpWithEmail, logout };
