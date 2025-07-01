import HomeHeader from './HomeHeader';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Footer from '../ui/Footer'; // updated import

const Home = () => {
  return (
    <main>
      <HomeHeader />
      <Hero />
      <About />
      <Features />
      <Footer />
    </main>
  );
};

export default Home;
