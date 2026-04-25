import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollArrow } from '../ui/ScrollArrow';

const titleLines = [
  [{ text: 'THE', big: false }, { text: 'EFFECT', big: true }],
  [{ text: 'OF', big: false }],
  [{ text: '2', big: true }, { text: 'STRIKES', big: true }],
  [{ text: 'ON A', big: false }],
  [{ text: "HITTER'S", big: true }, { text: 'SWING', big: true }],
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -30 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85;
      gsap.fromTo(
        videoRef.current,
        { scale: 1.08 },
        { scale: 1, duration: 10, ease: 'power1.inOut' }
      );
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100svh' }}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        src="/images/yordan.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transformOrigin: 'center center' }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

      {/* Title */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{ perspective: '800px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {titleLines.map((line, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-x-3 gap-y-0 leading-none">
            {line.map(word => (
              <motion.span
                key={word.text}
                variants={wordVariants}
                className="font-black uppercase text-white"
                style={{
                  fontSize: word.big ? 'clamp(3rem, 9vw, 7rem)' : 'clamp(1.2rem, 3vw, 2.5rem)',
                  lineHeight: 1.0,
                  letterSpacing: word.big ? '-0.02em' : '0.1em',
                  fontFamily: 'Montserrat, sans-serif',
                  textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                  display: 'inline-block',
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
        ))}

        {/* Orange accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4, ease: 'easeOut' }}
          className="mt-6 h-1 rounded-full"
          style={{ width: 'clamp(80px, 15vw, 160px)', background: '#EB6E1F', transformOrigin: 'left' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.8 }}
          className="mt-4 text-white/60 text-sm uppercase tracking-[0.25em] font-bold"
        >
          2024 MLB Statcast Analysis
        </motion.p>
      </motion.div>

      <ScrollArrow />
    </section>
  );
}
