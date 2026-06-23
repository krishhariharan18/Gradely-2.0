import React, { useState } from 'react';
import { Calculator, Award, X, Check, Info } from 'lucide-react';

function RequiredEseCalculator() {
  // Input fields initialised to empty strings (blank) as requested
  const [ia1, setIa1] = useState({ scored: '', outOf: '' });
  const [mse, setMse] = useState({ scored: '', outOf: '' });
  const [ia2, setIa2] = useState({ scored: '', outOf: '' });

  // Selected target grade state, default to 'O'
  const [selectedGrade, setSelectedGrade] = useState('O');

  // Grade range configurations
  const GRADES_CONFIG = [
    { grade: 'O', label: 'O', range: '91-100', minRange: 91 },
    { grade: 'A+', label: 'A+', range: '81-90', minRange: 81 },
    { grade: 'A', label: 'A', range: '71-80', minRange: 71 },
    { grade: 'B+', label: 'B+', range: '61-70', minRange: 61 },
    { grade: 'B', label: 'B', range: '50-60', minRange: 50 },
    { grade: 'P', label: 'P', range: '41-50', minRange: 41 },
    { grade: 'RA', label: 'RA', range: '0-40', minRange: 0 }
  ];

  // Helper to scale score
  const getScaledScore = (scored, outOf, targetScale) => {
    const s = parseFloat(scored);
    const o = parseFloat(outOf);
    if (isNaN(s) || isNaN(o) || o <= 0) return null;
    return (s / o) * targetScale;
  };

  // Helper to check if a specific input is initialized
  const isInitial =
    ia1.scored === '' || ia1.outOf === '' ||
    mse.scored === '' || mse.outOf === '' ||
    ia2.scored === '' || ia2.outOf === '';

  // Validation function
  const validate = () => {
    if (isInitial) {
      return { valid: false, type: 'initial', message: 'Enter your assessment details to begin calculation.' };
    }

    const s1 = parseFloat(ia1.scored);
    const o1 = parseFloat(ia1.outOf);
    const s2 = parseFloat(mse.scored);
    const o2 = parseFloat(mse.outOf);
    const s3 = parseFloat(ia2.scored);
    const o3 = parseFloat(ia2.outOf);

    if (isNaN(s1) || isNaN(o1) || isNaN(s2) || isNaN(o2) || isNaN(s3) || isNaN(o3)) {
      return { valid: false, type: 'error', message: 'All inputs must contain numeric values.' };
    }

    if (s1 < 0 || o1 <= 0 || s2 < 0 || o2 <= 0 || s3 < 0 || o3 <= 0) {
      return { valid: false, type: 'error', message: 'Scores must be positive and total marks ("Out of") must be greater than zero.' };
    }

    if (s1 > o1) {
      return { valid: false, type: 'error', message: 'IA1 scored marks cannot exceed the total available marks.' };
    }
    if (s2 > o2) {
      return { valid: false, type: 'error', message: 'Mid Semester Exam scored marks cannot exceed the total available marks.' };
    }
    if (s3 > o3) {
      return { valid: false, type: 'error', message: 'IA2 scored marks cannot exceed the total available marks.' };
    }

    return { valid: true, type: 'success', message: null };
  };

  const validation = validate();
  const isValid = validation.valid;

  // Scaled calculations
  const ia1Scaled = getScaledScore(ia1.scored, ia1.outOf, 10);
  const mseScaled = getScaledScore(mse.scored, mse.outOf, 30);
  const ia2Scaled = getScaledScore(ia2.scored, ia2.outOf, 10);

  // Cumulative score excluding ESE
  const currentTotal = isValid
    ? (ia1Scaled + mseScaled + ia2Scaled).toFixed(2)
    : '0.00';

  // Calculate ESE marks requirements and status
  const getGradeStatus = (minRange, currentScoreNum) => {
    if (minRange === 0) {
      // RA is fail, always achievable
      return {
        required: 0,
        status: 'Already Achieved',
        statusLabel: 'Achieved / Pass',
        colorText: 'text-emerald-400',
        colorBorder: 'border-emerald-500/20 bg-emerald-950/10',
        feasibility: 100
      };
    }

    const rawRequired = (minRange - currentScoreNum) * 2;
    const maxPossible = currentScoreNum + 50;

    // Check if even with 100/100 ESE it's impossible to reach target marks
    if (maxPossible < minRange) {
      return {
        required: Math.ceil(rawRequired),
        status: 'Unachievable',
        statusLabel: 'Not Achievable',
        colorText: 'text-red-400',
        colorBorder: 'border-red-500/20 bg-red-950/10',
        feasibility: 0
      };
    }

    // Minimum required ESE mark to pass is 40.
    const requiredWithPassMark = Math.max(40, Math.ceil(rawRequired));

    // If the student already has enough internals to satisfy the grade, but they still need 40 ESE to pass the course.
    if (currentScoreNum >= minRange) {
      return {
        required: requiredWithPassMark,
        status: 'Already Achieved',
        statusLabel: 'Already Achieved',
        colorText: 'text-emerald-400',
        colorBorder: 'border-emerald-500/20 bg-emerald-950/10',
        feasibility: 100
      };
    }

    // Challenging if requires high ESE marks (> 75 out of 100)
    if (requiredWithPassMark > 75) {
      return {
        required: requiredWithPassMark,
        status: 'Challenging',
        statusLabel: 'Challenging',
        colorText: 'text-amber-400',
        colorBorder: 'border-amber-500/20 bg-amber-950/10',
        feasibility: Math.max(0, 100 - ((requiredWithPassMark - 40) / 60) * 100)
      };
    }

    // Achievable
    return {
      required: requiredWithPassMark,
      status: 'Achievable',
      statusLabel: 'Achievable',
      colorText: 'text-emerald-400',
      colorBorder: 'border-emerald-500/20 bg-emerald-950/10',
      feasibility: Math.max(0, 100 - ((requiredWithPassMark - 40) / 60) * 100)
    };
  };

  const handleInputChange = (component, field, value) => {
    const updater = component === 'ia1' ? setIa1 : component === 'mse' ? setMse : setIa2;
    updater(prev => ({ ...prev, [field]: value }));
  };

  // Helper to determine active border highlighting with yellow focus
  const getInputClass = (val) => {
    return `w-full px-3 py-2 bg-[#120a22] border rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_8px_rgba(234,179,8,0.3)] transition-all duration-300 ${
      val !== '' ? 'border-yellow-500/40' : 'border-white/10'
    }`;
  };

  // Find info of the currently selected target grade
  const selectedGradeObj = GRADES_CONFIG.find(g => g.grade === selectedGrade) || GRADES_CONFIG[0];
  const targetStatus = isValid
    ? getGradeStatus(selectedGradeObj.minRange, parseFloat(currentTotal))
    : null;

  return (
    <div className="pt-24 pb-12 min-h-screen">
      {/* Central Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-poppins text-[36px] md:text-[46px] font-bold tracking-tight leading-tight mb-4 text-white">
          <span className="text-emerald-400 select-none drop-shadow-[0_0_12px_rgba(52,211,153,0.55)] font-extrabold">Required ESE</span> Marks Calculator
        </h1>
        <p className="text-gray-300 text-base md:text-lg font-normal leading-relaxed opacity-95">
          Enter your current performance from other assessment components and calculate marks to be scored in your final examination.
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Assessment Components Inputs & Internals Total */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Components</h2>
            <p className="text-sm text-gray-400 mb-6">Provide Scored marks and Out Of total marks for all internal components.</p>
            
            <div className="space-y-6">
              {/* Internal Assessment 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-semibold text-white">Internal Assessment 1</h4>
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    Scaled: 10 Marks
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Scored</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 16"
                      value={ia1.scored}
                      onChange={(e) => handleInputChange('ia1', 'scored', e.target.value)}
                      className={getInputClass(ia1.scored)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Out of</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="e.g. 20"
                      value={ia1.outOf}
                      onChange={(e) => handleInputChange('ia1', 'outOf', e.target.value)}
                      className={getInputClass(ia1.outOf)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Scaled Score</label>
                    <div className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-cyan-400 text-center font-bold">
                      {ia1Scaled !== null ? ia1Scaled.toFixed(2) : '--'} / 10
                    </div>
                  </div>
                </div>
              </div>

              {/* Mid Semester Exam */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-semibold text-white">Mid Semester Exam</h4>
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    Scaled: 30 Marks
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Scored</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 40"
                      value={mse.scored}
                      onChange={(e) => handleInputChange('mse', 'scored', e.target.value)}
                      className={getInputClass(mse.scored)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Out of</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="e.g. 50"
                      value={mse.outOf}
                      onChange={(e) => handleInputChange('mse', 'outOf', e.target.value)}
                      className={getInputClass(mse.outOf)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Scaled Score</label>
                    <div className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-cyan-400 text-center font-bold">
                      {mseScaled !== null ? mseScaled.toFixed(2) : '--'} / 30
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Assessment 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-semibold text-white">Internal Assessment 2</h4>
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    Scaled: 10 Marks
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Scored</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 15"
                      value={ia2.scored}
                      onChange={(e) => handleInputChange('ia2', 'scored', e.target.value)}
                      className={getInputClass(ia2.scored)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Out of</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="e.g. 20"
                      value={ia2.outOf}
                      onChange={(e) => handleInputChange('ia2', 'outOf', e.target.value)}
                      className={getInputClass(ia2.outOf)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Scaled Score</label>
                    <div className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-cyan-400 text-center font-bold">
                      {ia2Scaled !== null ? ia2Scaled.toFixed(2) : '--'} / 10
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Feedback */}
            {!isValid && validation.type === 'error' && (
              <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{validation.message}</p>
              </div>
            )}
          </div>

          {/* Current Total Card Below Input Fields */}
          <div className="p-6 rounded-3xl bg-emerald-950/15 border-2 border-emerald-500/30 backdrop-blur-md shadow-[0_0_22px_rgba(16,185,129,0.15)] text-center transition-all duration-300 hover:scale-[1.01]">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
              Current Total (Without ESE)
            </p>
            <span className="text-5xl font-extrabold text-emerald-400 select-none drop-shadow-[0_0_12px_rgba(52,211,153,0.65)]">
              {isValid ? currentTotal : '--'} <span className="text-2xl font-semibold opacity-85">/ 50</span>
            </span>
            <p className="text-xs text-gray-400 mt-2.5">
              {isValid ? 'Cumulative weighted score from internal assessments.' : 'Please input values for all components to calculate cumulative score.'}
            </p>
          </div>
        </div>

        {/* Right Column: Required ESE Card, Target Selection & All Results */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top: Required ESE Marks Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-cyan-500/20 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
              <span>Required ESE Marks</span>
              <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 bg-white/5 border border-white/5 rounded-md">
                Target: {selectedGrade} ({selectedGradeObj.range})
              </span>
            </h3>

            {!isValid ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Calculator className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium max-w-xs text-sm">
                  Complete assessment scores on the left to show final exam requirements.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-center w-full">
                {targetStatus.status === 'Unachievable' ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.15)] mb-3 animate-pulse">
                      <X className="w-7 h-7 text-red-500" />
                    </div>
                    <span className="text-4xl font-extrabold text-red-500 tracking-tight drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                      Not Achievable
                    </span>
                    <p className="text-xs text-gray-300 mt-2 max-w-sm">
                      This grade is not achievable because it requires scoring more than 100 marks in the ESE.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <span className="text-5xl md:text-6xl font-extrabold tracking-tight select-none text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]">
                      {targetStatus.required} <span className="text-2xl font-semibold opacity-75">/ 100</span>
                    </span>
                    
                    <div className={`mt-3.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      targetStatus.status === 'Already Achieved' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30' :
                      targetStatus.status === 'Challenging' ? 'bg-amber-950/30 text-amber-400 border-amber-500/30' :
                      'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {targetStatus.statusLabel}
                    </div>

                    <p className="text-xs text-gray-400 mt-4 max-w-sm">
                      {targetStatus.status === 'Already Achieved' ? (
                        'Internals are already sufficient for this grade. You only need the minimum 40 marks in ESE to pass the course.'
                      ) : targetStatus.status === 'Challenging' ? (
                        'This grade requires a high performance in the final examination.'
                      ) : (
                        'Achievable by scoring standard passing marks (minimum 40) in the final examination.'
                      )}
                    </p>
                  </div>
                )}

                {/* Required ESE Marks Progress Bar out of 100 representing the score */}
                <div className="w-full mt-6">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Required ESE Marks Progress</span>
                    <span className={targetStatus.status === 'Unachievable' ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {targetStatus.status === 'Unachievable' ? 'Not Achievable' : `${targetStatus.required} / 100`}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 border border-white/5 relative">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        targetStatus.status === 'Unachievable'
                          ? 'from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                          : 'from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(52,211,153,0.75)]'
                      } transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(100, Math.max(0, targetStatus.required))}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Middle: Target Grade Selection */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Select Target Grade</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {GRADES_CONFIG.map((g) => {
                const isSelected = selectedGrade === g.grade;
                return (
                  <button
                    key={g.grade}
                    onClick={() => setSelectedGrade(g.grade)}
                    className={`flex flex-col items-center justify-center py-3.5 px-1.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/20 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] scale-[1.03]'
                        : 'bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className={`text-base font-bold ${isSelected ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>
                      {g.grade}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-1 select-none font-medium">
                      {g.range}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: Simultaneous Results Display for All Grades */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Results for All Grades</h3>
            
            {!isValid ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-gray-400 text-sm">
                  Enter component scores to view ESE marks required for all grade levels simultaneously.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GRADES_CONFIG.map((g) => {
                  const stats = getGradeStatus(g.minRange, parseFloat(currentTotal));
                  const isSelected = selectedGrade === g.grade;
                  
                  return (
                    <div
                      key={g.grade}
                      onClick={() => setSelectedGrade(g.grade)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${
                        isSelected
                          ? 'bg-emerald-950/15 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                          : 'bg-white/[0.02] border-white/10 hover:border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold text-white">{g.grade}</span>
                          <span className="text-[10px] text-gray-400">({g.range})</span>
                        </div>
                        
                        <div>
                          {stats.status === 'Unachievable' ? (
                            <span className="text-red-500 select-none">
                              <X size={16} className="stroke-[3px]" />
                            </span>
                          ) : (
                            <span className="text-emerald-400 select-none">
                              <Check size={16} className="stroke-[3px]" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-xs text-gray-400">Req. ESE:</span>
                        <span className={`text-base font-bold ${stats.status === 'Unachievable' ? 'text-red-400' : 'text-cyan-400'}`}>
                          {stats.status === 'Unachievable' ? 'Not Achievable' : `${stats.required} / 100`}
                        </span>
                      </div>

                      {/* Feasibility bar removed */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default RequiredEseCalculator;
