import React from 'react';

function SimpleTable({ columns = [], data = [] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={columns.length}>Aucune donnée</td>
              </tr>
            )}
            {data.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SimpleTable;


