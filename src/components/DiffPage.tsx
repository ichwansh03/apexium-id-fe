import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DiffViewer from './DiffViewer';
import LoadingSpinner from './LoadingSpinner';
import type { MetadataDiffDto } from '../types';

const DiffPage: React.FC = () => {
  const { entityType, entityId } = useParams<{ entityType: string; entityId: string }>();
  const navigate = useNavigate();
  const [diff, setDiff] = useState<MetadataDiffDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiff = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sfdc/metadata/compare/${entityType}/${entityId}`);
        if (!response.ok) throw new Error('Failed to fetch comparison');
        const data = await response.json();
        setDiff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDiff();
  }, [entityType, entityId]);

  if (loading) return <LoadingSpinner message="Loading Diff..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="diff-page-container">
      <div className="diff-page-header">
        <button onClick={() => navigate(-1)}>Back</button>
        <h3>Diff View: {entityId}</h3>
      </div>
      {diff && <DiffViewer oldValue={diff.previousBody} newValue={diff.latestBody} />}
    </div>
  );
};

export default DiffPage;
