import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface DiffViewerProps {
  oldValue: string;
  newValue: string;
}

const diffViewerStyles = {
  contentText: {
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    fontFamily: 'var(--mono, monospace)',
    fontSize: '0.85rem',
  },
  content: {
    textAlign: 'left' as const,
    width: 'auto', // Allow it to expand naturally
  },
  line: {
    wordBreak: 'normal' as const,
    whiteSpace: 'pre' as const, // Ensure long lines don't wrap
  },
  diffContainer: {
    width: 'auto', // Allow it to expand naturally
    minWidth: '100%',
  },
};

const DiffViewer: React.FC<DiffViewerProps> = ({ oldValue, newValue }) => {
  return (
    <ReactDiffViewer
      oldValue={oldValue}
      newValue={newValue}
      splitView={true}
      useDarkTheme={window.matchMedia('(prefers-color-scheme: dark)').matches}
      styles={diffViewerStyles}
    />
  );
};

export default DiffViewer;