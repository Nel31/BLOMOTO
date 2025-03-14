import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import Services from "./Services";
import Stats from "./Stats";
import Testimonials from "./Testimonials";
import GetStarted from "./GetStarted";

function Home() {
  return (
    <div className="Home">
      <Hero />
      <Features />
      <Services />
      <Stats />
      <Testimonials />
      <GetStarted />
    </div>
  );
}

export default Home;
