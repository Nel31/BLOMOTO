import React from 'react';

function EmptyState({ title = 'Aucune donnée', description = 'Revenez plus tard ou ajustez vos filtres.', action }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">🗂️</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;


