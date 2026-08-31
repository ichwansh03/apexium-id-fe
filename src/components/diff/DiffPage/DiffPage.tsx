import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DiffViewer from '../DiffViewer/DiffViewer';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import type { MetadataDiffDto } from '../../../types';
import './DiffPage.css';

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
        // First fetch history to get the latest history ID
        const historyResponse = await fetch(`/api/sfdc/metadata/history/${entityType}/${entityId}`);
        if (!historyResponse.ok) throw new Error('Failed to fetch history');
        const historyData = await historyResponse.json();

        if (!historyData || historyData.length === 0) {
          setDiff({ previousBody: '', latestBody: '' });
          return;
        }

        // Fetch diff between current body and latest snapshot
        const latestHistoryId = historyData[0].id;
        const diffResponse = await fetch(`/api/sfdc/metadata/history/${entityType}/${entityId}/diff?historyId=${latestHistoryId}`);
        if (!diffResponse.ok) throw new Error('Failed to fetch diff');
        const data = await diffResponse.json();
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
      <div className="diff-viewer-wrapper">
        {diff && <DiffViewer oldValue={diff.previousBody} newValue={diff.latestBody} />}
      </div>
    </div>
  );
};

export default DiffPage;
