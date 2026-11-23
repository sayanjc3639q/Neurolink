import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NotFound() {
  const { isOwner } = useAuth();

  return (
    <div className="py-16 font-sans">
      <h1 className="font-serif font-semibold text-4xl text-ink mb-3">404</h1>
      <p className="text-pencil text-base mb-6">
        The page you are looking for does not exist in this notebook.
      </p>
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-sm text-biro underline underline-offset-2">
          Return to home
        </Link>
        {isOwner && (
          <Link
            to="/new"
            className="bg-ink text-paper text-sm px-3 py-1.5 hover:opacity-90"
          >
            Create new topic
          </Link>
        )}
      </div>
    </div>
  );
}
