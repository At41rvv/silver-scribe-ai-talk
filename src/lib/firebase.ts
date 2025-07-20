import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBQYAfh41gK1ks2h-wE8pHgxa2FFSVIAaI",
  authDomain: "sonar-76527.firebaseapp.com",
  projectId: "sonar-76527",
  storageBucket: "sonar-76527.firebasestorage.app",
  messagingSenderId: "366260028966",
  appId: "1:366260028966:web:cad5672ae9b90fb5e048e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;