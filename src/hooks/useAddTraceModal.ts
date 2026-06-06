import { useState, useEffect } from 'react';
import type { DebugLevel as DebugLevelType } from '../types';

interface UseAddTraceModalProps {
  entityId: string;
  entityName: string;
  entityType: string;
  onClose: () => void;
}

export const useAddTraceModal = ({ entityId, entityName, entityType, onClose }: UseAddTraceModalProps) => {
  const [debugLevel, setDebugLevel] = useState('SFDC_DevConsole');
  const [availableLevels, setAvailableLevels] = useState<DebugLevelType[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [durationMode, setDurationMode] = useState<'24h' | 'custom'>('24h');
  const [customDays, setCustomDays] = useState('0');
  const [customHours, setCustomHours] = useState('1');
  const [customMinutes, setCustomMinutes] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchDebugLevels = async () => {
      try {
        const response = await fetch('/api/sfdc/metadata/debug-levels/db');
        if (response.ok) {
          const data = await response.json();
          setAvailableLevels(data);
          if (data.length > 0 && !data.some((l: DebugLevelType) => l.developerName === 'SFDC_DevConsole')) {
            setDebugLevel(data[0].developerName);
          }
        }
      } catch (err) {
        console.error('Failed to fetch debug levels:', err);
      } finally {
        setLoadingLevels(false);
      }
    };
    fetchDebugLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    let totalMinutes = 1440;
    if (durationMode === 'custom') {
      totalMinutes = (Number.parseInt(customDays) * 1440) + (Number.parseInt(customHours) * 60) + Number.parseInt(customMinutes);
    }

    if (totalMinutes <= 0) {
      setMessage({ text: 'Duration must be greater than 0 minutes', type: 'error' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/sfdc/logs/trace-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracedEntityId: entityId,
          tracedEntityName: entityName,
          debugLevelName: debugLevel,
          durationMinutes: totalMinutes,
          entityType: entityType,
        }),
      });

      if (response.ok) {
        setMessage({ text: `Successfully scheduled trace for ${entityName}`, type: 'success' });
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error('Failed to schedule trace');
      }
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to schedule trace', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    debugLevel,
    setDebugLevel,
    availableLevels,
    loadingLevels,
    durationMode,
    setDurationMode,
    customDays,
    setCustomDays,
    customHours,
    setCustomHours,
    customMinutes,
    setCustomMinutes,
    submitting,
    message,
    handleSubmit
  };
};
