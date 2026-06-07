import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TraceFlagDto } from '../types';

export interface TraceJob {
  id: number;
  tracedEntityId: string;
  tracedEntityName: string | null;
  tracedEntityType: string;
  debugLevelName: string;
  startTime: string;
  endTime: string;
  status: string;
  sfdcTraceFlagId: string | null;
}

export const useTraceManagement = () => {
  const [traces, setTraces] = useState<TraceFlagDto[]>([]);
  const [jobs, setJobs] = useState<TraceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<{id: string, name: string, type: string} | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tracesRes, jobsRes] = await Promise.all([
        fetch('/api/sfdc/logs/trace-flags'),
        fetch('/api/sfdc/logs/trace-jobs')
      ]);

      if (!tracesRes.ok || !jobsRes.ok) throw new Error('Failed to fetch trace data');

      const [tracesData, jobsData] = await Promise.all([
        tracesRes.json(),
        jobsRes.json()
      ]);

      setTraces(tracesData);
      setJobs(jobsData);
    } catch (err) {
      setError('Failed to fetch trace management data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const handleDeleteTrace = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this active trace flag?')) return;
    
    setTraces(prev => prev.filter(t => t.Id !== id));
    
    try {
      const response = await fetch(`/api/sfdc/logs/trace-flags/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch {
      alert('Failed to delete trace flag');
      fetchData();
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trace job?')) return;
    
    setJobs(prev => prev.filter(j => j.id !== id));
    
    try {
      const response = await fetch(`/api/sfdc/logs/trace-jobs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const tracesRes = await fetch('/api/sfdc/logs/trace-flags');
        if (tracesRes.ok) {
          setTraces(await tracesRes.json());
        }
      } else {
        throw new Error('Failed to delete job');
      }
    } catch {
      alert('Failed to delete trace job');
      fetchData();
    }
  };

  const combinedData = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sfdcIdsFromJobs = new Set(jobs.filter(j => j.status === 'ACTIVE').map(j => j.sfdcTraceFlagId).filter(Boolean));
    
    const formattedTraces = traces
      .filter(t => !sfdcIdsFromJobs.has(t.Id))
      .map(t => {
        const start = t.StartDate ? new Date(t.StartDate).getTime() : 0;
        const end = t.ExpirationDate ? new Date(t.ExpirationDate).getTime() : 0;
        const durationHours = start && end ? (end - start) / (1000 * 60 * 60) : 0;
        
        return {
          id: t.Id,
          sourceId: t.Id,
          tracedEntityId: t.TracedEntityId,
          name: t.TracedEntity?.Name || t.TracedEntityId || 'Unknown',
          type: t.TracedEntity?.attributes?.type || 'Unknown',
          level: t.DebugLevel?.DeveloperName || 'Unknown',
          startTime: t.StartDate || '',
          endTime: t.ExpirationDate || '',
          source: 'SFDC' as const,
          isRecurring: durationHours > 24,
          status: 'ACTIVE'
        };
      });

    const formattedJobs = jobs
      .filter(j => {
        if (j.status === 'ACTIVE') return true;
        const startTime = new Date(j.startTime);
        return startTime >= oneWeekAgo;
      })
      .map(j => {
        const start = new Date(j.startTime).getTime();
        const end = new Date(j.endTime).getTime();
        const durationHours = (end - start) / (1000 * 60 * 60);

        return {
          id: `job-${j.id}`,
          sourceId: j.id.toString(),
          tracedEntityId: j.tracedEntityId,
          name: j.tracedEntityName || j.tracedEntityId,
          type: j.tracedEntityType,
          level: j.debugLevelName,
          startTime: j.startTime,
          endTime: j.endTime,
          source: 'APP' as const,
          isRecurring: durationHours > 24,
          status: j.status
        };
      });

    return [...formattedTraces, ...formattedJobs].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [traces, jobs]);

  return {
    traces,
    jobs,
    loading,
    error,
    fetchData,
    handleDeleteTrace,
    handleDeleteJob,
    combinedData,
    selectedTrace,
    setSelectedTrace
  };
};
