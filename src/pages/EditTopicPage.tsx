import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTopic } from '../hooks/useTopic';
import { TopicEditor } from '../components/editor/TopicEditor';
import { saveTopic, deleteTopic } from '../lib/topicsApi';
import { useAuth } from '../hooks/useAuth';

export default function EditTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isOwner, loading: authLoading } = useAuth();
  const { data: topic, isLoading: topicLoading } = useTopic(slug);
  const [isSaving, setIsSaving] = useState(false);

  if (authLoading || topicLoading) {
    return <div className="p-8 text-pencil text-sm font-sans">Loading topic...</div>;
  }

  if (!isOwner) {
    return (
      <div className="p-8 font-sans">
        <h1 className="font-serif font-semibold text-xl text-ink mb-2">Access restricted</h1>
        <p className="text-pencil text-sm">Only the notebook owner can edit topics.</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-8 font-sans">
        <h1 className="font-serif font-semibold text-xl text-ink mb-2">Topic not found</h1>
        <p className="text-pencil text-sm">Could not find topic for editing.</p>
      </div>
    );
  }

  const handleSave = async (topicData: any) => {
    setIsSaving(true);
    try {
      await saveTopic(topicData, false);
      navigate(`/t/${topicData.slug}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug) return;
    try {
      await deleteTopic(slug);
      navigate('/');
    } catch (err: any) {
      alert(`Could not delete topic: ${err.message}`);
    }
  };

  return (
    <TopicEditor
      initialTopic={topic}
      onSave={handleSave}
      onDelete={handleDelete}
      onDiscard={() => navigate(`/t/${slug}`)}
      isSaving={isSaving}
    />
  );
}
