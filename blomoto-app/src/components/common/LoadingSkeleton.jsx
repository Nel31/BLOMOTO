import React from 'react';

function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded" />
      ))}
    </div>
  );
}

export default LoadingSkeleton;


