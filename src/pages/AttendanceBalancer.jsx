import React, { useState } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';

function AttendanceBalancer() {
  const [credits, setCredits] = useState(3);
  const [conducted, setConducted] = useState('');
  const [missed, setMissed] = useState('');
  
  // Results and calculation states
  const [calculated, setCalculated] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Credit to total classes mappings
  const CREDIT_MAPPINGS = {
    1: 15,
    2: 30,
    3: 45,
    4: 60
  };

  const totalClasses = CREDIT_MAPPINGS[credits];

  // Helper to check if a specific field has validation error
  const hasError = (field) => !!validationErrors[field];

  // Input styling dynamic class builder
  const getInputClass = (val, field) => {
    const errorState = hasError(field);
    return `w-full px-4 py-3 bg-[#120a22] border rounded-xl text-base text-white focus:outline-none transition-all duration-300 ${
      errorState
        ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_8px_rgba(239,68,68,0.4)]'
        : val !== ''
        ? 'border-rose-500/40 focus:border-rose-400 focus:shadow-[0_0_8px_rgba(244,63,94,0.3)]'
        : 'border-white/10 focus:border-rose-400 focus:shadow-[0_0_8px_rgba(244,63,94,0.3)]'
    }`;
  };

  // Perform calculations on Calculate button click
  const handleCalculate = (e) => {
    e.preventDefault();
    const errors = {};

    const condVal = parseFloat(conducted);
    const missVal = parseFloat(missed);

    if (conducted === '' || isNaN(condVal)) {
      errors.conducted = 'Please enter the number of classes conducted.';
    } else if (condVal <= 0) {
      errors.conducted = 'Classes conducted so far must be greater than zero.';
    } else if (condVal < 0 || !Number.isInteger(condVal)) {
      errors.conducted = 'Please enter a valid positive integer.';
    } else if (condVal > totalClasses) {
      errors.conducted = `Classes conducted so far cannot exceed the total classes (${totalClasses}).`;
    }

    if (missed === '' || isNaN(missVal)) {
      errors.missed = 'Please enter the number of classes missed.';
    } else if (missVal < 0) {
      errors.missed = 'Classes missed cannot be negative.';
    } else if (!Number.isInteger(missVal)) {
      errors.missed = 'Please enter a valid integer for classes missed.';
    } else if (missVal > totalClasses) {
      errors.missed = `Classes missed cannot exceed the total classes (${totalClasses}).`;
    }

    if (!errors.conducted && !errors.missed && missVal > condVal) {
      errors.missed = 'Classes missed cannot exceed classes conducted so far.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setCalculated(false);
      return;
    }

    // If valid, clear errors and set calculated to true
    setValidationErrors({});
    setCalculated(true);
  };

  // Reset calculator states
  const handleReset = () => {
    setConducted('');
    setMissed('');
    setCalculated(false);
    setValidationErrors({});
  };

  // Calculate results if calculated is true
  let attended = 0;
  let attendancePct = 0;
  let remainingClasses = 0;
  let progressColor = 'stroke-rose-500';
  let glowColor = 'rgba(244, 63, 94, 0.45)';
  let statusText = 'Critical Alert';
  let statusColor = 'text-rose-400';
  let isUnderThreshold = true;
  let classesNeededToReach75 = 0;
  let maxPossiblePct = 0;
  let isReachable = true;
  let allowedBunk = 0;
  let totalAllowedMissed = 0;
  let bunkProgressPct = 0;

  if (calculated) {
    const condNum = parseInt(conducted, 10);
    const missNum = parseInt(missed, 10);
    attended = condNum - missNum;
    attendancePct = condNum > 0 ? (attended / condNum) * 100 : 0;
    remainingClasses = Math.max(0, totalClasses - condNum);

    // Determine attendance zone and status
    if (attendancePct >= 80) {
      progressColor = 'stroke-emerald-500';
      glowColor = 'rgba(16, 185, 129, 0.45)';
      statusText = 'Excellent';
      statusColor = 'text-emerald-400';
      isUnderThreshold = false;
    } else if (attendancePct >= 75) {
      progressColor = 'stroke-amber-500';
      glowColor = 'rgba(245, 158, 11, 0.45)';
      statusText = 'Caution';
      statusColor = 'text-amber-400';
      isUnderThreshold = false;
    } else {
      progressColor = 'stroke-rose-500';
      glowColor = 'rgba(244, 63, 94, 0.45)';
      statusText = 'Critical Alert';
      statusColor = 'text-rose-400';
      isUnderThreshold = true;
    }

    // Required classes to reach 75% (if below)
    if (isUnderThreshold) {
      // (attended + x) / (conducted + x) >= 0.75
      // attended + x >= 0.75 * conducted + 0.75 * x
      // 0.25 * x >= 0.75 * conducted - attended
      // x >= 3 * conducted - 4 * attended
      const x = Math.ceil(3 * condNum - 4 * attended);
      classesNeededToReach75 = Math.max(0, x);

      // Max possible attendance in semester:
      // if they attend all remaining classes
      maxPossiblePct = ((attended + remainingClasses) / Math.max(totalClasses, condNum)) * 100;

      // Check if it is possible to reach 75%
      // It is possible if remainingClasses is enough, meaning classesNeededToReach75 <= remainingClasses
      isReachable = classesNeededToReach75 <= remainingClasses && maxPossiblePct >= 75;
    }

    // Maximum Classes to Bunk Card
    // Total allowed missed classes for the semester = 25% of total classes
    totalAllowedMissed = Math.floor(0.25 * Math.max(totalClasses, condNum));
    allowedBunk = Math.max(0, totalAllowedMissed - missNum);
    bunkProgressPct = totalAllowedMissed > 0 ? (missNum / totalAllowedMissed) * 100 : 0;
  }

  return (
    <div className="pt-24 pb-12 min-h-screen">
      {/* Centered Heading */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="font-poppins text-[36px] md:text-[46px] font-bold tracking-tight leading-tight mb-4 text-white">
          <span className="text-rose-400 select-none drop-shadow-[0_0_12px_rgba(244,63,94,0.55)] font-extrabold">Attendance</span> Balancer
        </h1>
        <p className="text-gray-300 text-base md:text-lg font-normal leading-relaxed opacity-95 max-w-2xl mx-auto">
          Monitor your course attendance, check if you meet the 75% threshold, and calculate how many classes you can afford to miss (bunk) or must attend to stay eligible.
        </p>
      </div>

      {/* Credit Selection Pill Group */}
      <div className="flex flex-col justify-center items-center mb-8 max-w-xl mx-auto">
        <label className="block text-sm font-semibold text-gray-400 mb-3 text-center">Course Credit Weightage</label>
        
        {/* Pills */}
        <div className="flex bg-[#140c26] p-1.5 rounded-2xl border border-white/10 mb-4 w-full justify-between">
          {[1, 2, 3, 4].map((cred) => (
            <button
              key={cred}
              onClick={() => {
                setCredits(cred);
                // Reset calculated state if credits change to ensure fresh calculate click
                setCalculated(false);
                // Dynamically cap existing inputs to the new limit
                const newTotal = CREDIT_MAPPINGS[cred];
                setConducted((prev) => {
                  if (prev !== '') {
                    const val = parseInt(prev, 10);
                    if (val > newTotal) return String(newTotal);
                  }
                  return prev;
                });
                setMissed((prev) => {
                  if (prev !== '') {
                    const val = parseInt(prev, 10);
                    if (val > newTotal) return String(newTotal);
                  }
                  return prev;
                });
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                credits === cred
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {cred} {cred === 1 ? 'Credit' : 'Credits'}
            </button>
          ))}
        </div>

        {/* Glassmorphic Total Classes Strip */}
        <div className="w-full py-3 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center shadow-lg">
          <span className="text-sm text-gray-300">
            Total Classes for the Semester:{' '}
            <strong className="text-lg font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] ml-1">
              {totalClasses}
            </strong>{' '}
            classes · <span className="text-gray-400">{credits} {credits === 1 ? 'credit' : 'credits'}</span>
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Card & Attendance Summary */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Enter Your Current Attendance Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Enter Your Current Attendance</h2>
            <p className="text-sm text-gray-400 mb-6">Input current conducted classes and missed classes to calculate your stand.</p>

            <form onSubmit={handleCalculate} className="space-y-5" noValidate>
              {/* Conducted Classes Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Classes Conducted So Far
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalClasses}
                  step="1"
                  placeholder="e.g. 24"
                  value={conducted}
                  onChange={(e) => {
                    setConducted(e.target.value);
                    setCalculated(false);
                    // Clear error immediately on edit
                    if (validationErrors.conducted) {
                      setValidationErrors(prev => ({ ...prev, conducted: null }));
                    }
                  }}
                  className={getInputClass(conducted, 'conducted')}
                />
                {hasError('conducted') && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 mt-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs font-semibold text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{validationErrors.conducted}</span>
                  </div>
                )}
              </div>

              {/* Missed Classes Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Classes Missed
                </label>
                <input
                  type="number"
                  min="0"
                  max={conducted !== '' ? Math.min(totalClasses, parseInt(conducted, 10)) : totalClasses}
                  step="1"
                  placeholder="e.g. 4"
                  value={missed}
                  onChange={(e) => {
                    setMissed(e.target.value);
                    setCalculated(false);
                    // Clear error immediately on edit
                    if (validationErrors.missed) {
                      setValidationErrors(prev => ({ ...prev, missed: null }));
                    }
                  }}
                  className={getInputClass(missed, 'missed')}
                />
                {hasError('missed') && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 mt-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs font-semibold text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{validationErrors.missed}</span>
                  </div>
                )}
              </div>

              {/* Calculate & Reset Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(225,29,72,0.35)] hover:shadow-[0_0_22px_rgba(225,29,72,0.55)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate
                </button>
                {(conducted !== '' || missed !== '' || calculated) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-rose-400/35 rounded-xl font-semibold text-gray-300 hover:text-white transition-all duration-300 cursor-pointer"
                    aria-label="Reset fields"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Your Attendance Summary Card (Visible after calculation) */}
          {calculated && (
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-6">Your Attendance Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Attended Classes */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Classes Attended</span>
                  <span className="text-3xl font-extrabold text-white">
                    {attended}
                  </span>
                </div>

                {/* Missed Classes */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Classes Missed</span>
                  <span className="text-3xl font-extrabold text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]">
                    {missed}
                  </span>
                </div>

                {/* Conducted So Far */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Classes Conducted</span>
                  <span className="text-3xl font-extrabold text-white">
                    {conducted}
                  </span>
                </div>

                {/* Remaining Classes */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining Classes</span>
                  <span className="text-3xl font-extrabold text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.3)]">
                    {remainingClasses}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Calculations & Outputs */}
        <div className="lg:col-span-6 space-y-6">
          
          {!calculated ? (
            /* Right Column Placeholder Card */
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center py-16 text-center min-h-[350px]">
              <div className="w-16 h-16 rounded-3xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                <Calculator className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Awaiting Analysis</h3>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                Enter your current attendance details in the form on the left and click Calculate to see a full balancing breakdown and action plan.
              </p>
            </div>
          ) : (
            /* Results Panel (Animated show) */
            <div className="space-y-6 transition-all duration-500 animate-fadeIn">
              
              {/* Alert Box (If attendance is below 75%) */}
              {isUnderThreshold && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-200 flex items-start gap-3 shadow-lg shadow-rose-950/20">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs md:text-sm">
                    <strong className="font-bold text-rose-300 block mb-0.5">Critical Attendance Warning!</strong>
                    Your current attendance is below the mandatory 75% threshold. Please consult your faculty coordinator immediately to explain absences.
                  </div>
                </div>
              )}

              {/* Your Current Attendance Percentage Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-xl font-bold text-white mb-6">Your Current Attendance</h3>

                <div className="flex flex-col items-center py-2">
                  {/* SVG Circular Progress Ring */}
                  <div className="relative w-40 h-40 flex items-center justify-center mb-5">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="41"
                        className="stroke-white/5"
                        strokeWidth="6.5"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="41"
                        className={`${progressColor} transition-all duration-1000 ease-out`}
                        strokeWidth="6.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 41}
                        strokeDashoffset={2 * Math.PI * 41 * (1 - attendancePct / 100)}
                        strokeLinecap="round"
                        style={{
                          filter: `drop-shadow(0 0 8px ${glowColor})`
                        }}
                      />
                    </svg>
                    
                    {/* Inner Text */}
                    <div className="text-center z-10">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Calculated</span>
                      <span className="block text-4xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                        {attendancePct.toFixed(1)}%
                      </span>
                      <span className="block text-[10px] text-gray-300 font-semibold mt-0.5">
                        {attended} / {conducted}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-center mt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                    <span className={`text-xl font-black ${statusColor} tracking-wide uppercase drop-shadow-sm`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conditional Card: Below 75% Zone */}
              {isUnderThreshold ? (
                <div className="p-6 md:p-8 rounded-3xl bg-rose-950/10 border-2 border-rose-500/25 backdrop-blur-md shadow-2xl relative overflow-hidden">
                  <h3 className="text-lg font-bold text-rose-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Classes Required to Reach 75%
                  </h3>
                  
                  {isReachable ? (
                    <div className="space-y-4 mt-4">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        To recover and pull your attendance back up to the minimum <strong className="text-white">75%</strong> requirement, you must attend:
                      </p>
                      
                      <div className="text-center py-3 bg-rose-950/20 border border-rose-500/20 rounded-2xl">
                        <span className="block text-4xl font-extrabold text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                          {classesNeededToReach75} <span className="text-lg font-semibold text-gray-300">classes</span>
                        </span>
                        <span className="text-xs font-semibold text-gray-400 mt-1 block">
                          consecutively from now on
                        </span>
                      </div>

                      <div className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-white/5 flex justify-between">
                        <span>Max Possible Attendance this Semester:</span>
                        <span className="font-bold text-cyan-400">{maxPossiblePct.toFixed(1)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-center">
                        <span className="text-base font-extrabold text-red-400 block mb-1 uppercase tracking-wide">
                          Target Unachievable
                        </span>
                        <p className="text-xs text-red-200 leading-relaxed">
                          Even if you attend all <strong className="text-white">{remainingClasses}</strong> remaining classes in the semester, the maximum attendance you can reach is:
                        </p>
                        <span className="text-3xl font-black text-red-400 mt-2 block drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                          {maxPossiblePct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Please discuss this with your course faculty. You will need an official waiver or medical attendance compensation to qualify for final exams.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Conditional Card: Above 75% Zone */
                <div className="p-6 md:p-8 rounded-3xl bg-emerald-950/10 border-2 border-emerald-500/25 backdrop-blur-md shadow-2xl flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    You're Above 75%
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mt-2">
                    Excellent standing! You have successfully maintained your attendance above the mandatory 75% threshold. Keep up the good performance to secure your final grade eligibility.
                  </p>
                </div>
              )}

              {/* Maximum Classes to Bunk Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-xl font-bold text-white mb-4">Maximum Classes to Bunk</h3>
                
                <div className="space-y-4">
                  {allowedBunk > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        You can safely afford to miss or bunk:
                      </p>
                      <div className="text-center py-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                        <span className="block text-4xl font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
                          {allowedBunk} <span className="text-lg font-semibold text-gray-300">classes</span>
                        </span>
                        <span className="text-xs font-semibold text-gray-400 mt-1 block">
                          without falling below the 75% threshold
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 text-center">
                      <span className="text-sm font-extrabold text-rose-400 block mb-1 uppercase tracking-wide">
                        No Absences Allowed
                      </span>
                      <p className="text-xs text-rose-200 leading-relaxed">
                        You cannot afford to miss any more classes this semester. Any further absences will push your attendance below 75%.
                      </p>
                    </div>
                  )}

                  {/* Missed vs Allowed Missed Progress Bar */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                      <span>Missed Classes Profile</span>
                      <span className={`font-bold ${bunkProgressPct >= 100 ? 'text-rose-400 animate-pulse' : 'text-gray-300'}`}>
                        {missed} / {totalAllowedMissed} allowed
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2.5 border border-white/5 relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                          bunkProgressPct >= 100
                            ? 'from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                            : bunkProgressPct >= 75
                            ? 'from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                        }`}
                        style={{ width: `${Math.min(100, bunkProgressPct)}%` }}
                      />
                    </div>
                    {bunkProgressPct > 100 && (
                      <span className="text-[10px] text-rose-400 font-bold block mt-1.5 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        You have exceeded your allowed missed classes budget by {parseInt(missed, 10) - totalAllowedMissed} classes!
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AttendanceBalancer;
