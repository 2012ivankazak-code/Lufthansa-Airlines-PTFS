import React, { useState } from 'react';
import { Preloader } from './components/Preloader';
import { DiagonalStripes } from './components/DiagonalStripes';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CareersSection } from './components/CareersSection';
import { StatusTrackerSection } from './components/StatusTrackerSection';
import { CheckinSection } from './components/CheckinSection';
import { ScheduleSection } from './components/ScheduleSection';
import { MapPlannerSection } from './components/MapPlannerSection';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ServicePanelModal } from './components/ServicePanelModal';
import { ApplicationModal } from './components/ApplicationModal';
import { FlightAlertModal } from './components/FlightAlertModal';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { ScrollReveal } from './components/ScrollReveal';
import { RoleId, Application } from './types';

export default function App() {
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isServicePanelOpen, setIsServicePanelOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleApplicationSuccess = (_newApp: Application) => {
    // Handled by local storage event
  };

  const handleAuthenticated = () => {
    setIsAuthOpen(false);
    setIsServicePanelOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#020B27] text-white selection:bg-[#FFCC00] selection:text-[#05164D] overflow-x-hidden">
      {/* 1. Strict Preloader (Fades after 1.5s) */}
      <Preloader />

      {/* 2. Custom tactile cursor: simple white circle that squishes on mousedown */}
      <CustomCursor />

      {/* 3. Signature Parallax Diagonal Stripes with Dynamic Eye-Level Center Glow */}
      <DiagonalStripes />

      {/* 4. Streamlined Navigation Header (Alerts, Telegram, and Service Panel moved to bottom) */}
      <Header />

      {/* Main Content Flow with Smooth Scroll Reveal */}
      <main className="relative z-10 flex flex-col space-y-16">
        {/* Hero Section */}
        <ScrollReveal>
          <Hero />
        </ScrollReveal>

        {/* Careers & Job Applications Section */}
        <ScrollReveal>
          <CareersSection onSelectRole={(roleId) => setSelectedRoleId(roleId)} />
        </ScrollReveal>

        {/* Interactive Flight Route Map Planner (Protected by secret key) */}
        <ScrollReveal>
          <MapPlannerSection />
        </ScrollReveal>

        {/* Check-in & Boarding Pass Generator */}
        <ScrollReveal>
          <CheckinSection />
        </ScrollReveal>

        {/* Flight Departure Schedule (Airport Board with Moscow Time and Saved Routes) */}
        <ScrollReveal>
          <ScheduleSection />
        </ScrollReveal>

        {/* Applicant Status Tracker */}
        <ScrollReveal>
          <StatusTrackerSection />
        </ScrollReveal>
      </main>

      {/* Footer with Relocated Flight Alerts, Telegram Community, and Service Panel */}
      <Footer
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
      />

      {/* Job Application Form Modal */}
      <ApplicationModal
        roleId={selectedRoleId}
        onClose={() => setSelectedRoleId(null)}
        onSuccess={handleApplicationSuccess}
      />

      {/* Secure Service Authorization Modal */}
      <AdminAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Returned Service / Staff Panel with Flight Management */}
      <ServicePanelModal
        isOpen={isServicePanelOpen}
        onClose={() => setIsServicePanelOpen(false)}
      />

      {/* Flight Notification Modal */}
      <FlightAlertModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Cookie Acceptance Banner */}
      <CookieBanner
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
      />
    </div>
  );
}
