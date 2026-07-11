import React, { useState } from 'react';
import { Calculator, Award, Info, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

function ExpectedGradeCalculator() {
  const [courseType, setCourseType] = useState('Theory');

  // Input states initialized to empty strings (blank) as requested
  const [theoryInputs, setTheoryInputs] = useState({
    ia1: { scored: '', outOf: '', scaledFor: '' },
    mse: { scored: '', outOf: '', scaledFor: '' },
    ia2: { scored: '', outOf: '', scaledFor: '' },
    ese: { scored: '', outOf: '', scaledFor: '' }
  });

  const [theoryLabInputs, setTheoryLabInputs] = useState({
    ia1: { scored: '', outOf: '', scaledFor: '' },
    mse: { scored: '', outOf: '', scaledFor: '' },
    ia2: { scored: '', outOf: '', scaledFor: '' },
    ese: { scored: '', outOf: '', scaledFor: '' },
    lab: { scored: '', outOf: '', scaledFor: '' }
  });

  // Grade Boundaries
  // Grade Boundaries with green-to-red color range
  const GRADES_REFERENCE = [
    { letter: 'O', label: 'O (Outstanding)', range: '91 - 100', color: 'text-emerald-400' },
    { letter: 'A+', label: 'A+ (Excellent)', range: '81 - 90', color: 'text-teal-400' },
    { letter: 'A', label: 'A (Very Good)', range: '71 - 80', color: 'text-lime-400' },
    { letter: 'B+', label: 'B+ (Good)', range: '61 - 70', color: 'text-yellow-400' },
    { letter: 'B', label: 'B (Average)', range: '50 - 60', color: 'text-amber-500' },
    { letter: 'P', label: 'P (Pass)', range: '41 - 50', color: 'text-orange-500' },
    { letter: 'RA', label: 'RA (Re-Appearance / Fail)', range: '0 - 40', color: 'text-red-500' }
  ];

  const getGradeStyle = (grade) => {
    switch (grade) {
      case 'O':
        return {
          text: 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]',
          stroke: 'stroke-emerald-400',
          glow: 'rgba(52, 211, 153, 0.45)'
        };
      case 'A+':
        return {
          text: 'text-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.7)]',
          stroke: 'stroke-teal-400',
          glow: 'rgba(45, 212, 191, 0.45)'
        };
      case 'A':
        return {
          text: 'text-lime-400 drop-shadow-[0_0_12px_rgba(163,230,53,0.7)]',
          stroke: 'stroke-lime-400',
          glow: 'rgba(163, 230, 53, 0.45)'
        };
      case 'B+':
        return {
          text: 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]',
          stroke: 'stroke-yellow-400',
          glow: 'rgba(250, 204, 21, 0.45)'
        };
      case 'B':
        return {
          text: 'text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]',
          stroke: 'stroke-amber-500',
          glow: 'rgba(245, 158, 11, 0.45)'
        };
      case 'P':
        return {
          text: 'text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.7)]',
          stroke: 'stroke-orange-500',
          glow: 'rgba(249, 115, 22, 0.45)'
        };
      case 'RA':
      default:
        return {
          text: 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]',
          stroke: 'stroke-red-500',
          glow: 'rgba(239, 68, 68, 0.45)'
        };
    }
  };

  // Component definition configurations
  const THEORY_COMPS = [
    { key: 'ia1', label: 'Internal Assessment 1', defaultScale: '10' },
    { key: 'mse', label: 'Mid Semester Exam', defaultScale: '30' },
    { key: 'ia2', label: 'Internal Assessment 2', defaultScale: '10' },
    { key: 'ese', label: 'End Semester Exam (ESE)', defaultScale: '50' }
  ];

  const THEORY_LAB_COMPS = [
    { key: 'ia1', label: 'Internal Assessment 1', defaultScale: '10' },
    { key: 'mse', label: 'Mid Semester Exam', defaultScale: '20' },
    { key: 'ia2', label: 'Internal Assessment 2', defaultScale: '10' },
    { key: 'ese', label: 'End Semester Exam (ESE)', defaultScale: '40' },
    { key: 'lab', label: 'Lab Assessment', defaultScale: '20' }
  ];

  const currentComponents = courseType === 'Theory' ? THEORY_COMPS : THEORY_LAB_COMPS;
  const inputs = courseType === 'Theory' ? theoryInputs : theoryLabInputs;
  const setInputs = courseType === 'Theory' ? setTheoryInputs : setTheoryLabInputs;

  // Handle Input Changes
  const handleInputChange = (compKey, field, value) => {
    setInputs(prev => ({
      ...prev,
      [compKey]: {
        ...prev[compKey],
        [field]: value
      }
    }));
  };

  // Helper to determine active border highlighting with yellow focus
  const getInputClass = (val) => {
    return `w-full px-3 py-2 bg-[#120a22] border rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_8px_rgba(234,179,8,0.3)] transition-all duration-300 ${
      val !== ''
        ? 'border-yellow-500/40'
        : 'border-white/10'
    }`;
  };

  // Calculate scaled output box values
  const getScaledContribution = (compKey) => {
    const fields = inputs[compKey];
    const s = parseFloat(fields.scored);
    const o = parseFloat(fields.outOf);
    const w = parseFloat(fields.scaledFor);
    if (isNaN(s) || isNaN(o) || isNaN(w) || o <= 0) return null;
    return (s / o) * w;
  };

  // Validation
  const isInitial = currentComponents.some(comp => {
    const fields = inputs[comp.key];
    return fields.scored === '' || fields.outOf === '' || fields.scaledFor === '';
  });

  const parsed = currentComponents.map(comp => {
    const fields = inputs[comp.key];
    return {
      key: comp.key,
      label: comp.label,
      scored: parseFloat(fields.scored),
      outOf: parseFloat(fields.outOf),
      scaledFor: parseFloat(fields.scaledFor)
    };
  });

  const validate = () => {
    if (isInitial) {
      return { valid: false, type: 'initial', message: 'Enter details for all assessment components to predict your grade.' };
    }

    const hasNan = parsed.some(c => isNaN(c.scored) || isNaN(c.outOf) || isNaN(c.scaledFor));
    if (hasNan) {
      return { valid: false, type: 'error', message: 'All inputs must contain numeric values.' };
    }

    const hasInvalidRange = parsed.some(c => c.scored < 0 || c.outOf <= 0 || c.scaledFor < 0);
    if (hasInvalidRange) {
      return { valid: false, type: 'error', message: 'Marks must be positive and weightages/totals must be greater than zero.' };
    }

    const exceeds = parsed.filter(c => c.scored > c.outOf);
    if (exceeds.length > 0) {
      return { valid: false, type: 'error', message: `${exceeds[0].label} scored marks cannot exceed total marks.` };
    }

    const weightSum = parsed.reduce((sum, c) => sum + c.scaledFor, 0);
    if (Math.abs(weightSum - 100) > 0.01) {
      return { 
        valid: false, 
        type: 'warning', 
        message: `The weightages (Scaled for) must total exactly 100% (Current total: ${weightSum}%).` 
      };
    }

    return { valid: true, type: 'success', message: null };
  };

  const validation = validate();
  const isValid = validation.valid;

  // Check ESE pass criteria (minimum 40% in ESE paper)
  const eseField = inputs.ese;
  const eseScored = parseFloat(eseField?.scored);
  const eseOutOf = parseFloat(eseField?.outOf);
  const esePercentage = !isNaN(eseScored) && !isNaN(eseOutOf) && eseOutOf > 0
    ? (eseScored / eseOutOf) * 100
    : 100;

  const isEseFailed = isValid && esePercentage < 40;

  // Calculate Cumulative expected total
  let totalPercentage = 0;
  let contributions = [];

  if (isValid) {
    parsed.forEach(c => {
      const contribution = (c.scored / c.outOf) * c.scaledFor;
      totalPercentage += contribution;
      contributions.push({
        label: c.label,
        contribution: contribution.toFixed(2),
        scaledFor: c.scaledFor,
        percentage: ((c.scored / c.outOf) * 100).toFixed(1)
      });
    });
  }

  // Determine Grade Letter
  const getExpectedGrade = (score) => {
    if (isEseFailed) return 'RA';
    const rounded = Math.round(score);
    if (rounded >= 91) return 'O';
    if (rounded >= 81) return 'A+';
    if (rounded >= 71) return 'A';
    if (rounded >= 61) return 'B+';
    if (rounded >= 50) return 'B';
    if (rounded >= 41) return 'P';
    return 'RA';
  };

  const expectedGrade = getExpectedGrade(totalPercentage);

  return (
    <div className="pt-24 pb-12 min-h-screen">
      {/* Centered Heading */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="font-poppins text-[36px] md:text-[46px] font-bold tracking-tight leading-tight mb-4 text-white">
          <span className="text-yellow-400 select-none drop-shadow-[0_0_12px_rgba(234,179,8,0.55)] font-extrabold">Expected Grade</span> Calculator
        </h1>
        <p className="text-gray-300 text-base md:text-lg font-normal leading-relaxed opacity-95 max-w-2xl mx-auto">
          Calculate your expected final grade based on your current performance. Enter your marks from different assessment components to get a comprehensive prediction of your final grade with detailed breakdowns and grade references.
        </p>
      </div>

      {/* Course Type Dropdown Selector */}
      <div className="flex justify-center items-center mb-8 max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-400 mb-2 text-center">Select Course Type</label>
          <div className="relative">
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full px-4 py-3 bg-[#160d29]/90 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 transition-all duration-300 backdrop-blur-md appearance-none text-center"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%2322d3ee\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', 
                backgroundPosition: 'right 1rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.2em 1.2em', 
                paddingRight: '2.5rem' 
              }}
            >
              <option value="Theory">Theory Course</option>
              <option value="Theory+Lab">Theory + Lab Course</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Assessment Components Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Component Inputs</h2>
            <p className="text-sm text-gray-400 mb-6">Enter scores obtained, max total marks, and weightages for each component.</p>
            
            <div className="space-y-6">
              {currentComponents.map((comp) => {
                const fields = inputs[comp.key];
                const scaled = getScaledContribution(comp.key);
                return (
                  <div 
                    key={comp.key}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 transition-all duration-300"
                  >
                    <h4 className="text-base font-semibold text-white mb-3">{comp.label}</h4>
                    <div className="grid grid-cols-4 gap-3 items-end">
                      {/* Scored Input */}
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Scored</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="e.g. 16"
                          value={fields.scored}
                          onChange={(e) => handleInputChange(comp.key, 'scored', e.target.value)}
                          className={getInputClass(fields.scored)}
                        />
                      </div>
                      
                      {/* Out of Input */}
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Out of</label>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          placeholder="e.g. 20"
                          value={fields.outOf}
                          onChange={(e) => handleInputChange(comp.key, 'outOf', e.target.value)}
                          className={getInputClass(fields.outOf)}
                        />
                      </div>

                      {/* Scaled For Weightage Input */}
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Scaled For</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder={`e.g. ${comp.defaultScale}`}
                          value={fields.scaledFor}
                          onChange={(e) => handleInputChange(comp.key, 'scaledFor', e.target.value)}
                          className={getInputClass(fields.scaledFor)}
                        />
                      </div>

                      {/* Scaled Value Output Field */}
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Scaled Score</label>
                        <div className="w-full px-2.5 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-yellow-400 text-center font-bold">
                          {scaled !== null ? scaled.toFixed(2) : '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Validation Messages inside left card */}
            {!isValid && validation.type !== 'initial' && (
              <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{validation.message}</p>
              </div>
            )}

            {/* Weightage Warning */}
            {!isValid && validation.type === 'warning' && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-950/20 border border-yellow-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">{validation.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Expected Grade Results Card & Grade Reference */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Your Expected Grade Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-xl font-bold text-white mb-6">Your Expected Grade</h3>

            {!isValid ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium max-w-xs text-sm">
                  Please enter all assessment marks on the left to see your predicted final grade.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                
                {/* SVG circular progress */}
                <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-white/5"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`${getGradeStyle(expectedGrade).stroke} transition-all duration-700 ease-out`}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - totalPercentage / 100)}
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 6px ${getGradeStyle(expectedGrade).glow})`
                      }}
                    />
                  </svg>
                  
                  {/* Inside Circle text */}
                  <div className="text-center z-10">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected</span>
                    <span className={`block text-5xl font-black ${getGradeStyle(expectedGrade).text}`}>
                      {expectedGrade}
                    </span>
                    <span className="block text-xs font-semibold text-gray-300 mt-1">
                      {totalPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* ESE Minimum Rule Failure Message */}
                {isEseFailed && (
                  <div className="w-full p-4 mb-4 rounded-xl bg-red-950/20 border border-red-500/20 text-center">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Threshold Failure</p>
                    <p className="text-xs text-red-200">
                      You scored {esePercentage.toFixed(1)}% in ESE. A minimum of 40% in ESE is required to pass, resulting in an RA grade.
                    </p>
                  </div>
                )}

                {/* Expected Grade Summary Text */}
                <div className="w-full text-center mt-2 mb-6">
                  <span className="text-sm font-semibold text-gray-200">
                    {isEseFailed 
                      ? 'Re-Appearance (RA) required due to ESE failure.' 
                      : `Expected Grade: ${expectedGrade} with a final score of ${totalPercentage.toFixed(2)} / 100.`}
                  </span>
                </div>

                {/* Component contributions list */}
                <div className="w-full space-y-3 pt-4 border-t border-white/5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Component Contribution</span>
                  {contributions.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/[0.02]">
                      <span className="text-gray-400">{c.label} ({c.scaledFor}%)</span>
                      <span className="text-white font-semibold">
                        {c.contribution} / {c.scaledFor} <span className="text-[10px] text-cyan-400 font-medium">({c.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* Grade Boundaries Reference Grid */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Grade Reference Scale</h3>
            <div className="space-y-2.5">
              {GRADES_REFERENCE.map((ref) => (
                <div 
                  key={ref.letter}
                  className="flex justify-between items-center text-xs py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <span className={`font-bold text-sm ${ref.color}`}>{ref.letter}</span>
                  <span className="text-gray-300 font-medium">{ref.label}</span>
                  <span className="text-gray-400 bg-white/5 px-2 py-0.5 rounded font-mono">{ref.range}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ExpectedGradeCalculator;
