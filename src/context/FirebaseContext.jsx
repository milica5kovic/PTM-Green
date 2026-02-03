import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  writeBatch,
  query,
  where,
  updateDoc 
} from 'firebase/firestore';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyBi_4NxMjjE2D-gvo_quXLUt4MNTrjG644",
      authDomain: "parent-teacher-meeting-927c9.firebaseapp.com",
      projectId: "parent-teacher-meeting-927c9",
      storageBucket: "parent-teacher-meeting-927c9.firebasestorage.app",
      messagingSenderId: "620244891442",
      appId: "1:620244891442:web:a11512ff98978950ba092b"
    };

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    setDb(firestore);
    setInitialized(true);
  }, []);

  const value = {
    db,
    initialized,
    // Firestore helpers
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    writeBatch,
    query,
    where,
    updateDoc,
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading PTM Booking System...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
