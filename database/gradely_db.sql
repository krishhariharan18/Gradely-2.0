-- ============================================================================
-- GRADELY 2.0 - COMPLETE MYSQL DATABASE SCHEMA
-- ============================================================================
-- Database: gradely_db
-- Purpose: Academic GPA Calculator Platform
-- Created: 2026
-- ============================================================================

-- Drop existing database if it exists
DROP DATABASE IF EXISTS gradely_db;

-- Create the database
CREATE DATABASE gradely_db;

-- Use the database
USE gradely_db;

-- ============================================================================
-- TABLE 1: PROGRAMS
-- ============================================================================
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 2: SEMESTERS
-- ============================================================================
CREATE TABLE semesters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    semester_number INT NOT NULL UNIQUE CHECK (semester_number BETWEEN 1 AND 8),
    semester_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 3: COURSES
-- ============================================================================
-- Each course is uniquely identified by (program_id, semester_id, course_name)
-- Credits is now INT instead of DECIMAL
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    semester_id INT NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course (program_id, semester_id, course_name),
    INDEX idx_program_semester (program_id, semester_id)
);

-- ============================================================================
-- TABLE 4: ASSESSMENT COMPONENTS
-- ============================================================================
-- Reference table for assessment types (CIA instead of IA1, IA2)
CREATE TABLE assessment_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    component_name VARCHAR(50) NOT NULL UNIQUE,
    component_short_code VARCHAR(10) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 5: GRADE SCALE
-- ============================================================================
-- Standard grading scale with grade points and mark ranges (not percentages)
-- grade_point is now INT instead of DECIMAL
CREATE TABLE grade_scale (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grade_letter VARCHAR(5) NOT NULL UNIQUE,
    grade_point INT NOT NULL,
    min_mark INT NOT NULL,
    max_mark INT NOT NULL,
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert Programs
INSERT INTO programs (program_name) VALUES 
('B.Tech. AIDS'),
('B.Tech. CSE(IoT)'),
('B.Tech. CSE(CyberSecurity)');

-- Insert Semesters
INSERT INTO semesters (semester_number, semester_name) VALUES 
(1, 'Semester 1'),
(2, 'Semester 2'),
(3, 'Semester 3'),
(4, 'Semester 4'),
(5, 'Semester 5'),
(6, 'Semester 6'),
(7, 'Semester 7'),
(8, 'Semester 8');

-- Insert Assessment Components (Order: CIA1, MSE, CIA2, ESE, Lab)
INSERT INTO assessment_components (component_name, component_short_code, description) VALUES 
('Continuous Internal Assessment 1', 'CIA1', 'First continuous internal assessment'),
('Mid Semester Exam', 'MSE', 'Mid-semester examination'),
('Continuous Internal Assessment 2', 'CIA2', 'Second continuous internal assessment'),
('End Semester Exam', 'ESE', 'End-semester examination'),
('Lab', 'LAB', 'Laboratory');

-- Insert Grade Scale (min_mark and max_mark instead of percentages)
INSERT INTO grade_scale (grade_letter, grade_point, min_mark, max_mark, description) VALUES 
('O', 10, 91, 100, 'Outstanding'),
('A+', 9, 81, 90, 'Excellent'),
('A', 8, 71, 80, 'Very Good'),
('B+', 7, 61, 70, 'Good'),
('B', 6, 50, 60, 'Satisfactory'),
('P', 5, 41, 50, 'Pass'),
('RA', 0, 0, 40, 'Reappear');

-- ============================================================================
-- COURSES FOR PROGRAM 1: B.Tech. AIDS (ARTIFICIAL INTELLIGENCE AND DATA SCIENCE)
-- ============================================================================

-- AIDS - SEMESTER 1
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 1, 'Communicative English', 3),
(1, 1, 'Linear Algebra', 4),
(1, 1, 'Engineering Physics', 3),
(1, 1, 'Environmental Science and Engineering', 2),
(1, 1, 'Programming in C', 3),
(1, 1, 'Digital Design + Lab', 4),
(1, 1, 'Programming in C Lab', 2),
(1, 1, 'Engineering Physics Lab', 2);

-- AIDS - SEMESTER 2
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 2, 'English for Engineers', 3),
(1, 2, 'Statistical Foundations of Data Science', 3),
(1, 2, 'Programming in Python', 2),
(1, 2, 'Data Structures', 3),
(1, 2, 'Computer Organization and Architecture', 3),
(1, 2, 'Foundations of Data Science + Lab', 4),
(1, 2, 'Data Structures Lab', 2),
(1, 2, 'Programming in Python Lab', 2);

-- AIDS - SEMESTER 3
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 3, 'Discrete Mathematics', 4),
(1, 3, 'Object Oriented Programming', 3),
(1, 3, 'Operating Systems + Lab', 4),
(1, 3, 'Artificial Intelligence', 3),
(1, 3, 'Exploratory Data Analysis and Data Visualization', 2),
(1, 3, 'Cognitive Psychology', 2),
(1, 3, 'Object Oriented Programming Lab', 2),
(1, 3, 'Exploratory Data Analysis and Data Visualization Lab', 2);

-- AIDS - SEMESTER 4
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 4, 'Design and Analysis of Algorithms', 3),
(1, 4, 'Database Management Systems', 3),
(1, 4, 'Statistical Inference', 3),
(1, 4, 'Machine Learning Techniques', 3),
(1, 4, 'Data Mining', 1),
(1, 4, 'Open Elective', 3),
(1, 4, 'Database Management Systems Lab', 2),
(1, 4, 'Machine Learning Techniques Lab', 2);

-- AIDS - SEMESTER 5
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 5, 'Optimization Techniques', 3),
(1, 5, 'Web Technologies', 3),
(1, 5, 'Computer Networks + Lab', 4),
(1, 5, 'Deep Learning', 3),
(1, 5, 'Principles of Management', 2),
(1, 5, 'Introduction to Robotics', 3),
(1, 5, 'Introduction to Digital Signal Processing', 1),
(1, 5, 'Deep Learning Lab', 2),
(1, 5, 'Web Technologies Lab', 1);

-- AIDS - SEMESTER 6
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 6, 'Image and Video Processing', 3),
(1, 6, 'Natural Language Processing', 3),
(1, 6, 'Introduction to Speech Signal Processing', 1),
(1, 6, 'Professional Elective I', 3),
(1, 6, 'Professional Elective II', 3),
(1, 6, 'Open Elective II', 3),
(1, 6, 'Image and Video Processing Lab', 2),
(1, 6, 'Natural Language Processing Lab', 2);

-- AIDS - SEMESTER 7
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 7, 'Big Data Analytics', 3),
(1, 7, 'Speech Technology', 3),
(1, 7, 'Professional Elective III', 3),
(1, 7, 'Professional Elective IV', 3),
(1, 7, 'Open Elective III', 3),
(1, 7, 'Big Data Analytics Lab', 2),
(1, 7, 'Capstone Project I', 3);

-- AIDS - SEMESTER 8
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(1, 8, 'Professional Elective V', 3),
(1, 8, 'Professional Elective VI', 3),
(1, 8, 'Capstone Project II', 6);

-- ============================================================================
-- COURSES FOR PROGRAM 2: B.Tech. CSE(IoT)
-- ============================================================================

-- CSE_IoT - SEMESTER 1
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 1, 'Communicative English', 3),
(2, 1, 'Linear Algebra', 3),
(2, 1, 'Programming in C', 3),
(2, 1, 'Environmental Science and Engineering', 2),
(2, 1, 'Digital Design and Microprocessor', 3),
(2, 1, 'Basics of Electrical and Electronics Engineering', 3),
(2, 1, 'Programming in C Lab', 2),
(2, 1, 'Digital Design and Microprocessor Lab', 2);

-- CSE_IoT - SEMESTER 2
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 2, 'English for Engineers', 3),
(2, 2, 'Probability and Statistics', 3),
(2, 2, 'Engineering Physics', 3),
(2, 2, 'Computer Organization and Architecture', 3),
(2, 2, 'Introduction to Internet of Things + Lab', 4),
(2, 2, 'Programming in Python', 2),
(2, 2, 'Engineering Physics Lab', 2),
(2, 2, 'Programming in Python Lab', 2);

-- CSE_IoT - SEMESTER 3
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 3, 'Discrete Mathematics and Graph Theory', 4),
(2, 3, 'Data Structures', 3),
(2, 3, 'Object Oriented Programming', 3),
(2, 3, 'Database Management Systems', 3),
(2, 3, 'Software Engineering and Design', 3),
(2, 3, 'Data Structures Lab', 2),
(2, 3, 'Database Management Systems Lab', 2);

-- CSE_IoT - SEMESTER 4
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 4, 'Operating Systems', 3),
(2, 4, 'Design and Analysis of Algorithms', 3),
(2, 4, 'Computer Networks', 3),
(2, 4, 'Introduction to Sensor Technology', 3),
(2, 4, 'Agile Scrum Process', 1),
(2, 4, 'Open Elective I', 3),
(2, 4, 'Operating Systems Lab', 2),
(2, 4, 'Computer Networks Lab', 2),
(2, 4, 'Design Thinking', 1);

-- CSE_IoT - SEMESTER 5
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 5, 'Artificial Intelligence', 3),
(2, 5, 'Web Technologies', 3),
(2, 5, 'Software and Programming in IoT', 3),
(2, 5, 'Distributed Computing', 2),
(2, 5, 'Professional Elective I', 3),
(2, 5, 'Open Elective II', 3),
(2, 5, 'Web Technologies Lab', 2),
(2, 5, 'Artificial Intelligence Lab', 2),
(2, 5, 'Software and Programming in IoT Lab', 1);

-- CSE_IoT - SEMESTER 6
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 6, 'Machine Learning Algorithms', 3),
(2, 6, 'IoT Architecture and Protocols', 3),
(2, 6, 'Cryptography Concepts', 3),
(2, 6, 'Professional Elective II', 3),
(2, 6, 'Professional Elective III', 3),
(2, 6, 'Open Elective III', 3),
(2, 6, 'Mini Project', 1),
(2, 6, 'Machine Learning Algorithms Lab', 2);

-- CSE_IoT - SEMESTER 7
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 7, 'Trusted Computing and Security Models', 3),
(2, 7, 'Cloud and Fog Computing for IoT', 3),
(2, 7, 'DevOps', 3),
(2, 7, 'Management Principles for Engineers', 2),
(2, 7, 'Intellectual Property Rights', 1),
(2, 7, 'Professional Elective IV', 3),
(2, 7, 'DevOps Lab', 2),
(2, 7, 'Capstone Project I', 3);

-- CSE_IoT - SEMESTER 8
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(2, 8, 'Professional Elective V', 3),
(2, 8, 'Professional Elective VI', 3),
(2, 8, 'Project (Phase-II)', 6);

-- ============================================================================
-- COURSES FOR PROGRAM 3: B.Tech. CSE(CyberSecurity)
-- ============================================================================

-- CSE_CyberSecurity - SEMESTER 1
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 1, 'Communicative English', 3),
(3, 1, 'Linear Algebra', 4),
(3, 1, 'Engineering Physics', 3),
(3, 1, 'Cyber Security Essentials', 4),
(3, 1, 'Programming in C', 3),
(3, 1, 'Digital Design + Lab', 3),
(3, 1, 'Extra Academic Activity', 1),
(3, 1, 'Programming in C Lab', 2);

-- CSE_CyberSecurity - SEMESTER 2
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 2, 'English for Engineers', 3),
(3, 2, 'Probability and Statistics', 3),
(3, 2, 'Programming in Python', 2),
(3, 2, 'Data Structures', 3),
(3, 2, 'Computer Organization', 3),
(3, 2, 'Classical Cryptography', 3),
(3, 2, 'Data Structures Lab', 2),
(3, 2, 'Programming in Python Lab', 2);

-- CSE_CyberSecurity - SEMESTER 3
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 3, 'Discrete Mathematics', 3),
(3, 3, 'Object Oriented Programming', 3),
(3, 3, 'Operating Systems + Lab', 4),
(3, 3, 'Database Management System', 3),
(3, 3, 'Modern Cryptography', 2),
(3, 3, 'Cognitive Psychology', 2),
(3, 3, 'Object Oriented Programming Lab', 2),
(3, 3, 'Database Management Systems Lab', 2);

-- CSE_CyberSecurity - SEMESTER 4
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 4, 'Design and Analysis of Algorithms', 3),
(3, 4, 'Graph Theory', 4),
(3, 4, 'Computer Networks', 3),
(3, 4, 'Machine Learning Techniques', 3),
(3, 4, 'Open Elective I', 3),
(3, 4, 'System Security Management + Lab', 4),
(3, 4, 'Computer Networks Lab', 2),
(3, 4, 'Machine Learning Lab', 2);

-- CSE_CyberSecurity - SEMESTER 5
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 5, 'Optimization Techniques', 3),
(3, 5, 'High Performance Computing', 3),
(3, 5, 'Artificial Intelligence', 3),
(3, 5, 'Network Penetration Testing, Ethical Hacking and Social Engineering', 3),
(3, 5, 'Principles of Management', 2),
(3, 5, 'Professional Elective I', 3),
(3, 5, 'Penetration Testing & Ethical Hacking Lab', 2),
(3, 5, 'HPC Lab', 1);

-- CSE_CyberSecurity - SEMESTER 6
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 6, 'Image and Video Processing', 3),
(3, 6, 'Network Security', 2),
(3, 6, 'Cloud Computing and Security', 3),
(3, 6, 'Cyber Forensics', 3),
(3, 6, 'Professional Elective II', 3),
(3, 6, 'Open Elective II', 3),
(3, 6, 'Cloud Security Lab', 2),
(3, 6, 'Image and Video Processing Lab', 2);

-- CSE_CyberSecurity - SEMESTER 7
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 7, 'Deep Learning', 3),
(3, 7, 'Web Application Security', 3),
(3, 7, 'Professional Elective III', 3),
(3, 7, 'Professional Elective IV', 3),
(3, 7, 'Open Elective III', 3),
(3, 7, 'Deep Learning Lab', 2),
(3, 7, 'Capstone Project I', 3);

-- CSE_CyberSecurity - SEMESTER 8
INSERT INTO courses (program_id, semester_id, course_name, credits) VALUES 
(3, 8, 'Professional Elective V', 3),
(3, 8, 'Professional Elective VI', 3),
(3, 8, 'Capstone Project II', 6);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. All Programs
SELECT * FROM programs;

-- 2. All Semesters
SELECT * FROM semesters;

-- 3. All Assessment Components
SELECT * FROM assessment_components;

-- 4. All Grades
SELECT * FROM grade_scale ORDER BY grade_point DESC;

-- 5. All Courses
SELECT * FROM courses;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================