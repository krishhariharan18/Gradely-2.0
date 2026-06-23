import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Award, Info, Check, X, AlertTriangle, Target, BookOpen, Sparkles } from 'lucide-react';

function GpaBalancer({ programs, semesters }) {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [completedSemesters, setCompletedSemesters] = useState('');
  const [sgpaInputs, setSgpaInputs] = useState({}); // semesterNumber -> string
  const [targetCgpa, setTargetCgpa] = useState('');
  const [semesterCredits, setSemesterCredits] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState({}); // courseId -> array of grade letters
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Results of calculation
  const [calcDone, setCalcDone] = useState(false);
  const [calcResults, setCalcResults] = useState(null);

  // Grade Scale Points
  const GRADE_SCALE = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'P': 5,
    'RA': 0
  };

  const GRADE_COLORS = {
    'O': 'text-emerald-400 border-emerald-500/25 bg-emerald-950/20',
    'A+': 'text-teal-400 border-teal-500/25 bg-teal-950/20',
    'A': 'text-lime-400 border-lime-500/25 bg-lime-950/20',
    'B+': 'text-yellow-400 border-yellow-500/25 bg-yellow-950/20',
    'B': 'text-orange-400 border-orange-500/25 bg-orange-950/20',
    'P': 'text-gray-400 border-gray-500/25 bg-gray-950/20',
    'RA': 'text-red-400 border-red-500/25 bg-red-950/20'
  };

  // GPA Color & Glow Helpers
  // Color range: Red if 6 and below, Orange if 6-7.5, Light green if 7.5 to 9, Greenish Blue if 9 to 10
  const getGpaColorClass = (val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return 'text-white';
    if (v <= 6.0) return 'text-red-500';
    if (v <= 7.5) return 'text-orange-500';
    if (v <= 9.0) return 'text-lime-400';
    return 'text-cyan-400'; // Greenish Blue
  };

  const getGpaGlowClass = (val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return '';
    if (v <= 6.0) return 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (v <= 7.5) return 'drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    if (v <= 9.0) return 'drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]';
    return 'drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
  };

  // Helper to determine active border highlighting with yellow focus
  const getInputClass = (val) => {
    return `w-full px-3 py-2 bg-[#120a22] border rounded-lg text-sm text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_8px_rgba(234,179,8,0.3)] transition-all duration-300 ${
      val !== '' && val !== undefined ? 'border-yellow-500/40' : 'border-white/10'
    }`;
  };

  // Fetch Semester Credits when Program changes
  useEffect(() => {
    if (selectedProgram) {
      fetch(`http://localhost:5000/api/semester_credits?program_id=${selectedProgram}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setSemesterCredits(data);
          }
        })
        .catch(err => console.error("Error fetching semester credits:", err));
    } else {
      setSemesterCredits([]);
    }
  }, [selectedProgram]);

  // Fetch Courses when Completed Semesters changes
  useEffect(() => {
    if (selectedProgram && completedSemesters) {
      const nextSemNum = parseInt(completedSemesters) + 1;
      const semObj = semesters.find(s => s.semester_number === nextSemNum);
      const semesterId = semObj ? semObj.id : nextSemNum;

      fetch(`http://localhost:5000/api/courses?program_id=${selectedProgram}&semester_id=${semesterId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setCourses(data);
            // Default selected grade to ['O'] for all courses so calculation works immediately
            const initialGrades = {};
            data.forEach(course => {
              initialGrades[course.id] = ['O'];
            });
            setSelectedGrades(initialGrades);
            setCalcDone(false);
          } else {
            setCourses([]);
            setSelectedGrades({});
            setCalcDone(false);
          }
        })
        .catch(err => {
          console.error("Error fetching courses:", err);
          setCourses([]);
          setSelectedGrades({});
          setCalcDone(false);
        });
    } else {
      setCourses([]);
      setSelectedGrades({});
      setCalcDone(false);
    }
  }, [selectedProgram, completedSemesters, semesters]);

  // Track completed semester inputs
  const numSemesters = parseInt(completedSemesters) || 0;
  const semestersArray = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= numSemesters; i++) {
      arr.push(i);
    }
    return arr;
  }, [numSemesters]);

  // Reset inputs when completed semesters dropdown changes
  useEffect(() => {
    const inputs = {};
    for (let i = 1; i <= numSemesters; i++) {
      inputs[i] = '';
    }
    setSgpaInputs(inputs);
    setCalcDone(false);
  }, [completedSemesters]);

  const handleSgpaChange = (semNum, val) => {
    setSgpaInputs(prev => ({
      ...prev,
      [semNum]: val
    }));
    setCalcDone(false);
  };

  // Perform basic GPA balancing calculations (CGPA & Required SGPA)
  const basicCalculations = useMemo(() => {
    if (!completedSemesters || !selectedProgram) return null;

    // Check if all SGPA inputs are filled
    const sgpaValues = [];
    for (let i = 1; i <= numSemesters; i++) {
      const val = parseFloat(sgpaInputs[i]);
      if (isNaN(val) || val < 0 || val > 10) return null;
      sgpaValues.push(val);
    }

    const target = parseFloat(targetCgpa);
    if (isNaN(target) || target < 0 || target > 10) return null;

    let totalWeightedSgpa = 0;
    let totalCompletedCredits = 0;
    let fallback = false;

    // Calculate completed credits and weighted SGPA
    for (let i = 1; i <= numSemesters; i++) {
      const sgpa = sgpaValues[i - 1];
      const semObj = semesters.find(s => s.semester_number === i);
      const creditItem = semObj ? semesterCredits.find(c => c.semester_id === semObj.id) : null;
      const credits = creditItem ? parseInt(creditItem.total_credits) : 0;

      if (credits > 0) {
        totalWeightedSgpa += sgpa * credits;
        totalCompletedCredits += credits;
      } else {
        fallback = true;
      }
    }

    // Get current semester credits
    const nextSemNum = numSemesters + 1;
    const nextSemObj = semesters.find(s => s.semester_number === nextSemNum);
    const nextSemCreditItem = nextSemObj ? semesterCredits.find(c => c.semester_id === nextSemObj.id) : null;
    let nextSemCredits = nextSemCreditItem ? parseInt(nextSemCreditItem.total_credits) : 0;

    if (nextSemCredits === 0) {
      nextSemCredits = courses.reduce((acc, curr) => acc + curr.credits, 0);
    }

    let currentCgpa = 0;
    let requiredSgpa = 0;

    if (!fallback && totalCompletedCredits > 0 && nextSemCredits > 0) {
      currentCgpa = totalWeightedSgpa / totalCompletedCredits;
      const totalCredits = totalCompletedCredits + nextSemCredits;
      requiredSgpa = (target * totalCredits - totalWeightedSgpa) / nextSemCredits;
    } else {
      // Fallback simple average
      const sum = sgpaValues.reduce((a, b) => a + b, 0);
      currentCgpa = sum / numSemesters;
      requiredSgpa = target * (numSemesters + 1) - sum;
    }

    return {
      currentCgpa: parseFloat(currentCgpa.toFixed(2)),
      targetCgpa: target,
      requiredSgpa: parseFloat(requiredSgpa.toFixed(2)),
      nextSemCredits
    };
  }, [selectedProgram, completedSemesters, sgpaInputs, targetCgpa, semesterCredits, courses, semesters, numSemesters]);

  const handleToggleGrade = (courseId, grade) => {
    const current = selectedGrades[courseId] || [];
    if (current.includes(grade)) {
      if (current.length === 1) return; // Enforce minimum of 1
      setSelectedGrades(prev => ({
        ...prev,
        [courseId]: prev[courseId].filter(g => g !== grade)
      }));
    } else {
      if (current.length >= 2) return; // Enforce maximum of 2
      setSelectedGrades(prev => ({
        ...prev,
        [courseId]: [...prev[courseId], grade]
      }));
    }
    setCalcDone(false);
  };

  const handleCalculateCombinations = (e) => {
    e.preventDefault();
    if (!basicCalculations || courses.length === 0) return;

    // Check if every course has at least 1 selected grade
    const incompleteGrades = courses.some(c => !selectedGrades[c.id] || selectedGrades[c.id].length === 0);
    if (incompleteGrades) return;

    // Generate combinations recursively
    const allCombinations = [];
    const currentComb = [];

    const generate = (index) => {
      if (index === courses.length) {
        let totalPoints = 0;
        let totalCredits = 0;
        courses.forEach((course, i) => {
          const letter = currentComb[i];
          const gp = GRADE_SCALE[letter];
          totalPoints += gp * course.credits;
          totalCredits += course.credits;
        });

        const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
        
        // Map course details
        const details = courses.map((course, i) => ({
          course_name: course.course_name,
          credits: course.credits,
          grade: currentComb[i]
        }));

        allCombinations.push({
          sgpa: parseFloat(sgpa.toFixed(2)),
          courses: details
        });
        return;
      }

      const course = courses[index];
      const choices = selectedGrades[course.id] || ['O'];
      choices.forEach(g => {
        currentComb.push(g);
        generate(index + 1);
        currentComb.pop();
      });
    };

    generate(0);

    // Unique SGPAs sorted in ascending order
    const uniqueSgpasSet = new Set(allCombinations.map(c => c.sgpa));
    const uniqueSgpas = Array.from(uniqueSgpasSet).sort((a, b) => a - b);

    const minAchievable = uniqueSgpas[0] || 0;
    const maxAchievable = uniqueSgpas[uniqueSgpas.length - 1] || 0;
    const totalRange = maxAchievable - minAchievable;

    const reqSgpa = basicCalculations.requiredSgpa;
    const targetAchievable = reqSgpa <= maxAchievable && reqSgpa <= 10.0;

    let recommended = [];
    let maximizeResults = null;

    if (targetAchievable) {
      // Find combinations that meet or exceed required SGPA
      const validCombs = allCombinations.filter(c => c.sgpa >= reqSgpa);
      // Sort by SGPA ascending (minimal extra effort first)
      validCombs.sort((a, b) => a.sgpa - b.sgpa);

      // Select up to 3 distinct SGPA combinations
      const selectedSgpas = [];
      for (let i = 0; i < validCombs.length; i++) {
        const comb = validCombs[i];
        if (!selectedSgpas.includes(comb.sgpa)) {
          selectedSgpas.push(comb.sgpa);
          recommended.push(comb);
        }
        if (recommended.length === 3) break;
      }
      
      // If we don't have 3 unique SGPAs but have multiple combinations, fill with others
      if (recommended.length < 3) {
        for (let i = 0; i < validCombs.length; i++) {
          const comb = validCombs[i];
          if (!recommended.includes(comb)) {
            recommended.push(comb);
          }
          if (recommended.length === 3) break;
        }
      }
    } else {
      // Maximize mode results
      const bestComb = allCombinations.reduce((best, curr) => curr.sgpa > best.sgpa ? curr : best, allCombinations[0]);
      
      // Projected CGPA calculation using maxAchievable
      const N = parseInt(completedSemesters);
      const sgpaValues = semestersArray.map(i => parseFloat(sgpaInputs[i]) || 0);
      
      let totalWeightedSgpa = 0;
      let totalCompletedCredits = 0;
      let fallback = false;

      for (let i = 1; i <= N; i++) {
        const sgpa = sgpaValues[i - 1];
        const semObj = semesters.find(s => s.semester_number === i);
        const creditItem = semObj ? semesterCredits.find(c => c.semester_id === semObj.id) : null;
        const credits = creditItem ? parseInt(creditItem.total_credits) : 0;

        if (credits > 0) {
          totalWeightedSgpa += sgpa * credits;
          totalCompletedCredits += credits;
        } else {
          fallback = true;
        }
      }

      const totalCredits = totalCompletedCredits + basicCalculations.nextSemCredits;
      let projectedCgpa = 0;
      
      if (!fallback && totalCompletedCredits > 0 && basicCalculations.nextSemCredits > 0) {
        projectedCgpa = (totalWeightedSgpa + maxAchievable * basicCalculations.nextSemCredits) / totalCredits;
      } else {
        projectedCgpa = (sgpaValues.reduce((a, b) => a + b, 0) + maxAchievable) / (N + 1);
      }

      maximizeResults = {
        maxPossibleSgpa: maxAchievable,
        bestCombination: bestComb,
        projectedCgpa: parseFloat(projectedCgpa.toFixed(2))
      };
    }

    setCalcResults({
      allCombinations,
      uniqueSgpas,
      minAchievable,
      maxAchievable,
      totalRange: parseFloat(totalRange.toFixed(2)),
      targetAchievable,
      recommendedCombinations: recommended,
      maximizeResults
    });
    setCalcDone(true);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen">
      {/* Centered Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-poppins text-[36px] md:text-[46px] font-bold tracking-tight leading-tight mb-4 text-white">
          <span className="text-orange-500 select-none drop-shadow-[0_0_12px_rgba(249,115,22,0.55)] font-extrabold">GPA</span> Balancer
        </h1>
        <p className="text-gray-300 text-base md:text-lg font-normal leading-relaxed opacity-95">
          Enter previous semester SGPA values, set a target CGPA, and discover the grades required in your current courses to achieve your academic goals.
        </p>
      </div>

      {/* Academic Input Panel - Full Width Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-cyan-400" />
          <span>Academic Input Panel</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Side */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Program Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Select Program</label>
                <div className="relative">
                  <select
                    value={selectedProgram}
                    onChange={(e) => {
                      setSelectedProgram(e.target.value);
                      setCalcDone(false);
                    }}
                    className="w-full px-4 py-2.5 bg-[#160d29]/90 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 backdrop-blur-md appearance-none"
                    style={{ 
                      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%23a855f7\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', 
                      backgroundPosition: 'right 1rem center', 
                      backgroundRepeat: 'no-repeat', 
                      backgroundSize: '1.2em 1.2em', 
                      paddingRight: '2.5rem' 
                    }}
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.program_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Completed Semesters Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Completed Semesters</label>
                <div className="relative">
                  <select
                    value={completedSemesters}
                    onChange={(e) => {
                      setCompletedSemesters(e.target.value);
                      setCalcDone(false);
                    }}
                    className="w-full px-4 py-2.5 bg-[#160d29]/90 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 backdrop-blur-md appearance-none"
                    style={{ 
                      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%23a855f7\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', 
                      backgroundPosition: 'right 1rem center', 
                      backgroundRepeat: 'no-repeat', 
                      backgroundSize: '1.2em 1.2em', 
                      paddingRight: '2.5rem' 
                    }}
                  >
                    <option value="">Select Completed Semesters</option>
                    <option value="1">1 Completed Semester</option>
                    <option value="2">2 Completed Semesters</option>
                    <option value="3">3 Completed Semesters</option>
                    <option value="4">4 Completed Semesters</option>
                    <option value="5">5 Completed Semesters</option>
                    <option value="6">6 Completed Semesters</option>
                    <option value="7">7 Completed Semesters</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SGPA Input Fields */}
            {numSemesters > 0 && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Enter Semester SGPAs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {semestersArray.map((semNum) => (
                    <div key={semNum}>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Semester {semNum} SGPA</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="e.g. 8.50"
                        value={sgpaInputs[semNum] || ''}
                        onChange={(e) => handleSgpaChange(semNum, e.target.value)}
                        className={getInputClass(sgpaInputs[semNum])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target CGPA Input */}
            {numSemesters > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Target CGPA</label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="e.g. 9.00"
                    value={targetCgpa}
                    onChange={(e) => {
                      setTargetCgpa(e.target.value);
                      setCalcDone(false);
                    }}
                    className={getInputClass(targetCgpa)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Card Column (Glows orange with orange border) */}
          <div className="lg:col-span-4 h-full">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)] backdrop-blur-md h-full flex flex-col justify-center min-h-[220px]">
              <h3 className="text-base font-bold text-white mb-4 uppercase tracking-widest text-center border-b border-white/5 pb-2">
                Academic Targets
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-400">Current CGPA:</span>
                  <span className="text-xl font-bold text-cyan-400">
                    {basicCalculations ? basicCalculations.currentCgpa.toFixed(2) : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-400">Target CGPA:</span>
                  <span className="text-xl font-bold text-cyan-400">
                    {basicCalculations ? basicCalculations.targetCgpa.toFixed(2) : '--'}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/5 flex flex-col items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                    Required SGPA This Semester
                  </span>
                  <span className="text-5xl font-extrabold select-none text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.65)]">
                    {basicCalculations ? (basicCalculations.requiredSgpa < 0 ? '0.00' : basicCalculations.requiredSgpa.toFixed(2)) : '--'}
                  </span>
                  {basicCalculations && basicCalculations.requiredSgpa > 10 && (
                    <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Exceeds maximum 10.0 limit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout (Grade Planning vs. Results & Analysis) */}
      {selectedProgram && completedSemesters && courses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Grade Planning & Course Selection */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Grade Selection Card (Fully listed, no scrollbar, Orange Calculate button below) */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative z-20">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Select Your Possible Grades for Each Course</span>
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                For every course in the current semester, select between 1 and 2 grades representing the realistic range of grades you expect to achieve.
              </p>

              {/* Courses list fully rendered, no outer scrollbar wrapper */}
              <div className="w-full">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="py-3 px-2">Course Name</th>
                      <th className="py-3 px-2 text-center">Credits</th>
                      <th className="py-3 px-2 text-right">Grade Range (Min 1, Max 2)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {courses.map((course, idx) => {
                      const selected = selectedGrades[course.id] || [];
                      const isDropdownOpen = openDropdownId === course.id;
                      const isLastCourse = idx === courses.length - 1;
                      
                      return (
                        <tr key={course.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-2 font-medium text-white max-w-[200px] truncate" title={course.course_name}>
                            {course.course_name}
                          </td>
                          <td className="py-4 px-2 text-center text-cyan-400 font-semibold">
                            {course.credits}
                          </td>
                          <td className="py-4 px-2 text-right relative">
                            {/* Custom Grade Range Dropdown Button */}
                            <button
                              type="button"
                              onClick={() => setOpenDropdownId(isDropdownOpen ? null : course.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#120a22] border border-white/10 hover:border-cyan-400/50 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all min-w-[120px] justify-between cursor-pointer"
                            >
                              <span className="truncate">
                                {selected.length === 0 ? 'Select' : selected.join(', ')}
                              </span>
                              <span className="text-[9px] text-cyan-400">▼</span>
                            </button>

                            {/* Dropdown Options Popup (Drops up if last course to prevent blocking) */}
                            {isDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                                <div className={`absolute right-2 w-44 bg-[#1b112b] border border-white/20 rounded-xl shadow-2xl p-2 z-40 backdrop-blur-md text-left ${
                                  isLastCourse ? 'bottom-full mb-1' : 'mt-1'
                                }`}>
                                  <div className="text-[10px] text-gray-400 font-bold px-2 py-1 uppercase border-b border-white/5 mb-1">
                                    Choose 1 or 2 grades
                                  </div>
                                  {Object.keys(GRADE_SCALE).map((g) => {
                                    const isChecked = selected.includes(g);
                                    return (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={() => handleToggleGrade(course.id, g)}
                                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all flex items-center justify-between hover:bg-white/5 ${
                                          isChecked ? 'text-cyan-400 font-bold bg-cyan-950/20' : 'text-gray-300'
                                        }`}
                                      >
                                        <span>{g} ({GRADE_SCALE[g]} Pts)</span>
                                        {isChecked && <span className="text-[10px] text-cyan-400">✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Orange Calculate Button directly below the form */}
              <div className="mt-6">
                <button
                  onClick={handleCalculateCombinations}
                  disabled={!basicCalculations}
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg text-center flex items-center justify-center gap-2 cursor-pointer ${
                    basicCalculations
                      ? 'bg-orange-500 text-slate-950 hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.45)] hover:scale-[1.01]'
                      : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                  <span>Calculate Combinations</span>
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic">
                * Note: Select only realistic grade ranges for accurate analysis. Choose between 1 and 2 possible grades per course.
              </p>
            </div>

            {/* Compact Grade Selection Summary Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-6 relative z-10">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Grade Selection Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course) => {
                  const selected = selectedGrades[course.id] || [];
                  return (
                    <div key={course.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:scale-[1.01] transition-transform">
                      <div className="mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase truncate" title={course.course_name}>
                          {course.course_name}
                        </h4>
                        <p className="text-[11px] text-cyan-400 font-semibold mt-0.5">{course.credits} Credits</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.map(g => (
                          <span key={g} className={`text-xs font-bold px-2 py-0.5 rounded border ${GRADE_COLORS[g] || 'text-white'}`}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Results & Analysis */}
          <div className="lg:col-span-6 space-y-6">
            {!calcDone ? (
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] animate-pulse">
                  <Calculator className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Run Analysis Engine</h4>
                <p className="text-gray-400 text-sm max-w-sm">
                  Complete the academic input details and click "Calculate Combinations" to analyze grade configurations and discover optimized pathways.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Required SGPA Analysis Card (Orange border and orange glow) */}
                <div className="p-6 md:p-8 rounded-3xl border border-orange-500/30 shadow-[0_0_22px_rgba(249,115,22,0.2)] bg-[#1b112b]/80 backdrop-blur-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-6 h-6 text-orange-400" />
                      <span>Required SGPA Analysis</span>
                    </h3>
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                      !calcResults.targetAchievable
                        ? 'text-red-400 border-red-500/30 bg-red-950/20'
                        : basicCalculations.requiredSgpa > 8.5
                        ? 'text-orange-400 border-orange-500/30 bg-orange-950/20'
                        : 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                    }`}>
                      {!calcResults.targetAchievable ? 'Impossible' : basicCalculations.requiredSgpa > 8.5 ? 'Challenging' : 'Achievable'}
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Required Semester SGPA
                    </p>
                    <span className={`text-6xl font-extrabold select-none ${getGpaColorClass(basicCalculations.requiredSgpa)} ${getGpaGlowClass(basicCalculations.requiredSgpa)}`}>
                      {basicCalculations.requiredSgpa < 0 ? '0.00' : basicCalculations.requiredSgpa.toFixed(2)}
                    </span>
                    <p className="text-sm text-gray-300 mt-3 max-w-md mx-auto">
                      {calcResults.targetAchievable 
                        ? (basicCalculations.requiredSgpa > 8.5
                            ? `Highly challenging target! You must score an SGPA of ${basicCalculations.requiredSgpa.toFixed(2)} or above to achieve your target CGPA of ${basicCalculations.targetCgpa.toFixed(2)}.`
                            : `Achievable target! Score an SGPA of ${basicCalculations.requiredSgpa.toFixed(2)} or above this semester to successfully reach your target CGPA of ${basicCalculations.targetCgpa.toFixed(2)}.`)
                        : `Your target CGPA of ${basicCalculations.targetCgpa.toFixed(2)} is mathematically impossible to achieve this semester with your current academic history and selected grade range.`}
                    </p>
                  </div>
                </div>

                {/* Achievable View vs Maximize Mode View */}
                {calcResults.targetAchievable ? (
                  <>
                    {/* All Possible SGPA Values table */}
                    <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                      <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
                        All Possible SGPA Values
                      </h3>

                      <div className="overflow-y-auto max-h-[220px] rounded-xl border border-white/5 bg-[#120a22]/50 p-2 mb-4 scrollbar-thin">
                        <table className="w-full text-left text-sm text-gray-300">
                          <thead>
                            <tr className="text-xs text-gray-400 border-b border-white/5">
                              <th className="py-2 px-3">SGPA Combination Value</th>
                              <th className="py-2 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {calcResults.uniqueSgpas.map((val) => {
                              const meetsTarget = val >= basicCalculations.requiredSgpa;
                              return (
                                <tr key={val} className={`transition-colors ${meetsTarget ? 'bg-cyan-500/[0.03]' : ''}`}>
                                  <td className="py-2.5 px-3">
                                    <span className={`font-mono text-base font-bold ${getGpaColorClass(val)}`}>
                                      {val.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {meetsTarget ? (
                                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/25 px-2 py-0.5 rounded">
                                        Meets Target
                                      </span>
                                    ) : (
                                      <span className="text-xs font-medium text-gray-500 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded">
                                        Below Target
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Min SGPA</p>
                          <p className={`text-base font-bold mt-1 ${getGpaColorClass(calcResults.minAchievable)}`}>
                            {calcResults.minAchievable.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Max SGPA</p>
                          <p className={`text-base font-bold mt-1 ${getGpaColorClass(calcResults.maxAchievable)}`}>
                            {calcResults.maxAchievable.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/10">
                          <p className="text-[10px] text-orange-400 font-bold uppercase">Range</p>
                          <p className="text-base font-bold text-orange-400 mt-1">{calcResults.totalRange.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Grade Combinations (Orange border and glow) */}
                    <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span>Recommended Grade Combinations</span>
                      </h3>
                      <p className="text-xs text-gray-400 mb-6">
                        Optimized grade mappings that meet or slightly exceed your target SGPA of {basicCalculations.requiredSgpa.toFixed(2)}:
                      </p>

                      <div className="space-y-4">
                        {calcResults.recommendedCombinations.map((comb, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-orange-500/30 hover:border-orange-400/60 shadow-[0_0_12px_rgba(249,115,22,0.15)] transition-all">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                              <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">
                                Option {idx + 1}
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] text-gray-400 font-semibold">Estimated SGPA:</span>
                                <span className={`text-lg font-extrabold font-mono ${getGpaColorClass(comb.sgpa)}`}>
                                  {comb.sgpa.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {comb.courses.map((c, cIdx) => (
                                <div key={cIdx} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-300 truncate max-w-[200px]">{c.course_name}</span>
                                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${GRADE_COLORS[c.grade] || 'text-white'}`}>
                                    {c.grade}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Maximize Mode (Failure state with custom orange borders) */}
                    <div className="p-6 md:p-8 rounded-3xl bg-red-950/10 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)] backdrop-blur-md space-y-6">
                      <div className="flex items-center gap-3 border-b border-red-500/25 pb-3">
                        <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                        <div>
                          <h3 className="text-xl font-bold text-white">Maximize Mode Activated</h3>
                          <p className="text-xs text-red-200 mt-0.5">Your target is out of range. Let's aim for the best-case projection instead.</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 leading-relaxed">
                        Although the target CGPA of <strong className="text-white">{basicCalculations.targetCgpa.toFixed(2)}</strong> is mathematically impossible to reach this semester with your academic history, we can still aim to maximize your grade point average to build a solid springboard for upcoming semesters.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            Max Achievable SGPA
                          </p>
                          <span className={`text-3xl font-extrabold font-mono ${getGpaColorClass(calcResults.maximizeResults.maxPossibleSgpa)}`}>
                            {calcResults.maximizeResults.maxPossibleSgpa.toFixed(2)}
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            Projected CGPA
                          </p>
                          <span className={`text-3xl font-extrabold font-mono ${getGpaColorClass(calcResults.maximizeResults.projectedCgpa)}`}>
                            {calcResults.maximizeResults.projectedCgpa.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#120a22] border border-white/10">
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                          Best-Case Grade Combination Required
                        </h4>
                        <div className="space-y-2">
                          {calcResults.maximizeResults.bestCombination.courses.map((c, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-300 truncate max-w-[200px]">{c.course_name}</span>
                              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${GRADE_COLORS[c.grade] || 'text-white'}`}>
                                {c.grade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/20 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-orange-400 mb-1">Stay Motivated!</h4>
                          <p className="text-xs text-orange-100 leading-relaxed">
                            Don't be discouraged! By scoring your maximum possible SGPA of {calcResults.maximizeResults.maxPossibleSgpa.toFixed(2)}, you will lift your cumulative average to {calcResults.maximizeResults.projectedCgpa.toFixed(2)}. Focus on high-credit subjects and execute perfectly!
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default GpaBalancer;
