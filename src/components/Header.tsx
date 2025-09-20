import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="header">
      <h1>Factor Warenwirtschaftssystem</h1>
      <div className="header-info">
        <span className="version">v2.0</span>
        <span className="status">🟢 Online</span>
      </div>
    </div>
  );
};

export default Header;