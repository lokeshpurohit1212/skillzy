import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  ArrowRight,
  Palette,
  Camera,
  Repeat,
  Users,
  Clock,
  Code2,
  Clapperboard,
  Smartphone,
  Guitar,
  Mic2,
  Languages,
  GraduationCap,
  Clock3,
  Sparkles
} from 'lucide-react';

// Helper for random stars
const StarField = ({ count = 60 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="star"
        style={{
          top: `${Math.random() * 40 + 2}%`,
          left: `${Math.random() * 98}%`,
          width: `${Math.random() * 2 + 1.5}px`,
          height: `${Math.random() * 2 + 1.5}px`,
          opacity: Math.random() * 0.5 + 0.5
        }}
      />
    ))}
  </>
);

// SVG Moon
const Moon = () => (
  <svg style={{position:'absolute',top:32,right:64,zIndex:2}} width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="28" cy="20" r="16" fill="#fff" fillOpacity="0.9" />
    <circle cx="34" cy="18" r="13" fill="#0C0420" />
  </svg>
);

// SVG Hill
const Hill = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1440 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    style={{ display: 'block' }}
  >
    <path d="M0 80 Q 360 180 720 80 T 1440 80 V180 H0Z" fill="#5D3C64" />
  </svg>
);



// Animated floating constellation for hero
const FloatingConstellation = () => (
  <svg width="220" height="120" viewBox="0 0 220 120" fill="none" className="animate-float-slow hidden md:block absolute right-[-260px] top-10 z-10">
    <circle cx="30" cy="80" r="4" fill="#D391B0" />
    <circle cx="90" cy="30" r="4" fill="#BA6E8F" />
    <circle cx="170" cy="60" r="4" fill="#9F6496" />
    <circle cx="200" cy="100" r="4" fill="#5D3C64" />
    <polyline points="30,80 90,30 170,60 200,100" stroke="#fff" strokeWidth="2" fill="none" />
  </svg>
);

const features = [
  {
    icon: <Search className="w-8 h-8 text-brand-pink group-hover:animate-bounce" />,
    title: 'Discover Skills',
    description: 'Explore skills offered by people in your community and find the perfect skill you want to learn.'
  },
  {
    icon: <Repeat className="w-8 h-8 text-brand-pink group-hover:animate-bounce" />,
    title: 'Request a Swap',
    description: 'Choose a skill to learn, offer one of your own, and send a personalized swap request.'
  },
  {
    icon: <Clock className="w-8 h-8 text-brand-pink group-hover:animate-bounce" />,
    title: 'Earn Time Credits',
    description: 'Complete skill exchanges to earn time credits that you can use to learn new skills.'
  },
  {
    icon: <Users className="w-8 h-8 text-brand-pink group-hover:animate-bounce" />,
    title: 'Learn & Grow',
    description: 'Connect with skilled people, build your reputation, and keep growing through meaningful exchanges.'
  }
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  // Animation refs
  const heroRef = useRef();
  const featuresRef = useRef();
  const skillsRef = useRef();
  const ctaRef = useRef();
  const heroBtnRef = useRef();
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    // Animate sections in on mount
    const animate = (ref, delay = 0) => {
      if (ref.current) {
        ref.current.style.transition = 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)';
        ref.current.style.opacity = 1;
        ref.current.style.transform = 'none';
      }
    };
    setTimeout(() => animate(heroRef), 100);
    setTimeout(() => animate(featuresRef), 400);
    setTimeout(() => animate(skillsRef), 700);
    setTimeout(() => animate(ctaRef), 1000);
    setTimeout(() => setGlow(true), 300);
    setTimeout(() => {
      if (heroBtnRef.current) {
        heroBtnRef.current.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
        heroBtnRef.current.style.opacity = 1;
        heroBtnRef.current.style.transform = 'none';
      }
    }, 600);
  }, []);

  const popularSkills = [
  {
    name: 'Web Development',
    icon: <Code2 className="w-9 h-9" />
  },
  {
    name: 'Graphic Design',
    icon: <Palette className="w-9 h-9" />
  },
  {
    name: 'Video Editing',
    icon: <Clapperboard className="w-9 h-9" />
  },
  {
    name: 'Photography',
    icon: <Camera className="w-9 h-9" />
  },
  {
    name: 'Digital Marketing',
    icon: <Smartphone className="w-9 h-9" />
  },
  {
    name: 'Guitar & Music',
    icon: <Guitar className="w-9 h-9" />
  },
  {
    name: 'Public Speaking',
    icon: <Mic2 className="w-9 h-9" />
  },
  {
    name: 'Language Learning',
    icon: <Languages className="w-9 h-9" />
  }
];

  return (
    <div className="relative min-h-screen overflow-x-hidden px-0 pt-0 flex flex-col bg-brand-night">
      {/* Night sky stars and moon */}
      <StarField count={60} />
      <Moon />
      {/* Hero Section */}
      <div
        ref={heroRef}
        style={{ opacity: 0, transform: 'translateY(40px)' }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20 pb-16 max-w-4xl w-full mx-auto"
      >
        {/* Animated Glow */}
        <div className={`absolute left-1/2 top-16 -translate-x-1/2 z-0 pointer-events-none ${glow ? 'animate-glow' : ''}`} style={{width:'520px',height:'220px',filter:'blur(80px)',background:'radial-gradient(circle,#D391B0 0%,#5D3C64 80%,transparent 100%)',opacity:0.35}} />
        <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 drop-shadow-[0_2px_16px_rgba(44,0,60,0.25)] z-10 tracking-tight max-w-4xl mx-auto leading-tight">
  Your Skills Are Worth
  <span className="block text-brand-pink">
    More Than You Think.
  </span>
</h1>
        {/* Floating constellation */}
        <div className="relative w-full flex justify-end">
          <FloatingConstellation />
        </div>
       <p className="text-lg text-brand-orchid max-w-2xl mx-auto mb-10 relative z-10">
  Skillzy is a community where knowledge becomes currency. Teach what you know,
  earn time credits, and learn directly from people who have the skills you want.
</p>
       <Link
  ref={heroBtnRef}
  style={{ opacity: 0, transform: 'translateY(30px)' }}
  to={isAuthenticated ? "/browse" : "/register"}
  className="group relative overflow-hidden bg-brand-pink text-brand-night font-bold text-lg px-9 py-4 rounded-2xl inline-flex items-center justify-center transition-all duration-300 shadow-lg mb-2 hover:-translate-y-1 hover:bg-white hover:shadow-2xl active:scale-95"
>
  <span className="relative z-10">
    {isAuthenticated ? "Find Your Next Skill" : "Start Swapping Skills"}
  </span>

  <ArrowRight className="relative z-10 w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
</Link>

<div className="flex flex-wrap justify-center gap-8 mt-8 text-white/80">
  <div className="text-center">
    <p className="text-2xl font-extrabold text-brand-pink">Share</p>
    <p className="text-sm mt-1">What you know</p>
  </div>

  <div className="hidden sm:block w-px bg-white/20" />

  <div className="text-center">
    <p className="text-2xl font-extrabold text-brand-pink">Earn</p>
    <p className="text-sm mt-1">Time credits</p>
  </div>

  <div className="hidden sm:block w-px bg-white/20" />

  <div className="text-center">
    <p className="text-2xl font-extrabold text-brand-pink">Learn</p>
    <p className="text-sm mt-1">Something new</p>
  </div>
</div>
      </div>
      {/* Main Content Below Hero */}
      <div>
        {/* Features Section */}
        <section
          ref={featuresRef}
          style={{ opacity: 0, transform: 'translateY(40px)' }}
          className="bg-brand-night bg-opacity-95 rounded-3xl shadow-lg border-0 p-8 md:p-14 max-w-6xl mx-auto w-full mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-brand-pink mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white/10 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center text-center p-7 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-brand-blush/30">
                <div className="w-16 h-16 bg-brand-plum/90 rounded-full flex items-center justify-center mb-5 text-white shadow-md border-2 border-brand-blush">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-brand-orchid max-w-xs">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        {/* Popular Skills Section */}
        <section
          ref={skillsRef}
          style={{ opacity: 0, transform: 'translateY(40px)' }}
          className="bg-brand-night rounded-3xl shadow-card-lg px-10 py-14 max-w-6xl mx-auto w-full mt-20 animate-fade-in border border-brand-plum/30"
        >
          <h2 className="text-4xl font-extrabold text-brand-pink text-center mb-10 tracking-wide drop-shadow-lg">
            Skills People Love to Share
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  {popularSkills.map((skill, index) => (
    <div
      key={index}
      className="group relative bg-white/5 border border-brand-plum/40 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:bg-brand-plum/30 hover:border-brand-pink"
    >
      {/* Number */}
      <span className="absolute top-4 right-5 text-brand-pink/30 text-5xl font-extrabold">
        0{index + 1}
      </span>

      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-brand-pink/15 text-brand-pink flex items-center justify-center mb-8 transition-all duration-300 group-hover:bg-brand-pink group-hover:text-white group-hover:scale-110">
        {skill.icon}
      </div>

      {/* Skill Name */}
      <h3 className="text-xl font-bold text-white mb-2 relative z-10">
        {skill.name}
      </h3>

      <p className="text-sm text-brand-pink/80 mb-5 relative z-10">
        Learn, share and grow your skills.
      </p>

      {/* Bottom line */}
      <div className="w-10 h-1 rounded-full bg-brand-pink transition-all duration-300 group-hover:w-full" />
    </div>
  ))}
</div>
          <div className="flex justify-center">
            <Link
              to="/browse"
              className="bg-brand-orchid text-white font-bold px-8 py-4 rounded-full shadow-card transition-all duration-200 hover:bg-brand-pink hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-pink/40 inline-flex items-center justify-center text-lg"
            >
              Explore All Skills
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
                </section>

        {/* How Time Credits Work Section */}
        <section className="max-w-6xl mx-auto w-full mt-20 px-6">
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card-lg p-8 md:p-14 border border-brand-pink/20 dark:border-[#2D263B]">

            <div className="text-center mb-12">
              <p className="text-brand-orchid font-bold tracking-widest uppercase mb-3">
                Learn • Teach • Grow
              </p>

              <h2 className="text-4xl font-extrabold text-brand-night dark:text-[#F5F2FA] mb-4">
                How Skillzy Time Credits Work
              </h2>

              <p className="text-brand-mauve dark:text-gray-300 text-lg max-w-2xl mx-auto">
                Your time has value. Share a skill, earn time credits, and use
                those credits to learn something new from the Skillzy community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Step 1 */}
              <div className="relative text-center p-8 rounded-2xl bg-brand-pink/10 dark:bg-brand-pink/5 border border-brand-pink/20 dark:border-brand-pink/10 hover:-translate-y-2 transition-transform duration-300">
               <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-brand-pink text-white flex items-center justify-center shadow-lg">
  <GraduationCap className="w-8 h-8" />
</div>

                <h3 className="text-xl font-bold text-brand-night dark:text-[#F5F2FA] mb-3">
                  Teach a Skill
                </h3>

                <p className="text-brand-mauve dark:text-gray-300">
                  Share something you know with another member of the Skillzy community.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center p-8 rounded-2xl bg-brand-orchid/10 dark:bg-brand-orchid/5 border border-brand-orchid/20 dark:border-brand-orchid/10 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-brand-orchid text-white flex items-center justify-center shadow-lg">
  <Clock3 className="w-8 h-8" />
</div>

                <h3 className="text-xl font-bold text-brand-night dark:text-[#F5F2FA] mb-3">
                  Earn Time Credits
                </h3>

                <p className="text-brand-mauve dark:text-gray-300">
                  Every successful skill exchange helps you build credits for future learning.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center p-8 rounded-2xl bg-brand-plum/10 dark:bg-brand-plum/5 border border-brand-plum/20 dark:border-brand-plum/10 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-brand-plum text-white flex items-center justify-center shadow-lg">
  <Sparkles className="w-8 h-8" />
</div>

                <h3 className="text-xl font-bold text-brand-night dark:text-[#F5F2FA] mb-3">
                  Learn Something New
                </h3>

                <p className="text-brand-mauve dark:text-gray-300">
                  Use your earned time credits to connect with someone and start learning.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          ref={ctaRef}
          style={{ opacity: 0, transform: 'translateY(40px)' }}
          className="bg-brand-pink/90 rounded-3xl text-brand-night text-center p-8 md:p-14 shadow-2xl max-w-4xl mx-auto w-full mt-20 mb-32 border border-brand-blush"
        >
          <h2 className="text-3xl font-bold mb-4">
            Got a Skill? Make It Count.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Teach what you know, earn time credits, and use them to unlock your next skill.
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center">
              <Link
                to="/register"
                className="bg-white text-brand-plum hover:bg-brand-blush font-semibold text-lg px-10 py-4 rounded-full inline-flex items-center justify-center transition-colors duration-200 shadow-lg transform transition-transform active:scale-95 hover:scale-105 hover:shadow-2xl"
              >
                Start Your Skillzy Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}
        </section>
      </div>
      {/* Hill at the very bottom as a footer background */}
      <div className="w-full absolute left-0 bottom-0 z-0 h-[180px] overflow-visible">
        <Hill />
      </div>
    </div>
  );
};

export default Home;