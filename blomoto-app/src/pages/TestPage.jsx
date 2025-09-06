import React from 'react';
import TestNavigation from '../components/TestNavigation';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Page de Test</h1>
          <p className="text-gray-700 text-lg">Si vous voyez cette page, le routage fonctionne correctement !</p>
          <div className="mt-4 p-4 bg-green-100 rounded-lg inline-block">
            <p className="text-green-800 font-semibold">✅ Le composant TestPage se charge correctement</p>
          </div>
        </div>
        
        <TestNavigation />
      </div>
    </div>
  );
};

export default TestPage;
