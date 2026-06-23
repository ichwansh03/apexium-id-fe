import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface DiffViewerProps {
  oldValue: string;
  newValue: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldValue, newValue }) => {
  return (
    <ReactDiffViewer
      oldValue={oldValue}
      newValue={newValue}
      splitView={true}
      useDarkTheme={window.matchMedia('(prefers-color-scheme: dark)').matches}
    />
  );
};

export default DiffViewer;
