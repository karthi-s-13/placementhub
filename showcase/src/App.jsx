import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar, { SECTIONS } from './components/Sidebar';
import HeaderHero from './components/HeaderHero';
import OverviewSection from './sections/OverviewSection';
import FeaturesSection from './sections/FeaturesSection';
import ArchitectureSection from './sections/ArchitectureSection';
import TechStackSection from './sections/TechStackSection';
import DatabaseSection from './sections/DatabaseSection';
import ApiDocsSection from './sections/ApiDocsSection';
import AuthSecuritySection from './sections/AuthSecuritySection';
import FolderStructureSection from './sections/FolderStructureSection';
import EngineeringDeepDive from './sections/EngineeringDeepDive';
import MetricsLessonsSection from './sections/MetricsLessonsSection';
import ElevatorPitchSection from './sections/ElevatorPitchSection';
import Footer from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sticky Top Header Navigation */}
      <Navbar
        activeSection={activeSection}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Hero Header */}
      <HeaderHero />

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 items-start">
          
          {/* Left Navigation Index Sidebar (Desktop) */}
          <Sidebar activeSection={activeSection} />

          {/* Main Showcase Content Panel */}
          <main className="flex-1 min-w-0">
            {/* 1. Project Overview */}
            <OverviewSection />

            {/* 2. Features */}
            <FeaturesSection />

            {/* 3. System Architecture */}
            <ArchitectureSection />

            {/* 4. Tech Stack */}
            <TechStackSection />

            {/* 5. Database Design */}
            <DatabaseSection />

            {/* 6. API Documentation */}
            <ApiDocsSection />

            {/* 7 & 8. Authentication & Security */}
            <AuthSecuritySection />

            {/* 9. Folder Structure */}
            <FolderStructureSection />

            {/* 10, 11, 12, 13. Engineering Deep Dive (Challenges, Performance, Testing, Deployment) */}
            <EngineeringDeepDive />

            {/* 14, 15, 16, 17. Metrics, Lessons Learned, GitHub, Live Demo */}
            <MetricsLessonsSection />

            {/* 18. Interview Elevator Pitch */}
            <ElevatorPitchSection />
          </main>

        </div>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}
