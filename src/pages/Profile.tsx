import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getUserPublications,
  getAllWriters,
  grantWriterAccess,
  revokeWriterAccess,
} from '../lib/topicsApi';
import { Topic, WriterRecord } from '../lib/types';

export default function Profile() {
  const { user, isAdmin, canEdit, signOut, loading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Topic[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(true);

  // Admin panel state
  const [writers, setWriters] = useState<WriterRecord[]>([]);
  const [loadingWriters, setLoadingWriters] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoadingPubs(true);
      getUserPublications(user.uid, user.email)
        .then((data) => setPublications(data))
        .catch((err) => console.warn('Could not load publications:', err))
        .finally(() => setLoadingPubs(false));
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      setLoadingWriters(true);
      getAllWriters()
        .then((list) => setWriters(list))
        .catch((err) => console.warn('Could not load writers:', err))
        .finally(() => setLoadingWriters(false));
    }
  }, [isAdmin]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUid.trim() || !newEmail.trim()) {
      setActionError('Both User UID and Email are required.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    try {
      await grantWriterAccess(newUid.trim(), newEmail.trim(), user?.uid || 'admin');
      setWriters((prev) => [
        ...prev.filter((w) => w.uid !== newUid.trim()),
        {
          uid: newUid.trim(),
          email: newEmail.trim(),
          addedAt: Date.now(),
          addedBy: user?.uid || 'admin',
        },
      ]);
      setNewUid('');
      setNewEmail('');
      setActionSuccess(`Writer access granted to ${newEmail.trim()}`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to grant writer access.');
    }
  };

  const handleRevokeAccess = async (uidToRevoke: string, emailToRevoke: string) => {
    if (!window.confirm(`Revoke writer access for ${emailToRevoke}?`)) return;
    try {
      await revokeWriterAccess(uidToRevoke);
      setWriters((prev) => prev.filter((w) => w.uid !== uidToRevoke));
      setActionSuccess(`Revoked writer access for ${emailToRevoke}`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to revoke writer access.');
    }
  };

  if (authLoading) {
    return <div className="p-8 text-pencil text-sm font-sans">Checking session...</div>;
  }

  if (!user) {
    return (
      <div className="py-12 font-sans space-y-4">
        <h1 className="font-serif font-semibold text-3xl text-ink tracking-tight">Profile</h1>
        <p className="text-pencil text-sm">You are currently browsing as a visitor (not signed in).</p>
        <Link
          to="/login"
          className="inline-block bg-ink text-paper text-sm font-medium px-4 py-2 hover:opacity-90"
        >
          Sign in with Google
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-sans">
      {/* Account Info */}
      <section className="border-b border-rule pb-6">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="font-serif font-semibold text-3xl text-ink tracking-tight">Account</h1>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs text-pencil hover:text-ink underline"
          >
            Sign out
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-pencil">Logged in as:</span>
            <span className="text-ink font-medium">{user.email}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-pencil">User UID:</span>
            <code className="text-xs font-mono bg-margin px-1.5 py-0.5 border border-rule text-ink">
              {user.uid}
            </code>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-pencil">Access role:</span>
            {isAdmin ? (
              <span className="text-xs font-semibold px-2 py-0.5 bg-marker text-marker-text border border-rule">
                Owner &amp; Administrator
              </span>
            ) : canEdit ? (
              <span className="text-xs font-semibold px-2 py-0.5 bg-margin text-biro border border-rule">
                Authorized Writer
              </span>
            ) : (
              <span className="text-xs text-pencil px-2 py-0.5 bg-margin border border-rule">
                Reader (Public)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Publications Count & List */}
      <section className="border-b border-rule pb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif font-semibold text-2xl text-ink">
            My Publications ({publications.length})
          </h2>
          {canEdit && (
            <Link to="/new" className="text-xs text-biro hover:underline">
              + Create new topic
            </Link>
          )}
        </div>

        {loadingPubs ? (
          <div className="space-y-3">
            <div className="h-5 bg-margin rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-margin rounded w-1/2 animate-pulse"></div>
          </div>
        ) : publications.length === 0 ? (
          <p className="text-pencil text-sm italic">
            You haven&apos;t created any topics yet. Once you publish topics, they will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {publications.map((topic) => (
              <div key={topic.slug} className="flex items-baseline justify-between group">
                <div>
                  <Link
                    to={`/t/${topic.slug}`}
                    className="font-serif font-semibold text-base text-ink hover:text-biro transition-colors"
                  >
                    {topic.title}
                  </Link>
                  {topic.summary && (
                    <p className="text-xs text-pencil font-serif italic line-clamp-1">
                      {topic.summary}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <Link
                    to={`/t/${topic.slug}/edit`}
                    className="text-xs text-pencil group-hover:text-ink underline ml-4 shrink-0"
                  >
                    Edit
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Admin Panel (Visible ONLY to Owner/Admin) */}
      {isAdmin && (
        <section className="space-y-6">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif font-semibold text-2xl text-ink">Admin Panel</h2>
            <p className="text-xs text-pencil mt-1">
              Manage writer permissions. Users granted writer access can create, edit, and publish study notes.
            </p>
          </div>

          {actionError && (
            <div className="p-3 bg-margin border border-redline text-xs text-redline font-sans">
              {actionError}
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 bg-margin border border-rule text-xs text-ink font-sans">
              {actionSuccess}
            </div>
          )}

          {/* Form to Grant Writer Access */}
          <form onSubmit={handleGrantAccess} className="bg-margin p-4 border border-rule space-y-3">
            <div className="text-xs font-semibold text-ink uppercase tracking-wider">
              Grant Writer Access
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-pencil mb-1">User UID</label>
                <input
                  type="text"
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="e.g. 7qXfO6..."
                  className="w-full text-xs font-mono p-2 bg-paper border border-rule text-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-pencil mb-1">User Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="writer@example.com"
                  className="w-full text-xs p-2 bg-paper border border-rule text-ink focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-1 text-right">
              <button
                type="submit"
                className="bg-ink text-paper text-xs font-medium px-4 py-1.5 hover:opacity-90 transition-opacity"
              >
                Add writer
              </button>
            </div>
          </form>

          {/* Current Writers List */}
          <div>
            <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Authorized Writers ({writers.length})
            </div>
            {loadingWriters ? (
              <div className="text-xs text-pencil animate-pulse">Loading writers list...</div>
            ) : writers.length === 0 ? (
              <p className="text-xs text-pencil italic">
                No external writers authorized yet. Add a user&apos;s UID above to give them writer permissions.
              </p>
            ) : (
              <div className="divide-y divide-rule border border-rule bg-paper">
                {writers.map((writer) => (
                  <div
                    key={writer.uid}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-ink">{writer.email}</span>
                      <div className="text-[11px] text-pencil font-mono mt-0.5">
                        UID: {writer.uid}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeAccess(writer.uid, writer.email)}
                      className="text-xs text-redline hover:underline ml-4"
                    >
                      Revoke access
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
