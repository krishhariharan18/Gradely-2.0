import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Home from './pages/Home';
import SgpaCalculator from './pages/SgpaCalculator';
import CgpaCalculator from './pages/CgpaCalculator';
import PlaceholderPage from './pages/PlaceholderPage';
import RequiredEseCalculator from './pages/RequiredEseCalculator';
import ExpectedGradeCalculator from './pages/ExpectedGradeCalculator';
import GpaBalancer from './pages/GpaBalancer';
import AttendanceBalancer from './pages/AttendanceBalancer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('gradely_active_tab') || 'Home';
  });

  // Shared state for programs and semesters
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    sessionStorage.setItem('gradely_active_tab', activeTab);
  }, [activeTab]);

  // Fetch Programs and Semesters on Mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/programs`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPrograms(data);
      })
      .catch(err => console.error("Error fetching programs:", err));

    fetch(`${API_BASE_URL}/api/semesters`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSemesters(data);
      })
      .catch(err => console.error("Error fetching semesters:", err));
  }, []);

  const navTabs = [
    { name: 'Home', active: activeTab === 'Home' },
    { name: 'SGPA', active: activeTab === 'SGPA' },
    { name: 'CGPA', active: activeTab === 'CGPA' },
    { name: 'Req ESE Marks', active: activeTab === 'Req ESE Marks' },
    { name: 'Expected Grade', active: activeTab === 'Expected Grade' },
    { name: 'GPA Balancer', active: activeTab === 'GPA Balancer' },
    { name: 'Attendance', active: activeTab === 'Attendance' }
  ];

  // Render active tab component
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Home':
        return <Home setActiveTab={setActiveTab} />;
      case 'SGPA':
        return <SgpaCalculator programs={programs} semesters={semesters} />;
      case 'CGPA':
        return <CgpaCalculator semesters={semesters} />;
      case 'Req ESE Marks':
        return <RequiredEseCalculator />;
      case 'Expected Grade':
        return <ExpectedGradeCalculator />;
      case 'GPA Balancer':
        return <GpaBalancer programs={programs} semesters={semesters} />;
      case 'Attendance':
        return <AttendanceBalancer />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#090412] text-gray-200 font-sans antialiased overflow-x-hidden">
      {/* Dynamic Background Blurry Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-950/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[500px] -left-40 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-purple-950/10 rounded-full blur-[145px] pointer-events-none z-0" />

      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-white/20 bg-[#0c061a]/95 shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Branding */}
          <div className="flex items-center">
            <span 
              onClick={() => setActiveTab('Home')}
              className="text-cyan-400 font-bold text-[27px] tracking-wide select-none drop-shadow-[0_0_8px_rgba(34,211,238,0.35)] cursor-pointer"
            >
              Gradely 2.0
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center space-x-1 h-full">
            {navTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.name);
                }}
                className={`relative px-4 py-2 text-[17px] font-medium transition-all duration-300 rounded-lg hover:text-white cursor-pointer ${
                  tab.active 
                    ? 'text-cyan-400 font-semibold bg-cyan-950/20 border border-cyan-500/20' 
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                {tab.name}
                {tab.active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 border-b border-white/10 bg-[#090412]/95 backdrop-blur-2xl py-4 px-6 space-y-2 z-40 transition-all duration-300">
            {navTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-[19px] font-medium transition-all duration-200 cursor-pointer ${
                  tab.active 
                    ? 'text-cyan-400 bg-cyan-950/35 border-l-4 border-cyan-400 font-semibold' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;
