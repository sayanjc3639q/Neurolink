import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user, signInWithGoogle, isOwner } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md py-12 font-sans">
      <h1 className="font-serif font-semibold text-3xl text-ink tracking-tight mb-2">
        Sign in
      </h1>
      <p className="text-pencil text-sm mb-6 leading-relaxed">
        Neurolink is publicly readable. Sign-in is reserved for the owner to create and edit study notes.
      </p>

      {user ? (
        <div className="space-y-4">
          <div className="p-3 bg-margin border border-rule text-xs text-pencil">
            Signed in as <strong className="text-ink">{user.email}</strong>.
            <div className="mt-1">
              Owner status: {isOwner ? 'Authorized (Owner)' : 'Visitor (Read-only)'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-ink text-paper text-sm px-4 py-2 hover:opacity-90 block"
          >
            Go to notes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="text-xs text-redline p-2 border border-redline bg-margin">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-ink text-paper text-sm font-medium py-2.5 px-4 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>
      )}
    </div>
  );
}
