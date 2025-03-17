/*
 Navicat MariaDB Dump SQL

 Source Server         : ScholarWatch
 Source Server Type    : MariaDB
 Source Server Version : 110502 (11.5.2-MariaDB)
 Source Host           : 127.0.0.1:3306
 Source Schema         : scholarwatch

 Target Server Type    : MariaDB
 Target Server Version : 110502 (11.5.2-MariaDB)
 File Encoding         : 65001

 Date: 17/11/2024 16:39:01
*/

-- CREATE SCHEMA `scholarwatch` ;
USE `scholarwatch`;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Activity
-- ----------------------------
DROP TABLE IF EXISTS `Activity`;
CREATE TABLE `Activity` (
  `ActivityID` INT(11) NOT NULL AUTO_INCREMENT,
  `UserID` INT(11) NOT NULL,
  `SessionID` INT(11) NOT NULL,
  `SlideID` INT(11) NOT NULL,
  `FocusTime` FLOAT NOT NULL,
  `UnfocusTime` FLOAT NOT NULL,
  `SlouchingTime` FLOAT NOT NULL,
  `AttentiveTime` FLOAT NOT NULL,
  `LookingLeftTime` FLOAT NOT NULL,
  `LookingRightTime` FLOAT NOT NULL,
  `PhoneUsageTime` FLOAT NOT NULL,
  `DrowsyTime` FLOAT NOT NULL,
  `AwakeTime` FLOAT NOT NULL,
  `Timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`ActivityID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  KEY `SlideID` (`SlideID`),
  CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `activity_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`),
  CONSTRAINT `activity_ibfk_3` FOREIGN KEY (`SlideID`) REFERENCES `Slide` (`SlideID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Activity
-- ----------------------------
BEGIN;
INSERT INTO `Activity` (`ActivityID`, `UserID`, `SessionID`, `SlideID`, `FocusTime`, `UnfocusTime`, `SlouchingTime`, `AttentiveTime`, `LookingLeftTime`, `LookingRightTime`, `PhoneUsageTime`, `DrowsyTime`, `AwakeTime`, `Timestamp`) VALUES
(1, 3, 1, 1, 300, 50, 20, 280, 10, 15, 5, 30, 270, '2024-01-15 09:15:00'),
(2, 4, 1, 2, 250, 60, 30, 220, 15, 10, 10, 40, 210, '2024-01-15 09:30:00'),
(3, 5, 2, 3, 180, 30, 10, 160, 5, 10, 0, 10, 170, '2024-01-16 10:15:00');
COMMIT;

-- ----------------------------
-- Table structure for Analytics
-- ----------------------------
DROP TABLE IF EXISTS `Analytics`;
CREATE TABLE `Analytics` (
  `AnalyticsID` INT(11) NOT NULL AUTO_INCREMENT,
  `UserID` INT(11) NOT NULL,
  `SessionID` INT(11) NOT NULL,
  `WeakTopics` TEXT NOT NULL,
  `AverageFocus` FLOAT NOT NULL,
  `PerformanceScore` FLOAT NOT NULL,
  `ImprovementSuggestions` TEXT NOT NULL,
  PRIMARY KEY (`AnalyticsID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `analytics_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Analytics
-- ----------------------------
BEGIN;
INSERT INTO `Analytics` (`AnalyticsID`, `UserID`, `SessionID`, `WeakTopics`, `AverageFocus`, `PerformanceScore`, `ImprovementSuggestions`) VALUES
(1, 3, 1, 'Loops, Functions', 250.5, 78, 'Practice more on loops and try solving function problems.'),
(2, 4, 1, 'Algebra Basics', 220, 85, 'Improve algebraic equation solving speed.'),
(3, 5, 2, 'Fractions', 180, 72.5, 'Focus on understanding fractions deeply.');
COMMIT;

-- ----------------------------
-- Table structure for Attendance
-- ----------------------------
DROP TABLE IF EXISTS `Attendance`;
CREATE TABLE `Attendance` (
  `AttendanceID` INT(11) NOT NULL AUTO_INCREMENT,
  `UserID` INT(11) NOT NULL,
  `SessionID` INT(11) NOT NULL,
  `Date` DATE NOT NULL,
  `IsPresent` TINYINT(1) NOT NULL,
  PRIMARY KEY (`AttendanceID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Attendance
-- ----------------------------
BEGIN;
INSERT INTO `Attendance` (`AttendanceID`, `UserID`, `SessionID`, `Date`, `IsPresent`) VALUES
(1, 3, 1, '2024-01-15', 1),
(2, 4, 1, '2024-01-15', 1),
(3, 5, 2, '2024-01-16', 1);
COMMIT;

-- ----------------------------
-- Table structure for Course
-- ----------------------------
DROP TABLE IF EXISTS `Course`;
CREATE TABLE `Course` (
  `CourseID` INT(11) NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `TeacherID` INT(11) NOT NULL,
  PRIMARY KEY (`CourseID`),
  KEY `TeacherID` (`TeacherID`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`TeacherID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Course
-- ----------------------------
BEGIN;
INSERT INTO `Course` (`CourseID`, `Name`, `TeacherID`) VALUES
(1, 'Computer Science', 1),
(2, 'Mathematics', 2);
COMMIT;

-- ----------------------------
-- Table structure for Lecture
-- ----------------------------
DROP TABLE IF EXISTS `Lecture`;
CREATE TABLE `Lecture` (
  `LectureID` INT(11) NOT NULL AUTO_INCREMENT,
  `SessionID` INT(11) NOT NULL,
  `CourseID` INT(11) NOT NULL,
  `LectureName` VARCHAR(255) NOT NULL,
  `DirectoryPath` VARCHAR(255) NOT NULL,
  `SlideCount` INT(11) NOT NULL,
  `StartTimestamp` DATETIME NOT NULL,
  `EndTimestamp` DATETIME NOT NULL,
  PRIMARY KEY (`LectureID`),
  KEY `SessionID` (`SessionID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `lecture_ibfk_1` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`),
  CONSTRAINT `lecture_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `Course` (`CourseID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Lecture
-- ----------------------------
BEGIN;
INSERT INTO `Lecture` (`LectureID`, `SessionID`, `CourseID`, `LectureName`, `DirectoryPath`, `SlideCount`, `StartTimestamp`, `EndTimestamp`) VALUES
(1, 1, 1, 'Introduction to Programming', '/lectures/programming_intro.pdf', 10, '2024-01-15 09:00:00', '2024-01-15 10:30:00'),
(2, 2, 2, 'Algebra Basics', '/lectures/algebra_basics.pdf', 8, '2024-01-16 10:00:00', '2024-01-16 11:00:00');
COMMIT;

-- ----------------------------
-- Table structure for Quiz
-- ----------------------------
DROP TABLE IF EXISTS `Quiz`;
CREATE TABLE `Quiz` (
  `QuizID` INT(11) NOT NULL AUTO_INCREMENT,
  `SessionID` INT(11) NOT NULL,
  `LectureID` INT(11) NOT NULL,
  `UserID` INT(11) NOT NULL,
  `GeneratedDate` DATETIME NOT NULL,
  `AttemptCount` INT(11) NOT NULL,
  `InvalidationCount` INT(11) NOT NULL,
  `InvalidationReason` VARCHAR(255) DEFAULT NULL,
  `AllotedTime` INT(11) NOT NULL,
  PRIMARY KEY (`QuizID`),
  KEY `SessionID` (`SessionID`),
  KEY `LectureID` (`LectureID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `quiz_ibfk_1` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`),
  CONSTRAINT `quiz_ibfk_2` FOREIGN KEY (`LectureID`) REFERENCES `Lecture` (`LectureID`),
  CONSTRAINT `quiz_ibfk_3` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Quiz
-- ----------------------------
BEGIN;
INSERT INTO `Quiz` (`QuizID`, `SessionID`, `LectureID`, `UserID`, `GeneratedDate`, `AttemptCount`, `InvalidationCount`, `InvalidationReason`, `AllotedTime`) VALUES
(1, 3, 1, 3, '2024-01-17 11:00:00', 1, 0, NULL, 30),
(2, 3, 1, 4, '2024-01-17 11:05:00', 2, 1, 'Tab Switch', 30),
(3, 3, 1, 5, '2024-01-17 11:10:00', 1, 0, NULL, 30);
COMMIT;

-- ----------------------------
-- Table structure for QuizQuestion
-- ----------------------------
DROP TABLE IF EXISTS `QuizQuestion`;
CREATE TABLE `QuizQuestion` (
  `QuestionID` INT(11) NOT NULL AUTO_INCREMENT,
  `QuizID` INT(11) NOT NULL,
  `QuestionText` TEXT NOT NULL,
  `CorrectAnswer` VARCHAR(255) NOT NULL,
  `StudentAnswer` VARCHAR(255) DEFAULT NULL,
  `IsCorrect` TINYINT(1) NOT NULL,
  PRIMARY KEY (`QuestionID`),
  KEY `QuizID` (`QuizID`),
  CONSTRAINT `quizquestion_ibfk_1` FOREIGN KEY (`QuizID`) REFERENCES `Quiz` (`QuizID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of QuizQuestion
-- ----------------------------
BEGIN;
INSERT INTO `QuizQuestion` (`QuestionID`, `QuizID`, `QuestionText`, `CorrectAnswer`, `StudentAnswer`, `IsCorrect`) VALUES
(1, 1, 'What is a variable in programming?', 'Storage of data', 'Storage of data', 1),
(2, 2, 'Simplify x + x = ?', '2x', '2x', 1),
(3, 3, 'What is 2 + 2?', '4', '3', 0);
COMMIT;

-- ----------------------------
-- Table structure for Session
-- ----------------------------
DROP TABLE IF EXISTS `Session`;
CREATE TABLE `Session` (
  `SessionID` INT(11) NOT NULL AUTO_INCREMENT,
  `SessionType` ENUM('Lecture','Quiz') NOT NULL,
  `CourseID` INT(11) NOT NULL,
  `UserID` INT(11) NOT NULL,
  `SessionDate` DATETIME NOT NULL,
  `StartTimestamp` DATETIME NOT NULL,
  `EndTimestamp` DATETIME NOT NULL,
  PRIMARY KEY (`SessionID`),
  KEY `CourseID` (`CourseID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`CourseID`) REFERENCES `Course` (`CourseID`),
  CONSTRAINT `session_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Session
-- ----------------------------
BEGIN;
INSERT INTO `Session` (`SessionID`, `SessionType`, `CourseID`, `UserID`, `SessionDate`, `StartTimestamp`, `EndTimestamp`) VALUES
(1, 'Lecture', 1, 1, '2024-01-15 00:00:00', '2024-01-15 09:00:00', '2024-01-15 10:30:00'),
(2, 'Lecture', 2, 2, '2024-01-16 00:00:00', '2024-01-16 10:00:00', '2024-01-16 11:00:00'),
(3, 'Quiz', 1, 1, '2024-01-17 00:00:00', '2024-01-17 11:00:00', '2024-01-17 11:30:00');
COMMIT;

-- ----------------------------
-- Table structure for Slide
-- ----------------------------
DROP TABLE IF EXISTS `Slide`;
CREATE TABLE `Slide` (
  `SlideID` INT(11) NOT NULL AUTO_INCREMENT,
  `LectureID` INT(11) NOT NULL,
  `SlideNumber` INT(11) NOT NULL,
  `FocusDuration` FLOAT NOT NULL,
  PRIMARY KEY (`SlideID`),
  KEY `LectureID` (`LectureID`),
  CONSTRAINT `slide_ibfk_1` FOREIGN KEY (`LectureID`) REFERENCES `Lecture` (`LectureID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Slide
-- ----------------------------
BEGIN;
INSERT INTO `Slide` (`SlideID`, `LectureID`, `SlideNumber`, `FocusDuration`) VALUES
(1, 1, 1, 150.5),
(2, 1, 2, 200.8),
(3, 2, 1, 180.3),
(4, 2, 2, 140.2);
COMMIT;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `UserID` INT(11) NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(255) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `UserType` ENUM('Student','Teacher') NOT NULL,
  `Threshold` FLOAT DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of User
-- ----------------------------
BEGIN;
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`, `Threshold`) VALUES
(1, 'Ahmed Ali', 'ahmed.ali@gmail.com', 'Teacher', 0.75),
(2, 'Fatima Khan', 'fatima.khan@gmail.com', 'Teacher', 0.8),
(3, 'Hassan Raza', 'hassan.raza@gmail.com', 'Student', NULL),
(4, 'Ayesha Malik', 'ayesha.malik@gmail.com', 'Student', NULL),
(5, 'Zainab Tariq', 'zainab.tariq@gmail.com', 'Student', NULL);
COMMIT;

-- ----------------------------------------
-- Updating User Table for Password
-- ----------------------------------------

SET SQL_SAFE_UPDATES = 0;
ALTER TABLE `User` 
ADD COLUMN `password` VARCHAR(45) NOT NULL AFTER `Email`;

UPDATE `User` 
SET `password` = CONCAT('default_', `UserID`);
ALTER TABLE `User` 
ADD UNIQUE INDEX `password_UNIQUE` (`password`);
SET SQL_SAFE_UPDATES = 1;

-- End of File
SET FOREIGN_KEY_CHECKS = 1;