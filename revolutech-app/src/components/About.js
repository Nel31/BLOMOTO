import React from 'react';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About REVOLUTECH</h1>
          <p className="text-xl mb-8">
            Revolutionizing the future of technology and innovation.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story-section bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="mb-4">
                Founded in 2020, REVOLUTECH began with a simple mission: to bridge the gap between cutting-edge technology and everyday users. Our founders, technology enthusiasts with decades of experience, recognized the need for innovative solutions that are both powerful and accessible.
              </p>
              <p>
                What started as a small startup has grown into a dynamic company at the forefront of technological innovation, with a team of dedicated professionals committed to pushing boundaries and creating meaningful change.
              </p>
            </div>
            <div className="about-image">
              <img src="/api/placeholder/600/400" alt="REVOLUTECH team" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="mission-section">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-8">
              At REVOLUTECH, we're committed to developing technology that empowers individuals and organizations to achieve their full potential. We believe that innovation should be accessible to everyone, and we work tirelessly to create solutions that are both powerful and user-friendly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="mission-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p>Constantly pushing boundaries and exploring new possibilities in technology.</p>
              </div>
              <div className="mission-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Accessibility</h3>
                <p>Making advanced technology accessible and usable for everyone.</p>
              </div>
              <div className="mission-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Sustainability</h3>
                <p>Creating solutions that are not only effective but also environmentally responsible.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member text-center">
                <img src={`/api/placeholder/300/300`} alt={member.name} className="rounded-full w-48 h-48 mx-auto mb-4 object-cover" />
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600 mb-2">{member.position}</p>
                <p className="text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
          <p className="text-lg mb-8">
            Have questions or want to learn more about REVOLUTECH? We'd love to hear from you!
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};

// Sample team members data
const teamMembers = [
  {
    name: "Alex Johnson",
    position: "CEO & Founder",
    bio: "With 15 years of experience in tech innovation, Alex leads our vision and strategy."
  },
  {
    name: "Sarah Lee",
    position: "CTO",
    bio: "Sarah oversees all technical aspects and ensures we stay at the cutting edge."
  },
  {
    name: "David Chen",
    position: "Head of Design",
    bio: "David brings creativity and user-centered thinking to all our products."
  },
  {
    name: "Maria Rodriguez",
    position: "Operations Director",
    bio: "Maria ensures our day-to-day operations run smoothly and efficiently."
  }
];

export default About;