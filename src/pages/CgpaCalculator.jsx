import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

function CgpaCalculator({ semesters }) {
  const [tillSemester, setTillSemester] = useState('');
  const [sgpaInputs, setSgpaInputs] = useState({}); // semesterNumber -> string
  const [cgpaCalculated, setCgpaCalculated] = useState(false);
  const [cgpaResult, setCgpaResult] = useState(null);
  const [cgpaStats, setCgpaStats] = useState({
    highest: 0.0,
    lowest: 0.0,
    improvements: 0,
    declines: 0,
    overallTrend: 'Stable',
    chartPoints: []
  });

  // Initialize SGPA input fields when tillSemester changes
  useEffect(() => {
    if (tillSemester) {
      const initialInputs = {};
      for (let i = 1; i <= parseInt(tillSemester); i++) {
        initialInputs[i] = '';
      }
      setSgpaInputs(initialInputs);
      setCgpaCalculated(false);
      setCgpaResult(null);
    } else {
      setSgpaInputs({});
      setCgpaCalculated(false);
      setCgpaResult(null);
    }
  }, [tillSemester]);

  // Handle CGPA Calculation using the simple average formula
  const handleCalculateCGPA = (e) => {
    e.preventDefault();
    if (!tillSemester) return;

    const numSemesters = parseInt(tillSemester) || 0;
    let totalSgpa = 0;
    let validInputsCount = 0;
    let highestGpa = 0.0;
    let lowestGpa = 10.0;
    let improvements = 0;
    let declines = 0;
    let prevGpa = null;
    const chartPoints = [];

    for (let i = 1; i <= numSemesters; i++) {
      const sgpaVal = parseFloat(sgpaInputs[i]);
      if (!isNaN(sgpaVal) && sgpaVal >= 0 && sgpaVal <= 10) {
        totalSgpa += sgpaVal;
        validInputsCount++;

        if (sgpaVal > highestGpa) highestGpa = sgpaVal;
        if (sgpaVal < lowestGpa) lowestGpa = sgpaVal;

        if (prevGpa !== null) {
          if (sgpaVal > prevGpa) {
            improvements++;
          } else if (sgpaVal < prevGpa) {
            declines++;
          }
        }
        prevGpa = sgpaVal;
        chartPoints.push({ sem: i, gpa: sgpaVal });
      }
    }

    if (validInputsCount === numSemesters) {
      const cgpa = (totalSgpa / numSemesters).toFixed(2);
      let overallTrend = 'Stable';
      if (numSemesters > 1) {
        if (improvements > declines) overallTrend = 'Improving';
        else if (declines > improvements) overallTrend = 'Declining';
      }

      setCgpaResult(cgpa);
      setCgpaStats({
        highest: highestGpa,
        lowest: lowestGpa,
        improvements,
        declines,
        overallTrend,
        chartPoints
      });
      setCgpaCalculated(true);
    }
  };

  const numSemesters = parseInt(tillSemester) || 0;
  const semestersArray = [];
  for (let i = 1; i <= numSemesters; i++) {
    semestersArray.push(i);
  }

  const allCgpaInputsFilled = tillSemester && semestersArray.every((semNum) => {
    const val = sgpaInputs[semNum];
    return val !== undefined && val !== null && val.toString().trim() !== '';
  });

  const allCgpaInputsValid = tillSemester && semestersArray.every((semNum) => {
    const val = parseFloat(sgpaInputs[semNum]);
    return !isNaN(val) && val >= 0 && val <= 10;
  });

  // Chart mapping coordinates
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const chartWidth = svgWidth - paddingLeft - paddingRight; // 440
  const chartHeight = svgHeight - paddingTop - paddingBottom; // 140

  const mappedPoints = cgpaStats.chartPoints.map(point => {
    let x = paddingLeft + chartWidth / 2;
    if (numSemesters > 1) {
      x = paddingLeft + ((point.sem - 1) / (numSemesters - 1)) * chartWidth;
    }
    const y = paddingTop + chartHeight - (point.gpa / 10) * chartHeight;
    return { ...point, x, y };
  });

  const getBezierPath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 2 / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const getFillPath = (points) => {
    if (points.length === 0) return '';
    const linePath = getBezierPath(points);
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  };

  const gridLinesY = [0, 2.5, 5, 7.5, 10];
  const semGrid = [];
  if (tillSemester) {
    for (let i = 1; i <= numSemesters; i++) {
      let x_pos = paddingLeft + chartWidth / 2;
      if (numSemesters > 1) {
        x_pos = paddingLeft + ((i - 1) / (numSemesters - 1)) * chartWidth;
      }
      semGrid.push({ sem: i, x: x_pos });
    }
  }

  const getCgpaRangeDetails = (val) => {
    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal <= 6.0) {
      return {
        colorClass: 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]',
        bgClass: 'bg-red-500',
        barGradient: 'from-red-600 to-red-400',
        message: 'Push harder! Consistent efforts will yield better results.',
        label: 'Needs Improvement'
      };
    } else if (numVal <= 7.5) {
      return {
        colorClass: 'text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]',
        bgClass: 'bg-orange-500',
        barGradient: 'from-orange-600 to-orange-400',
        message: 'Good progress! Focus on key areas to boost your GPA.',
        label: 'Satisfactory'
      };
    } else if (numVal <= 9.0) {
      return {
        colorClass: 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]',
        bgClass: 'bg-emerald-400',
        barGradient: 'from-emerald-500 to-emerald-300',
        message: 'Excellent consistency! Keep up the brilliant academic work.',
        label: 'Excellent'
      };
    } else {
      return {
        colorClass: 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]',
        bgClass: 'bg-cyan-400',
        barGradient: 'from-cyan-500 to-cyan-300',
        message: 'Phenomenal academic record! You are at the top tier!',
        label: 'Outstanding'
      };
    }
  };

  return (
    <div className="pt-20 pb-12 animate-fade-in">
      {/* Header & Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-4">
        <h1 className="font-poppins text-[38px] md:text-[46px] font-bold tracking-tight leading-none mb-3">
          <span className="text-blue-400 select-none drop-shadow-[0_0_15px_rgba(59,130,246,0.55)]">CGPA</span> Calculator
        </h1>
        <p className="text-white text-base md:text-lg font-normal leading-relaxed opacity-95">
          Calculate your Cumulative Grade Point Average till present semester.
        </p>
      </div>

      {/* Dropdown Selector */}
      <div className="flex justify-center items-center mb-8 max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-indigo-500/20 backdrop-blur-md shadow-xl">
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-400 mb-2 text-center">Till which semester?</label>
          <div className="relative">
            <select
              value={tillSemester}
              onChange={(e) => setTillSemester(e.target.value)}
              className="w-full px-4 py-3 bg-[#160d29]/90 border border-indigo-500/20 rounded-xl text-white focus:outline-none focus:border-indigo-400 transition-all duration-300 backdrop-blur-md appearance-none text-center"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%23818cf8\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', 
                backgroundPosition: 'right 1rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.2em 1.2em', 
                paddingRight: '2.5rem' 
              }}
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.semester_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content columns */}
      {!tillSemester ? (
        <div className="flex flex-col items-center justify-center p-6 border border-indigo-500/20 rounded-3xl bg-white/5 backdrop-blur-md max-w-2xl mx-auto shadow-2xl transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">No Selection Made</h3>
          <p className="text-gray-400 text-center max-w-md text-sm">
            Select the semester up to which you want to calculate your cumulative GPA from the dropdown above to begin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start animate-fade-in">
          
          {/* Left Column: Semester GPA Inputs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-indigo-500/20 backdrop-blur-md shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Semester GPA Inputs</h2>
              <p className="text-sm text-gray-400 mb-6">Enter your SGPA for each semester up to Sem {tillSemester}</p>
              
              <div className="space-y-4">
                {semestersArray.map((semNum) => (
                  <div 
                    key={semNum}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <div className="flex-1 pr-4">
                      <h4 className="text-base font-semibold text-white">Semester {semNum}</h4>
                    </div>
                    
                    <div className="w-32 relative">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="e.g. 8.50"
                        value={sgpaInputs[semNum] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSgpaInputs(prev => ({
                            ...prev,
                            [semNum]: val
                          }));
                          setCgpaCalculated(false);
                          setCgpaResult(null);
                        }}
                        className="w-full px-3 py-2 bg-[#120a22] border border-indigo-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-400 transition-all duration-300 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation & Submit Section */}
              <div className="mt-8 pt-6 border-t border-indigo-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  {!allCgpaInputsFilled ? (
                    <span className="text-sm font-medium text-amber-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Please enter SGPAs for all semesters.
                    </span>
                  ) : !allCgpaInputsValid ? (
                    <span className="text-sm font-medium text-red-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                      Please enter valid SGPAs between 0.00 and 10.00.
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      All SGPAs entered! Ready to calculate.
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCalculateCGPA}
                  disabled={!allCgpaInputsFilled || !allCgpaInputsValid}
                  className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    (allCgpaInputsFilled && allCgpaInputsValid)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95'
                      : 'bg-white/10 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  Calculate CGPA
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: CGPA Overview & Charts */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* CGPA Display Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-indigo-500/20 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-6">CGPA Overview</h3>

              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="relative mb-2">
                  <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-current pointer-events-none" />
                  <span className={`text-6xl md:text-7xl font-extrabold tracking-tight select-none ${cgpaCalculated && cgpaResult !== null ? getCgpaRangeDetails(cgpaResult).colorClass : 'text-gray-500 drop-shadow-[0_0_12px_rgba(156,163,175,0.2)]'}`}>
                    {cgpaCalculated && cgpaResult !== null ? cgpaResult : '0.00'}
                  </span>
                </div>

                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                  Cumulative Grade Point Average
                </span>

                {/* Progress Bar */}
                <div className="w-full bg-white/5 rounded-full h-3.5 mt-8 overflow-hidden border border-indigo-500/10 p-0.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cgpaCalculated && cgpaResult !== null ? getCgpaRangeDetails(cgpaResult).barGradient : 'from-indigo-950/40 to-indigo-900/40'} transition-all duration-500 ease-out`}
                    style={{ width: `${cgpaCalculated && cgpaResult !== null ? (parseFloat(cgpaResult) / 10) * 100 : 0}%` }}
                  />
                </div>

                {/* Performance Trend and Message */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="p-4 flex-1 rounded-xl bg-white/[0.02] border border-indigo-500/10 text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Overall Trend</p>
                    <span className={`text-lg font-bold ${
                      cgpaCalculated && cgpaStats.overallTrend === 'Improving' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' :
                      cgpaCalculated && cgpaStats.overallTrend === 'Declining' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                      'text-gray-500'
                    }`}>
                      {cgpaCalculated ? cgpaStats.overallTrend : 'Stable'}
                    </span>
                  </div>
                  <div className="p-4 flex-[2] rounded-xl bg-white/[0.02] border border-indigo-500/10 text-center">
                    <p className="text-sm font-semibold text-white">
                      {cgpaCalculated && cgpaResult !== null ? getCgpaRangeDetails(cgpaResult).message : 'Click "Calculate CGPA" after entering SGPAs to generate overview.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analysis Graph */}
            <div className="p-6 rounded-3xl bg-white/5 border border-indigo-500/20 backdrop-blur-md shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Performance Analysis</h3>
              <div className="w-full relative">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%">
                  <defs>
                    {/* Area Gradient */}
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                    {/* Line Gradient */}
                    <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>

                  {/* Grid Background */}
                  {gridLinesY.map((val) => {
                    const y_pos = paddingTop + chartHeight - (val / 10) * chartHeight;
                    return (
                      <g key={val}>
                        <line x1={paddingLeft} y1={y_pos} x2={svgWidth - paddingRight} y2={y_pos} stroke="white" strokeOpacity="0.06" strokeDasharray="3 3" />
                        <text x={paddingLeft - 8} y={y_pos + 3} fill="gray" fontSize="9" textAnchor="end">{val}</text>
                      </g>
                    );
                  })}

                  {semGrid.map((item) => (
                    <line key={item.sem} x1={item.x} y1={paddingTop} x2={item.x} y2={paddingTop + chartHeight} stroke="white" strokeOpacity="0.04" strokeDasharray="3 3" />
                  ))}

                  {cgpaCalculated && mappedPoints.length > 0 && (
                    <>
                      {/* Fill Path Area */}
                      <path d={getFillPath(mappedPoints)} fill="url(#chart-area-grad)" />

                      {/* Line Path */}
                      <path d={getBezierPath(mappedPoints)} fill="none" stroke="url(#chart-line-grad)" strokeWidth="3" strokeLinecap="round" />

                      {/* Interactive Data Points (Circles) */}
                      {mappedPoints.map((point) => (
                        <g key={point.sem} className="group cursor-pointer">
                          <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" className="transition-all duration-300" />
                          <circle cx={point.x} cy={point.y} r="10" fill="transparent" />
                          <title>Sem {point.sem}: {point.gpa}</title>
                        </g>
                      ))}
                    </>
                  )}

                  {/* X Axis Labels */}
                  {semGrid.map((item) => (
                    <text key={item.sem} x={item.x} y={svgHeight - 12} fill="gray" fontSize="9" textAnchor="middle">Sem {item.sem}</text>
                  ))}
                </svg>

                {!cgpaCalculated && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl">
                    <p className="text-gray-400 text-sm font-medium text-center px-4">
                      Click "Calculate CGPA" to generate trend graph
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats Section (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Highest GPA */}
              <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20 backdrop-blur-md text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Highest GPA</p>
                <span className={`text-2xl font-bold ${cgpaCalculated ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-gray-500'}`}>
                  {cgpaCalculated ? cgpaStats.highest.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* Lowest GPA */}
              <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20 backdrop-blur-md text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Lowest GPA</p>
                <span className={`text-2xl font-bold ${cgpaCalculated ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'text-gray-500'}`}>
                  {cgpaCalculated ? cgpaStats.lowest.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* Improvements */}
              <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20 backdrop-blur-md text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Improvements</p>
                <span className={`text-2xl font-bold ${cgpaCalculated ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]' : 'text-gray-500'}`}>
                  {cgpaCalculated ? cgpaStats.improvements : '0'}
                </span>
              </div>

              {/* Declines */}
              <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20 backdrop-blur-md text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Declines</p>
                <span className={`text-2xl font-bold ${cgpaCalculated ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]' : 'text-gray-500'}`}>
                  {cgpaCalculated ? cgpaStats.declines : '0'}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default CgpaCalculator;
