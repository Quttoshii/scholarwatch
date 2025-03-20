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

 -- ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
 -- FLUSH PRIVILEGES;


-- CREATE SCHEMA `scholarwatch` ;

use scholarwatch;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Activity
-- ----------------------------
DROP TABLE IF EXISTS `Activity`;
CREATE TABLE `Activity` (
  `ActivityID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `SessionID` int NOT NULL,
  `SlideID` int NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Dumping data for table `Activity`
-- ----------------------------

INSERT INTO `Activity` VALUES 
(1, 3, 1, 1, 300, 50, 20, 280, 10, 15, 5, 30, 270, '2024-01-15 09:15:00'),
(2, 4, 1, 2, 250, 60, 30, 220, 15, 10, 10, 40, 210, '2024-01-15 09:30:00'),
(3, 5, 2, 3, 180, 30, 10, 160, 5, 10, 0, 10, 170, '2024-01-16 10:15:00'),
(4, 3, 1, 2, 0.0074, 0, 1.855, 1.8624, 0, 0, 0, 0, 0, '2025-02-14 07:29:33'),
(5, 3, 1, 2, 7.9766, 0, 7.3657, 25.5177, 9.1066, 1.0688, 0, 0, 0, '2025-02-14 07:40:06'),
(6, 3, 1, 2, 0, 0, 3.516, 14.664, 0.433, 0.464, 4.267, 0, 0, '2025-02-17 15:48:43'),
(7, 3, 1, 2, 0, 0, 6.245, 18.949, 2.576, 1.1, 8.553, 0, 0, '2025-02-17 16:01:36'),
(8, 3, 1, 2, 0, 0, 16.239, 9.252, 0.34, 1.828, 4.317, 0, 0, '2025-03-02 20:45:42'),
(9, 3, 1, 2, 0, 0, 0, 47.851, 0, 0, 0, 0, 0, '2025-03-04 00:15:05');


-- ----------------------------
-- Table structure for Analytics
-- ----------------------------
DROP TABLE IF EXISTS `Analytics`;
CREATE TABLE `Analytics` (
  `AnalyticsID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `SessionID` int NOT NULL,
  `WeakTopics` text COLLATE utf8mb4_general_ci NOT NULL,
  `AverageFocus` float NOT NULL,
  `PerformanceScore` float NOT NULL,
  `ImprovementSuggestions` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`AnalyticsID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `analytics_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Dumping data for table `Analytics`
-- ----------------------------

INSERT INTO `Analytics` VALUES 
(1, 3, 1, 'Loops, Functions', 250.5, 78, 'Practice more on loops and try solving function problems.'),
(2, 4, 1, 'Algebra Basics', 220, 85, 'Improve algebraic equation solving speed.'),
(3, 5, 2, 'Fractions', 180, 72.5, 'Focus on understanding fractions deeply.');


-- ----------------------------
-- Table structure for Attendance
-- ----------------------------
DROP TABLE IF EXISTS `Attendance`;
CREATE TABLE `Attendance` (
  `AttendanceID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `SessionID` int NOT NULL,
  `Date` date NOT NULL,
  `IsPresent` tinyint(1) NOT NULL,
  `CourseID` int DEFAULT NULL,
  PRIMARY KEY (`AttendanceID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  KEY `FK_Attendance_Course` (`CourseID`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`),
  CONSTRAINT `FK_Attendance_Course` FOREIGN KEY (`CourseID`) REFERENCES `Course` (`CourseID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Dumping data for table `Attendance`
-- ----------------------------

INSERT INTO `Attendance` VALUES 
(1, 3, 1, '2024-01-15', 1, NULL),
(2, 4, 1, '2024-01-15', 1, NULL),
(3, 5, 2, '2024-01-16', 1, NULL);


-- ----------------------------
-- Table structure for Course
-- ----------------------------
DROP TABLE IF EXISTS `Course`;
CREATE TABLE `Course` (
  `CourseID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `TeacherID` int NOT NULL,
  PRIMARY KEY (`CourseID`),
  KEY `TeacherID` (`TeacherID`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`TeacherID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Dumping data for table `Course`
-- ----------------------------

INSERT INTO `Course` VALUES 
(1, 'Computer Science', 1),
(2, 'Mathematics', 2);


-- ----------------------------
-- Table structure for PostureDetection
-- ----------------------------
DROP TABLE IF EXISTS `PostureDetection`;
CREATE TABLE `PostureDetection` (
  `PostureDetectionID` int NOT NULL AUTO_INCREMENT,
  `SessionID` int NOT NULL,
  `GoodPostureTime` float NOT NULL,
  `SlouchingTime` float NOT NULL,
  `LookingLeftTime` float NOT NULL,
  `LookingRightTime` float NOT NULL,
  `UsingPhoneTime` float NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PostureDetectionID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `posturedetection_ibfk_1` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Dumping data for table `PostureDetection`
-- ----------------------------

INSERT INTO `PostureDetection` VALUES 
(1, 1, 6.9741, 0.8508, 0.4816, 0.8176, 0, '2025-03-03 22:38:35'),
(2, 1, 6.507, 1.1016, 0, 0.5478, 0, '2025-03-04 17:28:56'),
(3, 1, 11.0348, 2.3257, 0, 0.2666, 0, '2025-03-04 18:14:09'),
(4, 1, 1.2106, 0, 0, 0, 0, '2025-03-04 18:32:31'),
(5, 1, -0.2556, 8.7765, 7.864, 0.7451, 0, '2025-03-08 12:38:06'),
(6, 1, 7.552, 1.8447, 0, 0, 0, '2025-03-11 21:26:20'),
(7, 1, 0.0217, 0.8778, 0, 0, 0, '2025-03-12 15:01:45'),
(8, 1, 3.8205, 0.8426, 0.9747, 0, 0, '2025-03-16 04:19:36'),
(9, 1, 2.0086, 0, 0, 0, 0, '2025-03-16 04:29:03'),
(10, 1, 2.183, 1.747, 0, 0, 0, '2025-03-16 22:48:41');


-- ----------------------------
-- Table structure for Lecture
-- ----------------------------
DROP TABLE IF EXISTS `Lecture`;
CREATE TABLE `Lecture` (
  `LectureID` int NOT NULL AUTO_INCREMENT,
  `SessionID` int NOT NULL,
  `CourseID` int NOT NULL,
  `LectureName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `DirectoryPath` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `SlideCount` int NOT NULL,
  `StartTimestamp` datetime DEFAULT NULL,
  `EndTimestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`LectureID`),
  KEY `SessionID` (`SessionID`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `lecture_ibfk_1` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`),
  CONSTRAINT `lecture_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `Course` (`CourseID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Dumping data for table `Lecture`
-- ----------------------------

INSERT INTO `Lecture` VALUES 
(1, 1, 1, 'Introduction to Programming', '/lectures/programming_intro.pdf', 10, '2024-01-15 09:00:00', '2024-01-15 10:30:00'),
(2, 2, 2, 'Algebra Basics', '/lectures/algebra_basics.pdf', 8, '2024-01-16 10:00:00', '2024-01-16 11:00:00');


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
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `UserType` enum('Student','Teacher') COLLATE utf8mb4_general_ci NOT NULL,
  `Threshold` float DEFAULT NULL,
  `Status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Active',
  `Nationality` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pakistani',
  `Gender` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Male',
  `DOB` date DEFAULT '1997-01-01',
  `MobileNumber` varchar(15) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '+92 300 1234567',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `password_UNIQUE` (`password`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Dumping data for table `User`
-- ----------------------------

INSERT INTO `User` VALUES 
(1, 'Ahmed Ali', 'ahmed.ali@gmail.com', 'default_1', 'Teacher', 0.75, 'Active', 'Pakistani', 'Male', '1997-01-01', '+92 300 1234567'),
(2, 'Fatima Khan', 'fatima.khan@gmail.com', 'default_2', 'Teacher', 0.8, 'Active', 'Pakistani', 'Male', '1997-01-01', '+92 300 1234567'),
(3, 'Hassan Raza', 'hassan.raza@gmail.com', 'default_3', 'Student', NULL, 'Active', 'Pakistani', 'Male', '1997-01-01', '+92 300 1234567'),
(4, 'Ayesha Malik', 'ayesha.malik@gmail.com', 'default_4', 'Student', NULL, 'Active', 'Pakistani', 'Male', '1997-01-01', '+92 300 1234567'),
(5, 'Zainab Tariq', 'zainab.tariq@gmail.com', 'default_5', 'Student', NULL, 'Active', 'Pakistani', 'Male', '1997-01-01', '+92 300 1234567');


-- Removing NOT NULL from lecture.startTimeStamp and endTimestamp
ALTER TABLE `scholarwatch`.`lecture` 
CHANGE COLUMN `StartTimestamp` `StartTimestamp` DATETIME NULL ,
CHANGE COLUMN `EndTimestamp` `EndTimestamp` DATETIME NULL ;

-- Creating password column in user table --

-- SET SQL_SAFE_UPDATES = 0;
-- ALTER TABLE `scholarwatch`.`user` 
-- ADD COLUMN `password` VARCHAR(45) NOT NULL AFTER `Email`;


SET SQL_SAFE_UPDATES = 0;

-- -- Ensure passwords are updated first
-- UPDATE scholarwatch.user
-- SET password = CONCAT('default_', UserId)
-- WHERE password = '' OR password IS NULL;

-- SELECT UserID, password FROM scholarwatch.user WHERE password = '' OR password IS NULL;

-- -- Check for duplicate passwords
-- SELECT password, COUNT(*) 
-- FROM scholarwatch.user
-- GROUP BY password
-- HAVING COUNT(*) > 1;

-- -- Add the unique constraint (ensure no duplicates)
-- ALTER TABLE scholarwatch.user 
-- ADD UNIQUE INDEX password_UNIQUE (password);

-- SET SQL_SAFE_UPDATES = 1;

-- SET FOREIGN_KEY_CHECKS = 1;
-- ----------------------------------------
ALTER TABLE `scholarwatch`.`quiz` 
ADD COLUMN `ContentID` INT(11) NULL;

-- Creating password column in user table --
-- SET SQL_SAFE_UPDATES = 0;
-- ALTER TABLE `scholarwatch`.`user` 
-- ADD COLUMN `password` VARCHAR(45) NOT NULL AFTER `Email`;
-- UPDATE `scholarwatch`.`user` 
-- SET `password` = CONCAT('default_', `UserId`);
-- ALTER TABLE `scholarwatch`.`user` 
-- ADD UNIQUE INDEX `password_UNIQUE` (`password`);
-- SET SQL_SAFE_UPDATES = 1;
-- ----------------------------------------

ALTER TABLE `scholarwatch`.`quiz` 
ADD COLUMN `is_invalid` TINYINT NULL AFTER `ContentID`;

-- table for attention
CREATE TABLE `scholarwatch`.`attention` (
  `AttentionID` INT(11) NOT NULL AUTO_INCREMENT,
  `ModuleID` INT(11) NOT NULL,
  PRIMARY KEY (`AttentionID`),
  KEY `ModuleID` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `scholarwatch`.`attention` 
ADD COLUMN `awake_time` DECIMAL(2) NULL AFTER `ModuleID`,
ADD COLUMN `drowsy_time` DECIMAL(2) NULL AFTER `awake_time`,
ADD COLUMN `focused_time` DECIMAL(2) NULL AFTER `drowsy_time`,
ADD COLUMN `unfocused_time` DECIMAL(2) NULL AFTER `focused_time`;

-- dummy values for attention table

INSERT INTO `scholarwatch`.`attention` (`ModuleID`, `awake_time`, `drowsy_time`, `focused_time`, `unfocused_time`) 
VALUES 
(1, 1.5, 0.5, 2.0, 0.5), 
(2, 2.0, 0.4, 1.5, 0.3), 
(3, 1.2, 0.8, 1.8, 0.7), 
(4, 2.5, 0.3, 2.1, 0.6), 
(5, 1.8, 0.6, 2.3, 0.4);