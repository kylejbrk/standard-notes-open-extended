import React from 'react';
import PropTypes from 'prop-types';
import AuthEntry from '@Components/AuthEntry';

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

ViewEntries.propTypes =  {
  entries: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCopyToken: PropTypes.func.isRequired
};

export default ViewEntries;
