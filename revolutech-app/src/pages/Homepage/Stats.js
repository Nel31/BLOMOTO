import React from 'react';

function Stats() {
  const stats = [
    { value: "350+", label: "Clients" },
    { value: "570+", label: "Projets" },
    { value: "12+", label: "Années d'expérience" },
    { value: "98%", label: "Satisfaction client" }
  ];

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
