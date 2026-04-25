import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DataProvider, useData } from './context/DataContext';
import { NavDots } from './components/ui/NavDots';

import { HeroSection } from './components/sections/HeroSection';
import { IntroSection } from './components/sections/IntroSection';
import { ContactScatterSection } from './components/sections/ContactScatterSection';
import { RadarSection } from './components/sections/RadarSection';
import { HeatmapSection } from './components/sections/HeatmapSection';
import { DeltaHistSection } from './components/sections/DeltaHistSection';
import { CorrelationSection } from './components/sections/CorrelationSection';
import { SandboxSection } from './components/sections/SandboxSection';
import { ConclusionSection } from './components/sections/ConclusionSection';

gsap.registerPlugin(ScrollTrigger);

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: '#000' }}>
      <div className="font-black uppercase text-white text-xl tracking-widest mb-4">Loading</div>
      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full animate-pulse" style={{ background: '#EB6E1F', width: '60%' }} />
      </div>
    </div>
  );
}

function AppContent() {
  const data = useData();

  if (!data) return <LoadingScreen />;

  return (
    <div className="relative bg-black text-white">
      <NavDots />

      <HeroSection />

      <div style={{ background: 'linear-gradient(to bottom, #000 0%, #050810 30%, #000 70%)' }}>
        <IntroSection />
      </div>

      <div style={{ background: '#000' }}>
        <ContactScatterSection />
      </div>

      <div style={{ background: 'linear-gradient(to bottom, #000, #050810, #000)' }}>
        <RadarSection />
      </div>

      <div style={{ background: '#000' }}>
        <HeatmapSection />
      </div>

      <div style={{ background: 'linear-gradient(to bottom, #000, #050810, #000)' }}>
        <DeltaHistSection />
      </div>

      <div style={{ background: '#000' }}>
        <CorrelationSection />
      </div>

      <div style={{ background: 'linear-gradient(to bottom, #000, #050c1a, #000)' }}>
        <SandboxSection />
      </div>

      <div style={{ background: '#000' }}>
        <ConclusionSection />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
