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

 Date: 07/11/2024 01:26:08
*/
use moodle_local;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ActivityMonitoring
-- ----------------------------
DROP TABLE IF EXISTS `ActivityMonitoring`;
CREATE TABLE `ActivityMonitoring` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `activitymonitoring_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ActivityMonitoring
-- ----------------------------
BEGIN;
INSERT INTO `ActivityMonitoring` (`ModuleID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for Analytics
-- ----------------------------
DROP TABLE IF EXISTS `Analytics`;
CREATE TABLE `Analytics` (
  `AnalyticID` int(11) NOT NULL AUTO_INCREMENT,
  `PerformanceMetrics` float DEFAULT NULL,
  `AttentionMetrics` float DEFAULT NULL,
  `AttendanceRecord` float DEFAULT NULL,
  `Grade` varchar(50) DEFAULT NULL,
  `Marks` int(11) DEFAULT NULL,
  PRIMARY KEY (`AnalyticID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Analytics
-- ----------------------------
BEGIN;
INSERT INTO `Analytics` (`AnalyticID`, `PerformanceMetrics`, `AttentionMetrics`, `AttendanceRecord`, `Grade`, `Marks`) VALUES (1, 85.5, 90.2, 88, 'A', 90);
INSERT INTO `Analytics` (`AnalyticID`, `PerformanceMetrics`, `AttentionMetrics`, `AttendanceRecord`, `Grade`, `Marks`) VALUES (2, 60.3, 55.7, 65, 'C', 60);
INSERT INTO `Analytics` (`AnalyticID`, `PerformanceMetrics`, `AttentionMetrics`, `AttendanceRecord`, `Grade`, `Marks`) VALUES (3, 72, 78.5, 70, 'B', 75);
COMMIT;

-- ----------------------------
-- Table structure for AttendanceMonitoring
-- ----------------------------
DROP TABLE IF EXISTS `AttendanceMonitoring`;
CREATE TABLE `AttendanceMonitoring` (
  `ModuleID` int(11) NOT NULL,
  `AttendanceThreshold` int(11) DEFAULT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `attendancemonitoring_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of AttendanceMonitoring
-- ----------------------------
BEGIN;
INSERT INTO `AttendanceMonitoring` (`ModuleID`, `AttendanceThreshold`) VALUES (3, 75);
COMMIT;

-- ----------------------------
-- Table structure for Attention
-- ----------------------------
DROP TABLE IF EXISTS `Attention`;
CREATE TABLE `Attention` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `attention_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Attention
-- ----------------------------
BEGIN;
INSERT INTO `Attention` (`ModuleID`) VALUES (4);
COMMIT;

-- ----------------------------
-- Table structure for Content
-- ----------------------------
DROP TABLE IF EXISTS `Content`;
CREATE TABLE `Content` (
  `ContentID` int(11) NOT NULL AUTO_INCREMENT,
  `SourceFile` varchar(255) NOT NULL,
  PRIMARY KEY (`ContentID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Content
-- ----------------------------
BEGIN;
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (1, 'lecture1.pdf');
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (2, 'lecture2.pdf');
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (3, 'quiz1.docx');
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (4, 'lecture_slides.pptx');
COMMIT;

-- ----------------------------
-- Table structure for ExpressionRecognition
-- ----------------------------
DROP TABLE IF EXISTS `ExpressionRecognition`;
CREATE TABLE `ExpressionRecognition` (
  `anmID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`anmID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ExpressionRecognition
-- ----------------------------
BEGIN;
INSERT INTO `ExpressionRecognition` (`anmID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for GazeTracking
-- ----------------------------
DROP TABLE IF EXISTS `GazeTracking`;
CREATE TABLE `GazeTracking` (
  `anmID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`anmID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of GazeTracking
-- ----------------------------
BEGIN;
INSERT INTO `GazeTracking` (`anmID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for LMS_Module
-- ----------------------------
DROP TABLE IF EXISTS `LMS_Module`;
CREATE TABLE `LMS_Module` (
  `lmsID` int(11) NOT NULL,
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`lmsID`,`ModuleID`),
  KEY `ModuleID` (`ModuleID`),
  CONSTRAINT `lms_module_ibfk_1` FOREIGN KEY (`lmsID`) REFERENCES `ScholarWatchLMS` (`lmsID`) ON DELETE CASCADE,
  CONSTRAINT `lms_module_ibfk_2` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of LMS_Module
-- ----------------------------
BEGIN;
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (1, 1);
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (1, 2);
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (1, 3);
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (1, 4);
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (1, 5);
COMMIT;

-- ----------------------------
-- Table structure for Module
-- ----------------------------
DROP TABLE IF EXISTS `Module`;
CREATE TABLE `Module` (
  `ModuleID` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  PRIMARY KEY (`ModuleID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Module
-- ----------------------------
BEGIN;
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (1, 'Activity Monitoring', 'Monitors user activity during sessions');
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (2, 'Quiz Generation', 'Generates quizzes from lecture content');
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (3, 'Attendance Monitoring', 'Tracks attendance based on engagement');
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (4, 'Attention Tracking', 'Monitors student focus levels during sessions');
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (5, 'Slide Generation', 'Automatically generates slides from content');
COMMIT;

-- ----------------------------
-- Table structure for Plugin
-- ----------------------------
DROP TABLE IF EXISTS `Plugin`;
CREATE TABLE `Plugin` (
  `PluginID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Version` varchar(50) DEFAULT NULL,
  `ModerationIntegration` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`PluginID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Plugin
-- ----------------------------
BEGIN;
INSERT INTO `Plugin` (`PluginID`, `Name`, `Version`, `ModerationIntegration`) VALUES (1, 'Zoom Integration', '1.0', 1);
INSERT INTO `Plugin` (`PluginID`, `Name`, `Version`, `ModerationIntegration`) VALUES (2, 'QuizMaster', '2.1', 0);
INSERT INTO `Plugin` (`PluginID`, `Name`, `Version`, `ModerationIntegration`) VALUES (3, 'GradeBook', '1.5', 1);
COMMIT;

-- ----------------------------
-- Table structure for PostureDetection
-- ----------------------------
DROP TABLE IF EXISTS `PostureDetection`;
CREATE TABLE `PostureDetection` (
  `anmID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`anmID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of PostureDetection
-- ----------------------------
BEGIN;
INSERT INTO `PostureDetection` (`anmID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for Quiz
-- ----------------------------
DROP TABLE IF EXISTS `Quiz`;
CREATE TABLE `Quiz` (
  `QuizID` int(11) NOT NULL AUTO_INCREMENT,
  `Question` text NOT NULL,
  `CorrectAnswers` text DEFAULT NULL,
  `UserResponses` text DEFAULT NULL,
  PRIMARY KEY (`QuizID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Quiz
-- ----------------------------
BEGIN;
INSERT INTO `Quiz` (`QuizID`, `Question`, `CorrectAnswers`, `UserResponses`) VALUES (1, 'What is the capital of Pakistan?', 'Islamabad', 'Lahore, Karachi, Islamabad');
INSERT INTO `Quiz` (`QuizID`, `Question`, `CorrectAnswers`, `UserResponses`) VALUES (2, 'Who is known as the father of Pakistan?', 'Quaid-e-Azam', 'Quaid-e-Azam, Allama Iqbal');
INSERT INTO `Quiz` (`QuizID`, `Question`, `CorrectAnswers`, `UserResponses`) VALUES (3, 'When did Pakistan gain independence?', '1947', '1940, 1947, 1956');
COMMIT;

-- ----------------------------
-- Table structure for QuizGeneration
-- ----------------------------
DROP TABLE IF EXISTS `QuizGeneration`;
CREATE TABLE `QuizGeneration` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `quizgeneration_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of QuizGeneration
-- ----------------------------
BEGIN;
INSERT INTO `QuizGeneration` (`ModuleID`) VALUES (2);
COMMIT;

-- ----------------------------
-- Table structure for ScholarWatchLMS
-- ----------------------------
DROP TABLE IF EXISTS `ScholarWatchLMS`;
CREATE TABLE `ScholarWatchLMS` (
  `lmsID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`lmsID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ScholarWatchLMS
-- ----------------------------
BEGIN;
INSERT INTO `ScholarWatchLMS` (`lmsID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for Session
-- ----------------------------
DROP TABLE IF EXISTS `Session`;
CREATE TABLE `Session` (
  `SessionID` int(11) NOT NULL AUTO_INCREMENT,
  `Type` enum('Lecture','Quiz') NOT NULL,
  `ContentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`SessionID`),
  KEY `ContentID` (`ContentID`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`ContentID`) REFERENCES `Content` (`ContentID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Session
-- ----------------------------
BEGIN;
INSERT INTO `Session` (`SessionID`, `Type`, `ContentID`) VALUES (1, 'Lecture', 1);
INSERT INTO `Session` (`SessionID`, `Type`, `ContentID`) VALUES (2, 'Lecture', 2);
INSERT INTO `Session` (`SessionID`, `Type`, `ContentID`) VALUES (3, 'Quiz', 3);
COMMIT;

-- ----------------------------
-- Table structure for SlideGeneration
-- ----------------------------
DROP TABLE IF EXISTS `SlideGeneration`;
CREATE TABLE `SlideGeneration` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `slidegeneration_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of SlideGeneration
-- ----------------------------
BEGIN;
INSERT INTO `SlideGeneration` (`ModuleID`) VALUES (5);
COMMIT;

-- ----------------------------
-- Table structure for SplitScreen
-- ----------------------------
DROP TABLE IF EXISTS `SplitScreen`;
CREATE TABLE `SplitScreen` (
  `anmID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`anmID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of SplitScreen
-- ----------------------------
BEGIN;
INSERT INTO `SplitScreen` (`anmID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for TabSwitching
-- ----------------------------
DROP TABLE IF EXISTS `TabSwitching`;
CREATE TABLE `TabSwitching` (
  `anmID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`anmID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of TabSwitching
-- ----------------------------
BEGIN;
INSERT INTO `TabSwitching` (`anmID`) VALUES (1);
COMMIT;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `UserType` enum('Instructor','Student') NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of User
-- ----------------------------
BEGIN;
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (1, 'Ali Khan', 'alikhan@student.fast.edu.pk', 'Student');
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (2, 'Sara Malik', 'saramalik@student.fast.edu.pk', 'Student');
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (3, 'Ahmed Raza', 'ahmedraza@instructor.fast.edu.pk', 'Instructor');
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (4, 'Hina Shah', 'hinashah@instructor.fast.edu.pk', 'Instructor');
COMMIT;

-- ----------------------------
-- Table structure for User_LMS
-- ----------------------------
DROP TABLE IF EXISTS `User_LMS`;
CREATE TABLE `User_LMS` (
  `UserID` int(11) NOT NULL,
  `lmsID` int(11) NOT NULL,
  PRIMARY KEY (`UserID`,`lmsID`),
  KEY `lmsID` (`lmsID`),
  CONSTRAINT `user_lms_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `user_lms_ibfk_2` FOREIGN KEY (`lmsID`) REFERENCES `ScholarWatchLMS` (`lmsID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of User_LMS
-- ----------------------------
BEGIN;
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (1, 1);
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (2, 1);
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (3, 1);
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (4, 1);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
