import React from 'react';

interface StatusBarProps {
  statusMessage: string;
  currentTime: Date;
}

const StatusBar: React.FC<StatusBarProps> = ({ statusMessage, currentTime }) => {
  return (
    <div className="status-bar">
      <span>{statusMessage}</span>
      <span style={{ float: 'right' }}>
        {currentTime.toLocaleString('de-DE')}
      </span>
    </div>
  );
};

export default StatusBar;