import React from 'react';

const MobileTable = ({ children }) => {
  return (
    <div style={{ 
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      border: '1px solid #334155',
      borderRadius: '0.75rem'
    }}>
      {children}
    </div>
  );
};

export default MobileTable;
