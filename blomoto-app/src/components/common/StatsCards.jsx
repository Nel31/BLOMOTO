import React from 'react';

function StatsCards({ items = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((it, idx) => (
        <div key={idx} className="bg-white rounded-lg p-5 shadow">
          <div className="text-sm text-gray-500">{it.label}</div>
          <div className="text-2xl font-semibold">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;


