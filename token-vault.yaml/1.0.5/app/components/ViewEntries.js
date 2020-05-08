import React from 'react';
import AuthEntry from './AuthEntry';

const ViewEntries = ({ entries, onEdit, onRemove, onCopyToken }) => (
  <div className="auth-list">
    {entries.map((entry, idx) => (
      <AuthEntry
        key={idx}
        id={idx}
        entry={entry}
        onEdit={onEdit}
        onRemove={onRemove}
        onCopyToken={onCopyToken}
      />
    ))}
  </div>
);

export default ViewEntries;
