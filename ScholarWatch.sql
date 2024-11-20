/*
 Navicat MariaDB Dump SQL

 Source Server         : ScholarWatch
 Source Server Type    : MariaDB
 Source Server Version : 110502 (11.5.2-MariaDB)
 Source Host           : 127.0.0.1:3306
 Source Schema         : ScholarWatch

 Target Server Type    : MariaDB
 Target Server Version : 110502 (11.5.2-MariaDB)
 File Encoding         : 65001

 Date: 17/11/2024 16:39:01
*/

 -- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'V@lorant1'; 

-- CREATE SCHEMA `scholarwatch` ;

use scholarwatch;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Activity
-- ----------------------------
DROP TABLE IF EXISTS `Activity`;
CREATE TABLE `Activity` (
  `ActivityID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `SessionID` int(11) NOT NULL,
  `SlideID` int(11) NOT NULL,
  `FocusTime` float NOT NULL,
  `UnfocusTime` float NOT NULL,
  `SlouchingTime` float NOT NULL,
  `AttentiveTime` float NOT NULL,
  `LookingLeftTime` float NOT NULL,
  `LookingRightTime` float NOT NULL,
  `PhoneUsageTime` float NOT NULL,
  `DrowsyTime` float NOT NULL,
  `AwakeTime` float NOT NULL,
  `Timestamp` datetime NOT NULL,
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
INSERT INTO `Activity` (`ActivityID`, `UserID`, `SessionID`, `SlideID`, `FocusTime`, `UnfocusTime`, `SlouchingTime`, `AttentiveTime`, `LookingLeftTime`, `LookingRightTime`, `PhoneUsageTime`, `DrowsyTime`, `AwakeTime`, `Timestamp`) VALUES (1, 3, 1, 1, 300, 50, 20, 280, 10, 15, 5, 30, 270, '2024-01-15 09:15:00');
INSERT INTO `Activity` (`ActivityID`, `UserID`, `SessionID`, `SlideID`, `FocusTime`, `UnfocusTime`, `SlouchingTime`, `AttentiveTime`, `LookingLeftTime`, `LookingRightTime`, `PhoneUsageTime`, `DrowsyTime`, `AwakeTime`, `Timestamp`) VALUES (2, 4, 1, 2, 250, 60, 30, 220, 15, 10, 10, 40, 210, '2024-01-15 09:30:00');
INSERT INTO `Activity` (`ActivityID`, `UserID`, `SessionID`, `SlideID`, `FocusTime`, `UnfocusTime`, `SlouchingTime`, `AttentiveTime`, `LookingLeftTime`, `LookingRightTime`, `PhoneUsageTime`, `DrowsyTime`, `AwakeTime`, `Timestamp`) VALUES (3, 5, 2, 3, 180, 30, 10, 160, 5, 10, 0, 10, 170, '2024-01-16 10:15:00');
COMMIT;

-- ----------------------------
-- Table structure for Analytics
-- ----------------------------
DROP TABLE IF EXISTS `Analytics`;
CREATE TABLE `Analytics` (
  `AnalyticsID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `SessionID` int(11) NOT NULL,
  `WeakTopics` text NOT NULL,
  `AverageFocus` float NOT NULL,
  `PerformanceScore` float NOT NULL,
  `ImprovementSuggestions` text NOT NULL,
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
INSERT INTO `Analytics` (`AnalyticsID`, `UserID`, `SessionID`, `WeakTopics`, `AverageFocus`, `PerformanceScore`, `ImprovementSuggestions`) VALUES (1, 3, 1, 'Loops, Functions', 250.5, 78, 'Practice more on loops and try solving function problems.');
INSERT INTO `Analytics` (`AnalyticsID`, `UserID`, `SessionID`, `WeakTopics`, `AverageFocus`, `PerformanceScore`, `ImprovementSuggestions`) VALUES (2, 4, 1, 'Algebra Basics', 220, 85, 'Improve algebraic equation solving speed.');
INSERT INTO `Analytics` (`AnalyticsID`, `UserID`, `SessionID`, `WeakTopics`, `AverageFocus`, `PerformanceScore`, `ImprovementSuggestions`) VALUES (3, 5, 2, 'Fractions', 180, 72.5, 'Focus on understanding fractions deeply.');
COMMIT;

-- ----------------------------
-- Table structure for Attendance
-- ----------------------------
DROP TABLE IF EXISTS `Attendance`;
CREATE TABLE `Attendance` (
  `AttendanceID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `SessionID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `IsPresent` tinyint(1) NOT NULL,
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
INSERT INTO `Attendance` (`AttendanceID`, `UserID`, `SessionID`, `Date`, `IsPresent`) VALUES (1, 3, 1, '2024-01-15', 1);
INSERT INTO `Attendance` (`AttendanceID`, `UserID`, `SessionID`, `Date`, `IsPresent`) VALUES (2, 4, 1, '2024-01-15', 1);
INSERT INTO `Attendance` (`AttendanceID`, `UserID`, `SessionID`, `Date`, `IsPresent`) VALUES (3, 5, 2, '2024-01-16', 1);
COMMIT;

-- ----------------------------
-- Table structure for Course
-- ----------------------------
DROP TABLE IF EXISTS `Course`;
CREATE TABLE `Course` (
  `CourseID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `TeacherID` int(11) NOT NULL,
  PRIMARY KEY (`CourseID`),
  KEY `TeacherID` (`TeacherID`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`TeacherID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Course
-- ----------------------------
BEGIN;
INSERT INTO `Course` (`CourseID`, `Name`, `TeacherID`) VALUES (1, 'Computer Science', 1);
INSERT INTO `Course` (`CourseID`, `Name`, `TeacherID`) VALUES (2, 'Mathematics', 2);
COMMIT;

-- ----------------------------
-- Table structure for Lecture
-- ----------------------------
DROP TABLE IF EXISTS `Lecture`;
CREATE TABLE `Lecture` (
  `LectureID` int(11) NOT NULL AUTO_INCREMENT,
  `SessionID` int(11) NOT NULL,
  `CourseID` int(11) NOT NULL,
  `LectureName` varchar(255) NOT NULL,
  `DirectoryPath` varchar(255) NOT NULL,
  `SlideCount` int(11) NOT NULL,
  `StartTimestamp` datetime NOT NULL,
  `EndTimestamp` datetime NOT NULL,
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
INSERT INTO `Lecture` (`LectureID`, `SessionID`, `CourseID`, `LectureName`, `DirectoryPath`, `SlideCount`, `StartTimestamp`, `EndTimestamp`) VALUES (1, 1, 1, 'Introduction to Programming', '/lectures/programming_intro.pdf', 10, '2024-01-15 09:00:00', '2024-01-15 10:30:00');
INSERT INTO `Lecture` (`LectureID`, `SessionID`, `CourseID`, `LectureName`, `DirectoryPath`, `SlideCount`, `StartTimestamp`, `EndTimestamp`) VALUES (2, 2, 2, 'Algebra Basics', '/lectures/algebra_basics.pdf', 8, '2024-01-16 10:00:00', '2024-01-16 11:00:00');
COMMIT;

-- ----------------------------
-- Table structure for Quiz
-- ----------------------------
DROP TABLE IF EXISTS `Quiz`;
CREATE TABLE `Quiz` (
  `QuizID` int(11) NOT NULL AUTO_INCREMENT,
  `SessionID` int(11) NOT NULL,
  `LectureID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `GeneratedDate` datetime NOT NULL,
  `AttemptCount` int(11) NOT NULL,
  `InvalidationCount` int(11) NOT NULL,
  `InvalidationReason` varchar(255) DEFAULT NULL,
  `AllotedTime` int(11) NOT NULL,
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
INSERT INTO `Quiz` (`QuizID`, `SessionID`, `LectureID`, `UserID`, `GeneratedDate`, `AttemptCount`, `InvalidationCount`, `InvalidationReason`, `AllotedTime`) VALUES (1, 3, 1, 3, '2024-01-17 11:00:00', 1, 0, NULL, 30);
INSERT INTO `Quiz` (`QuizID`, `SessionID`, `LectureID`, `UserID`, `GeneratedDate`, `AttemptCount`, `InvalidationCount`, `InvalidationReason`, `AllotedTime`) VALUES (2, 3, 1, 4, '2024-01-17 11:05:00', 2, 1, 'Tab Switch', 30);
INSERT INTO `Quiz` (`QuizID`, `SessionID`, `LectureID`, `UserID`, `GeneratedDate`, `AttemptCount`, `InvalidationCount`, `InvalidationReason`, `AllotedTime`) VALUES (3, 3, 1, 5, '2024-01-17 11:10:00', 1, 0, NULL, 30);
COMMIT;

-- ----------------------------
-- Table structure for QuizQuestion
-- ----------------------------
DROP TABLE IF EXISTS `QuizQuestion`;
CREATE TABLE `QuizQuestion` (
  `QuestionID` int(11) NOT NULL AUTO_INCREMENT,
  `QuizID` int(11) NOT NULL,
  `QuestionText` text NOT NULL,
  `CorrectAnswer` varchar(255) NOT NULL,
  `StudentAnswer` varchar(255) DEFAULT NULL,
  `IsCorrect` tinyint(1) NOT NULL,
  PRIMARY KEY (`QuestionID`),
  KEY `QuizID` (`QuizID`),
  CONSTRAINT `quizquestion_ibfk_1` FOREIGN KEY (`QuizID`) REFERENCES `Quiz` (`QuizID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of QuizQuestion
-- ----------------------------
BEGIN;
INSERT INTO `QuizQuestion` (`QuestionID`, `QuizID`, `QuestionText`, `CorrectAnswer`, `StudentAnswer`, `IsCorrect`) VALUES (1, 1, 'What is a variable in programming?', 'Storage of data', 'Storage of data', 1);
INSERT INTO `QuizQuestion` (`QuestionID`, `QuizID`, `QuestionText`, `CorrectAnswer`, `StudentAnswer`, `IsCorrect`) VALUES (2, 2, 'Simplify x + x = ?', '2x', '2x', 1);
INSERT INTO `QuizQuestion` (`QuestionID`, `QuizID`, `QuestionText`, `CorrectAnswer`, `StudentAnswer`, `IsCorrect`) VALUES (3, 3, 'What is 2 + 2?', '4', '3', 0);
COMMIT;

-- ----------------------------
-- Table structure for Session
-- ----------------------------
DROP TABLE IF EXISTS `Session`;
CREATE TABLE `Session` (
  `SessionID` int(11) NOT NULL AUTO_INCREMENT,
  `SessionType` enum('Lecture','Quiz') NOT NULL,
  `CourseID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `SessionDate` datetime NOT NULL,
  `StartTimestamp` datetime NOT NULL,
  `EndTimestamp` datetime NOT NULL,
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
INSERT INTO `Session` (`SessionID`, `SessionType`, `CourseID`, `UserID`, `SessionDate`, `StartTimestamp`, `EndTimestamp`) VALUES (1, 'Lecture', 1, 1, '2024-01-15 00:00:00', '2024-01-15 09:00:00', '2024-01-15 10:30:00');
INSERT INTO `Session` (`SessionID`, `SessionType`, `CourseID`, `UserID`, `SessionDate`, `StartTimestamp`, `EndTimestamp`) VALUES (2, 'Lecture', 2, 2, '2024-01-16 00:00:00', '2024-01-16 10:00:00', '2024-01-16 11:00:00');
INSERT INTO `Session` (`SessionID`, `SessionType`, `CourseID`, `UserID`, `SessionDate`, `StartTimestamp`, `EndTimestamp`) VALUES (3, 'Quiz', 1, 1, '2024-01-17 00:00:00', '2024-01-17 11:00:00', '2024-01-17 11:30:00');
COMMIT;

-- ----------------------------
-- Table structure for Slide
-- ----------------------------
DROP TABLE IF EXISTS `Slide`;
CREATE TABLE `Slide` (
  `SlideID` int(11) NOT NULL AUTO_INCREMENT,
  `LectureID` int(11) NOT NULL,
  `SlideNumber` int(11) NOT NULL,
  `FocusDuration` float NOT NULL,
  PRIMARY KEY (`SlideID`),
  KEY `LectureID` (`LectureID`),
  CONSTRAINT `slide_ibfk_1` FOREIGN KEY (`LectureID`) REFERENCES `Lecture` (`LectureID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of Slide
-- ----------------------------
BEGIN;
INSERT INTO `Slide` (`SlideID`, `LectureID`, `SlideNumber`, `FocusDuration`) VALUES (1, 1, 1, 150.5);
INSERT INTO `Slide` (`SlideID`, `LectureID`, `SlideNumber`, `FocusDuration`) VALUES (2, 1, 2, 200.8);
INSERT INTO `Slide` (`SlideID`, `LectureID`, `SlideNumber`, `FocusDuration`) VALUES (3, 2, 1, 180.3);
INSERT INTO `Slide` (`SlideID`, `LectureID`, `SlideNumber`, `FocusDuration`) VALUES (4, 2, 2, 140.2);
COMMIT;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `UserType` enum('Student','Teacher') NOT NULL,
  `Threshold` float DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of User
-- ----------------------------
BEGIN;
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`, `Threshold`) VALUES (1, 'Ahmed Ali', 'ahmed.ali@gmail.com', 'Teacher', 0.75);
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`, `Threshold`) VALUES (2, 'Fatima Khan', 'fatima.khan@gmail.com', 'Teacher', 0.8);
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`, `Threshold`) VALUES (3, 'Hassan Raza', 'hassan.raza@gmail.com', 'Student', NULL);
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`, `Threshold`) VALUES (4, 'Ayesha Malik', 'ayesha.malik@gmail.com', 'Student', NULL);
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`, `Threshold`) VALUES (5, 'Zainab Tariq', 'zainab.tariq@gmail.com', 'Student', NULL);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `scholarwatch`.`quiz` 
ADD COLUMN `is_invalid` TINYINT NULL AFTER `ContentID`;

ALTER TABLE `scholarwatch`.`attention` 
ADD COLUMN `awake_time` DECIMAL(2) NULL AFTER `ModuleID`,
ADD COLUMN `drowsy_time` DECIMAL(2) NULL AFTER `awake_time`,
ADD COLUMN `focused_time` DECIMAL(2) NULL AFTER `drowsy_time`,
ADD COLUMN `unfocused_time` DECIMAL(2) NULL AFTER `focused_time`;

-- Creating password column in user table --
SET SQL_SAFE_UPDATES = 0;
ALTER TABLE `scholarwatch`.`user` 
ADD COLUMN `password` VARCHAR(45) NOT NULL AFTER `Email`;
UPDATE `scholarwatch`.`user` 
SET `password` = CONCAT('default_', `UserId`);
ALTER TABLE `scholarwatch`.`user` 
ADD UNIQUE INDEX `password_UNIQUE` (`password`);
SET SQL_SAFE_UPDATES = 1;
-- ----------------------------------------

update quiz set is_invalid=1 where quizid = 1001;
update quiz set is_invalid=1 where quizid = 1002;
update quiz set is_invalid=0 where quizid = 1003;

update attention set awake_time=30,drowsy_time=5 where moduleid=301; 
update attention set awake_time=25,drowsy_time=15 where moduleid=302; 
update attention set awake_time=15,drowsy_time=35 where moduleid=303;

update attention set focused_time=35,unfocused_time=10 where moduleid=301; 
update attention set focused_time=20,unfocused_time=10 where moduleid=302; 
update attention set focused_time=20,unfocused_time=30 where moduleid=303;

