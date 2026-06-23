import React, { useState, useEffect } from 'react';
import { Calculator, Award } from 'lucide-react';

function SgpaCalculator({ programs, semesters }) {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState({}); // courseId -> { letter, point }
  const [sgpaResult, setSgpaResult] = useState(null);
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeOptions = [
    { letter: 'O', point: 10, label: 'O' },
    { letter: 'A+', point: 9, label: 'A+' },
    { letter: 'A', point: 8, label: 'A' },
    { letter: 'B+', point: 7, label: 'B+' },
    { letter: 'B', point: 6, label: 'B' },
    { letter: 'P', point: 5, label: 'P' },
    { letter: 'RA', point: 0, label: 'RA' }
  ];

  // Fetch Courses when Program & Semester are Selected
  useEffect(() => {
    if (selectedProgram && selectedSemester) {
      setLoading(true);
      setError('');
      setSgpaResult(null);
      setCalculated(false);
      setSelectedGrades({});
      fetch(`http://localhost:5000/api/courses?program_id=${selectedProgram}&semester_id=${selectedSemester}`)
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          if (!data.error) {
            setCourses(data);
          } else {
            setError(data.error);
            setCourses([]);
          }
        })
        .catch(err => {
          setLoading(false);
          setError("Failed to fetch courses. Make sure backend is running.");
          console.error("Error fetching courses:", err);
          setCourses([]);
        });
    } else {
      setCourses([]);
      setSelectedGrades({});
      setSgpaResult(null);
      setCalculated(false);
    }
  }, [selectedProgram, selectedSemester]);

  // Handle SGPA Calculation
  const handleCalculateSGPA = (e) => {
    e.preventDefault();
    if (courses.length === 0 || Object.keys(selectedGrades).length !== courses.length) return;

    let totalPoints = 0;
    let totalCredits = 0;
    
    courses.forEach(course => {
      const selected = selectedGrades[course.id];
      if (selected) {
        totalPoints += selected.point * course.credits;
        totalCredits += course.credits;
      }
    });

    const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    setSgpaResult(sgpa.toFixed(2));
    setCalculated(true);
  };

  const allGradesSelected = courses.length > 0 && Object.keys(selectedGrades).length === courses.length;

  const getSgpaRangeDetails = (val) => {
    const numVal = parseFloat(val);
    if (numVal <= 6.0) {
      return {
        colorClass: 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]',
        bgClass: 'bg-red-500',
        barGradient: 'from-red-600 to-red-400',
        message: 'Keep trying! Work hard to improve next time!',
        label: 'Needs Improvement'
      };
    } else if (numVal <= 7.5) {
      return {
        colorClass: 'text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]',
        bgClass: 'bg-orange-500',
        barGradient: 'from-orange-600 to-orange-400',
        message: 'Good effort! You can push even higher!',
        label: 'Satisfactory'
      };
    } else if (numVal <= 9.0) {
      return {
        colorClass: 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]',
        bgClass: 'bg-emerald-400',
        barGradient: 'from-emerald-500 to-emerald-300',
        message: 'Excellent Work! Great job!',
        label: 'Excellent'
      };
    } else {
      return {
        colorClass: 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]',
        bgClass: 'bg-cyan-400',
        barGradient: 'from-cyan-500 to-cyan-300',
        message: 'Outstanding Performance! Keep shining!',
        label: 'Outstanding'
      };
    }
  };

  const getGradeDistribution = () => {
    const distribution = {};
    Object.values(selectedGrades).forEach(grade => {
      if (grade && grade.letter) {
        distribution[grade.letter] = (distribution[grade.letter] || 0) + 1;
      }
    });

    const sortedKeys = ['O', 'A+', 'A', 'B+', 'B', 'P', 'RA'].filter(g => distribution[g] !== undefined);
    
    return sortedKeys.map(g => ({
      grade: g,
      count: distribution[g],
      percentage: (distribution[g] / courses.length) * 100
    }));
  };

  return (
    <div className="pt-20 pb-12">
      {/* Header & Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-4">
        <h1 className="font-poppins text-[38px] md:text-[46px] font-bold tracking-tight leading-none mb-3">
          <span className="text-purple-400 select-none drop-shadow-[0_0_15px_rgba(168,85,247,0.55)]">SGPA</span> Calculator
        </h1>
        <p className="text-white text-base md:text-lg font-normal leading-relaxed opacity-95">
          Select your semester details and enter grades to calculate your Semester Grade Point Average.
        </p>
      </div>

      {/* Dropdown Selectors */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-6 max-w-2xl mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
        {/* Program Dropdown */}
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-semibold text-gray-400 mb-2">Program</label>
          <div className="relative">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-4 py-3 bg-[#160d29]/90 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 backdrop-blur-md appearance-none"
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

        {/* Semester Dropdown */}
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-semibold text-gray-400 mb-2">Semester</label>
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-3 bg-[#160d29]/90 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 backdrop-blur-md appearance-none"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%23a855f7\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', 
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

      {/* Courses and Results section */}
      {!selectedProgram || !selectedSemester ? (
        <div className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md max-w-2xl mx-auto shadow-2xl transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center mb-4">
            <Calculator className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">No Selection Made</h3>
          <p className="text-gray-400 text-center max-w-md text-sm">
            Select a program and semester from the dropdowns above to view your courses and start calculating your SGPA.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-gray-300 font-medium">Fetching courses from database...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 border border-red-500/20 rounded-3xl bg-red-950/10 backdrop-blur-md max-w-2xl mx-auto shadow-2xl">
          <p className="text-red-400 text-center font-semibold mb-2">Error</p>
          <p className="text-gray-300 text-center">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
          
          {/* Left Column: Select Grades */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Select Grades</h2>
                  <p className="text-sm text-gray-400 mt-1">Assign a grade for each course in the list below</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 px-3 py-1 bg-purple-950/30 border border-purple-500/20 rounded-full">
                    {courses.length} Courses
                  </span>
                </div>
              </div>

              {/* Course list */}
              <div className="space-y-4">
                {courses.map((course) => {
                  const selected = selectedGrades[course.id];
                  return (
                    <div
                      key={course.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                        selected 
                          ? 'bg-purple-950/10 border-purple-500/30' 
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex-1 pr-4 mb-3 sm:mb-0">
                        <h4 className="text-base font-semibold text-white leading-snug">{course.course_name}</h4>
                        <span className="inline-flex items-center text-xs font-medium text-gray-400 mt-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/5">
                          Credits: {course.credits}
                        </span>
                      </div>
                      
                      <div className="flex-shrink-0 w-full sm:w-44">
                        <select
                          value={selectedGrades[course.id]?.letter || ''}
                          onChange={(e) => {
                            const letter = e.target.value;
                            const option = gradeOptions.find(o => o.letter === letter);
                            if (option) {
                              setSelectedGrades(prev => ({
                                ...prev,
                                [course.id]: { letter: option.letter, point: option.point }
                              }));
                            } else {
                              const copy = { ...selectedGrades };
                              delete copy[course.id];
                              setSelectedGrades(copy);
                            }
                          }}
                          className={`w-full px-3 py-2.5 bg-[#120a22] border rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 transition-all duration-300 ${
                            selected ? 'border-purple-500/50' : 'border-white/10'
                          }`}
                        >
                          <option value="">Select Grade</option>
                          {gradeOptions.map((opt) => (
                            <option key={opt.letter} value={opt.letter}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Validation & Submit Section */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  {!allGradesSelected ? (
                    <span className="text-sm font-medium text-amber-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Please select all grades ({courses.length - Object.keys(selectedGrades).length} remaining).
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      All course grades assigned! Ready to calculate.
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCalculateSGPA}
                  disabled={!allGradesSelected}
                  className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    allGradesSelected
                      ? 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95'
                      : 'bg-white/10 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  Calculate SGPA
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Grade Distribution */}
          <div className="lg:col-span-5 space-y-6">
            {/* Result Display Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-6">Your SGPA</h3>

              {calculated && sgpaResult !== null ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-current pointer-events-none" />
                    <span className={`text-6xl md:text-7xl font-extrabold tracking-tight select-none ${getSgpaRangeDetails(sgpaResult).colorClass}`}>
                      {sgpaResult}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                    Calculated SGPA
                  </span>

                  {/* Custom progress bar */}
                  <div className="w-full bg-white/5 rounded-full h-3.5 mt-8 overflow-hidden border border-white/10 p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getSgpaRangeDetails(sgpaResult).barGradient} transition-all duration-500 ease-out`}
                      style={{ width: `${(parseFloat(sgpaResult) / 10) * 100}%` }}
                    />
                  </div>

                  {/* Motivational Message */}
                  <div className="mt-6 p-4 w-full rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-base font-semibold text-white">
                      {getSgpaRangeDetails(sgpaResult).message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400 font-medium max-w-xs text-sm">
                    Select grades for all courses on the left and click "Calculate SGPA" to display your results here.
                  </p>
                </div>
              )}
            </div>

            {/* Grade Distribution Display */}
            {calculated && sgpaResult !== null && (
              <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Grade Distribution</h3>
                <div className="space-y-4">
                  {getGradeDistribution().map((item) => (
                    <div key={item.grade} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-300 font-semibold">{item.grade}</span>
                        <span className="text-cyan-400">
                          {item.count} {item.count === 1 ? 'course' : 'courses'} ({Math.round(item.percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default SgpaCalculator;
