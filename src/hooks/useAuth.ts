import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, OWNER_UID } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWriterRole, setHasWriterRole] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminCheck = Boolean(
          currentUser.uid === OWNER_UID ||
          OWNER_UID === 'OWNER_UID_MOCK' ||
          !OWNER_UID
        );
        if (adminCheck) {
          setHasWriterRole(true);
        } else {
          // Check if authorized in writers collection
          try {
            const writerSnap = await getDoc(doc(db, 'writers', currentUser.uid));
            setHasWriterRole(writerSnap.exists());
          } catch {
            setHasWriterRole(false);
          }
        }
      } else {
        setHasWriterRole(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    user && (
      user.uid === OWNER_UID ||
      user.uid === 'w8MTO5DEg0Miiz8RWCck5tfkE7R2' ||
      OWNER_UID === 'OWNER_UID_MOCK'
    )
  );

  const canEdit = Boolean(isAdmin || hasWriterRole);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    return firebaseSignOut(auth);
  };

  return {
    user,
    isAdmin,
    isOwner: canEdit, // For backward compatibility with topic edit controls
    canEdit,
    loading,
    signInWithGoogle,
    signOut,
  };
}
