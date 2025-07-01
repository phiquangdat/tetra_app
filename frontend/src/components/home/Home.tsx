import HomeHeader from './HomeHeader';
import Hero from './Hero';
import Footer from './Footer';
import About from './About';
import Features from './Features';

const Home = () => {
  return (
    <main>
      <div id="home">
        <HomeHeader />
        <Hero />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="contact">
        <Footer />
      </div>
    </main>
  );
};

export default Home;
