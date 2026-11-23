import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopicEditor } from '../components/editor/TopicEditor';
import { saveTopic } from '../lib/topicsApi';
import { useAuth } from '../hooks/useAuth';

export default function NewTopicPage() {
  const [searchParams] = useSearchParams();
  const prefilledTitle = searchParams.get('title') || '';
  const navigate = useNavigate();
  const { isOwner, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return <div className="p-8 text-pencil text-sm font-sans">Checking session...</div>;
  }

  if (!isOwner) {
    return (
      <div className="p-8 font-sans">
        <h1 className="font-serif font-semibold text-xl text-ink mb-2">Access restricted</h1>
        <p className="text-pencil text-sm">Only the notebook owner can create or edit topics.</p>
      </div>
    );
  }

  const handleSave = async (topicData: any) => {
    setIsSaving(true);
    try {
      await saveTopic(topicData, true);
      navigate(`/t/${topicData.slug}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TopicEditor
      initialTitle={prefilledTitle}
      onSave={handleSave}
      onDiscard={() => navigate(-1)}
      isSaving={isSaving}
    />
  );
}
