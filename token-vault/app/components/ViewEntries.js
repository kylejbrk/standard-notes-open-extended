import React from 'react';
import PropTypes from 'prop-types';
import AuthEntry from '@Components/AuthEntry';

const ViewEntries = ({ entries, onEdit, onRemove, onCopyToken, canEdit }) => (
  <div className="auth-list">
    {entries.map((entry, idx) => (
      <AuthEntry
        key={idx}
        id={idx}
        entry={entry}
        onEdit={onEdit}
        onRemove={onRemove}
        onCopyToken={onCopyToken}
        canEdit={canEdit}
      />
    ))}
  </div>
);

ViewEntries.propTypes =  {
  entries: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCopyToken: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired
};

export default ViewEntries;
