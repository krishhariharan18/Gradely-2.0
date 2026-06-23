import React from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ClipboardList, 
  Award, 
  Scale, 
  CalendarCheck 
} from 'lucide-react';

function Home({ setActiveTab }) {
  const tools = [
    {
      title: 'Calculate SGPA',
      description: 'Calculate your SGPA by inputting course grades',
      icon: Calculator,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      hoverGlow: 'hover:border-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]',
      hoverTitleColor: 'group-hover:text-purple-400',
      glowColor: 'rgba(168,85,247,0.1)'
    },
    {
      title: 'Calculate CGPA',
      description: 'Track Cumulative GPA across semesters',
      icon: TrendingUp,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      hoverGlow: 'hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]',
      hoverTitleColor: 'group-hover:text-blue-400',
      glowColor: 'rgba(59,130,246,0.1)'
    },
    {
      title: 'Required ESE Marks',
      description: 'Determine required End-Semester Exam marks.',
      icon: ClipboardList,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      hoverGlow: 'hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]',
      hoverTitleColor: 'group-hover:text-emerald-400',
      glowColor: 'rgba(16,185,129,0.1)'
    },
    {
      title: 'Expected Grade',
      description: 'Forecast final grades based on current performance',
      icon: Award,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      hoverGlow: 'hover:border-yellow-500 hover:shadow-[0_0_25px_rgba(234,179,8,0.35)]',
      hoverTitleColor: 'group-hover:text-yellow-400',
      glowColor: 'rgba(234,179,8,0.1)'
    },
    {
      title: 'GPA Balancer',
      description: 'Redistribute effort across subjects to achieve target GPA',
      icon: Scale,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      hoverGlow: 'hover:border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.35)]',
      hoverTitleColor: 'group-hover:text-orange-400',
      glowColor: 'rgba(249,115,22,0.1)'
    },
    {
      title: 'Attendance Balancer',
      description: 'Track attendance percentage and strategize wisely.',
      icon: CalendarCheck,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      hoverGlow: 'hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]',
      hoverTitleColor: 'group-hover:text-red-400',
      glowColor: 'rgba(239,68,68,0.1)'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-40 pb-20 max-w-4xl mx-auto animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-cyan-500/35 bg-cyan-950/20 text-cyan-400 text-[11px] font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.12)]">
          Academic Excellence Platform
        </div>

        {/* Heading */}
        <h1 className="font-poppins text-[58px] md:text-[68px] font-bold tracking-tight leading-none mb-8">
          Gradely <span className="text-cyan-400 select-none drop-shadow-[0_0_15px_rgba(34,211,238,0.55)]">2.0</span>
        </h1>

        {/* Subheading */}
        <p className="text-white text-lg md:text-xl font-normal leading-relaxed max-w-3xl opacity-90">
          Master Your Academics — Calculate GPA, Balance Grades, Track Attendance, and Predict Your Future All in One Place.
        </p>
      </section>

      {/* Tools (Features) Section */}
      <section className="pt-8 pb-24">
        {/* Tools Title */}
        <h2 className="font-poppins text-[54px] md:text-[60px] font-bold text-cyan-400 text-center tracking-wider mb-16 uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.35)]">
          Tools
        </h2>

        {/* 2x3 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 justify-items-center max-w-[1140px] mx-auto">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={index}
                onClick={() => {
                  if (tool.title === 'Calculate SGPA') {
                    setActiveTab('SGPA');
                  } else if (tool.title === 'Calculate CGPA') {
                    setActiveTab('CGPA');
                  } else if (tool.title === 'Required ESE Marks') {
                    setActiveTab('Req ESE Marks');
                  } else if (tool.title === 'Expected Grade') {
                    setActiveTab('Expected Grade');
                  } else if (tool.title === 'GPA Balancer') {
                    setActiveTab('GPA Balancer');
                  } else if (tool.title === 'Attendance Balancer') {
                    setActiveTab('Attendance');
                  }
                }}
                className={`relative flex items-center gap-5 w-full max-w-[550px] min-h-[95px] p-5 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-md transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.025] hover:bg-white/8 ${tool.hoverGlow} group cursor-pointer`}
              >
                {/* Highlight Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon Container */}
                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${tool.bgColor} border border-white/5 transition-all duration-300 group-hover:scale-110`}>
                  <IconComponent className={`w-6 h-6 ${tool.iconColor}`} />
                </div>

                {/* Text Container */}
                <div className="flex flex-col space-y-1">
                  <h3 className={`text-[21px] font-bold text-white leading-snug transition-colors duration-300 ${tool.hoverTitleColor}`}>
                    {tool.title}
                  </h3>
                  <p className="text-[15px] text-gray-300 font-normal leading-normal line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default Home;
