import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

function requireFirebase() {
  if (!auth || !db) {
    const error = new Error('Firebase is not configured')
    error.code = 'app/not-configured'
    throw error
  }
}

export async function signIn(email, password, rememberMe) {
  requireFirebase()
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
  return signInWithEmailAndPassword(auth, email, password)
}

export async function registerUser(fullName, email, password) {
  requireFirebase()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: fullName })
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    fullName,
    email: credential.user.email,
    role: 'user',
    status: 'active',
    createdAt: serverTimestamp(),
  })
  return credential.user
}

export async function sendResetEmail(email) {
  requireFirebase()
  return sendPasswordResetEmail(auth, email)
}

export async function logOut() {
  requireFirebase()
  return signOut(auth)
}

export function getAuthErrorMessage(error) {
  const messages = {
    'app/not-configured': 'Firebase is not configured. Add your project values to the local .env file.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/user-not-found': 'User account not found.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/email-already-in-use': 'An account already exists for this email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many login attempts. Please wait and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  }
  return messages[error?.code] || 'Unable to complete the request. Please try again.'
}
