import React from 'react';

const LinkModeToggle = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`bloomberg-button ${enabled ? 'active' : ''}`}
      title="Toggle QA mode - links corresponding files between sites"
    >
      LINK:{enabled ? 'ON' : 'OFF'}
    </button>
  );
};

export default LinkModeToggle;