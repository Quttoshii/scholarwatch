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

 Date: 13/11/2024 23:28:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ActivityMonitoring
-- ----------------------------
DROP TABLE IF EXISTS `ActivityMonitoring`;
CREATE TABLE `ActivityMonitoring` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `activitymonitoring_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ActivityMonitoring
-- ----------------------------
BEGIN;
INSERT INTO `ActivityMonitoring` (`ModuleID`) VALUES (301);
INSERT INTO `ActivityMonitoring` (`ModuleID`) VALUES (302);
INSERT INTO `ActivityMonitoring` (`ModuleID`) VALUES (303);
COMMIT;

-- ----------------------------
-- Table structure for Analytics
-- ----------------------------
DROP TABLE IF EXISTS `Analytics`;
CREATE TABLE `Analytics` (
  `AnalyticID` int(11) NOT NULL,
  `PerformanceMetrics` text DEFAULT NULL,
  `AttentionMetrics` text DEFAULT NULL,
  `AttendanceRecord` text DEFAULT NULL,
  `Grade` float DEFAULT NULL,
  `Marks` float DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `ModuleID` int(11) DEFAULT NULL,
  PRIMARY KEY (`AnalyticID`),
  KEY `UserID` (`UserID`),
  KEY `ModuleID` (`ModuleID`),
  CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `analytics_ibfk_2` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Analytics
-- ----------------------------
BEGIN;
INSERT INTO `Analytics` (`AnalyticID`, `PerformanceMetrics`, `AttentionMetrics`, `AttendanceRecord`, `Grade`, `Marks`, `UserID`, `ModuleID`) VALUES (601, 'High', '85%', 'Present', 3.7, 85, 101, 301);
INSERT INTO `Analytics` (`AnalyticID`, `PerformanceMetrics`, `AttentionMetrics`, `AttendanceRecord`, `Grade`, `Marks`, `UserID`, `ModuleID`) VALUES (602, 'Moderate', '75%', 'Present', 3, 70, 103, 302);
INSERT INTO `Analytics` (`AnalyticID`, `PerformanceMetrics`, `AttentionMetrics`, `AttendanceRecord`, `Grade`, `Marks`, `UserID`, `ModuleID`) VALUES (603, 'High', '90%', 'Present', 3.9, 88, 104, 303);
COMMIT;

-- ----------------------------
-- Table structure for AttendanceMonitoring
-- ----------------------------
DROP TABLE IF EXISTS `AttendanceMonitoring`;
CREATE TABLE `AttendanceMonitoring` (
  `ModuleID` int(11) NOT NULL,
  `AttendanceThreshold` int(11) DEFAULT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `attendancemonitoring_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of AttendanceMonitoring
-- ----------------------------
BEGIN;
INSERT INTO `AttendanceMonitoring` (`ModuleID`, `AttendanceThreshold`) VALUES (301, 75);
INSERT INTO `AttendanceMonitoring` (`ModuleID`, `AttendanceThreshold`) VALUES (302, 80);
INSERT INTO `AttendanceMonitoring` (`ModuleID`, `AttendanceThreshold`) VALUES (303, 70);
COMMIT;

-- ----------------------------
-- Table structure for Attention
-- ----------------------------
DROP TABLE IF EXISTS `Attention`;
CREATE TABLE `Attention` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `attention_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Attention
-- ----------------------------
BEGIN;
INSERT INTO `Attention` (`ModuleID`) VALUES (301);
INSERT INTO `Attention` (`ModuleID`) VALUES (302);
INSERT INTO `Attention` (`ModuleID`) VALUES (303);
COMMIT;

-- ----------------------------
-- Table structure for Content
-- ----------------------------
DROP TABLE IF EXISTS `Content`;
CREATE TABLE `Content` (
  `ContentID` int(11) NOT NULL,
  `SourceFile` text DEFAULT NULL,
  PRIMARY KEY (`ContentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Content
-- ----------------------------
BEGIN;
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (401, 'intro_to_cs.pdf');
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (402, 'math_for_computing.pdf');
INSERT INTO `Content` (`ContentID`, `SourceFile`) VALUES (403, 'ethics_in_tech.pdf');
COMMIT;

-- ----------------------------
-- Table structure for ExpressionRecognition
-- ----------------------------
DROP TABLE IF EXISTS `ExpressionRecognition`;
CREATE TABLE `ExpressionRecognition` (
  `anmID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `SessionID` int(11) DEFAULT NULL,
  PRIMARY KEY (`anmID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `expressionrecognition_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `expressionrecognition_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ExpressionRecognition
-- ----------------------------
BEGIN;
INSERT INTO `ExpressionRecognition` (`anmID`, `UserID`, `SessionID`) VALUES (901, 101, 501);
INSERT INTO `ExpressionRecognition` (`anmID`, `UserID`, `SessionID`) VALUES (902, 103, 502);
INSERT INTO `ExpressionRecognition` (`anmID`, `UserID`, `SessionID`) VALUES (903, 104, 503);
COMMIT;

-- ----------------------------
-- Table structure for GazeTracking
-- ----------------------------
DROP TABLE IF EXISTS `GazeTracking`;
CREATE TABLE `GazeTracking` (
  `anmID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `SessionID` int(11) DEFAULT NULL,
  PRIMARY KEY (`anmID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `gazetracking_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `gazetracking_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of GazeTracking
-- ----------------------------
BEGIN;
INSERT INTO `GazeTracking` (`anmID`, `UserID`, `SessionID`) VALUES (701, 101, 501);
INSERT INTO `GazeTracking` (`anmID`, `UserID`, `SessionID`) VALUES (702, 103, 502);
INSERT INTO `GazeTracking` (`anmID`, `UserID`, `SessionID`) VALUES (703, 104, 503);
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
  CONSTRAINT `lms_module_ibfk_1` FOREIGN KEY (`lmsID`) REFERENCES `ScholarWatchLMS` (`lmsID`),
  CONSTRAINT `lms_module_ibfk_2` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of LMS_Module
-- ----------------------------
BEGIN;
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (201, 301);
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (201, 302);
INSERT INTO `LMS_Module` (`lmsID`, `ModuleID`) VALUES (202, 303);
COMMIT;

-- ----------------------------
-- Table structure for Module
-- ----------------------------
DROP TABLE IF EXISTS `Module`;
CREATE TABLE `Module` (
  `ModuleID` int(11) NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  PRIMARY KEY (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Module
-- ----------------------------
BEGIN;
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (301, 'Computer Science Basics', 'Introduction to Computer Science fundamentals');
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (302, 'Mathematics for Computing', 'Mathematics concepts applied in computing');
INSERT INTO `Module` (`ModuleID`, `Title`, `Description`) VALUES (303, 'Ethics in Technology', 'Exploring ethical concerns in modern tech usage');
COMMIT;

-- ----------------------------
-- Table structure for Plugin
-- ----------------------------
DROP TABLE IF EXISTS `Plugin`;
CREATE TABLE `Plugin` (
  `PluginID` int(11) NOT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `Version` varchar(20) DEFAULT NULL,
  `ModerationIntegration` text DEFAULT NULL,
  PRIMARY KEY (`PluginID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Plugin
-- ----------------------------
BEGIN;
INSERT INTO `Plugin` (`PluginID`, `Name`, `Version`, `ModerationIntegration`) VALUES (1301, 'Zoom Integration', '1.0', 'Video moderation tool');
INSERT INTO `Plugin` (`PluginID`, `Name`, `Version`, `ModerationIntegration`) VALUES (1302, 'Attendance Tracker', '2.1', 'Automated attendance system');
INSERT INTO `Plugin` (`PluginID`, `Name`, `Version`, `ModerationIntegration`) VALUES (1303, 'Gaze Tracker', '1.5', 'Monitors student gaze during sessions');
COMMIT;

-- ----------------------------
-- Table structure for PostureDetection
-- ----------------------------
DROP TABLE IF EXISTS `PostureDetection`;
CREATE TABLE `PostureDetection` (
  `anmID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `SessionID` int(11) DEFAULT NULL,
  PRIMARY KEY (`anmID`),
  KEY `UserID` (`UserID`),
  KEY `SessionID` (`SessionID`),
  CONSTRAINT `posturedetection_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `posturedetection_ibfk_2` FOREIGN KEY (`SessionID`) REFERENCES `Session` (`SessionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of PostureDetection
-- ----------------------------
BEGIN;
INSERT INTO `PostureDetection` (`anmID`, `UserID`, `SessionID`) VALUES (801, 101, 501);
INSERT INTO `PostureDetection` (`anmID`, `UserID`, `SessionID`) VALUES (802, 103, 502);
INSERT INTO `PostureDetection` (`anmID`, `UserID`, `SessionID`) VALUES (803, 104, 503);
COMMIT;

-- ----------------------------
-- Table structure for Quiz
-- ----------------------------
DROP TABLE IF EXISTS `Quiz`;
CREATE TABLE `Quiz` (
  `QuizID` int(11) NOT NULL,
  `Question` text DEFAULT NULL,
  `CorrectAnswers` text DEFAULT NULL,
  `UserResponses` text DEFAULT NULL,
  `ContentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`QuizID`),
  KEY `ContentID` (`ContentID`),
  CONSTRAINT `quiz_ibfk_1` FOREIGN KEY (`ContentID`) REFERENCES `Content` (`ContentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Quiz
-- ----------------------------
BEGIN;
INSERT INTO `Quiz` (`QuizID`, `Question`, `CorrectAnswers`, `UserResponses`, `ContentID`) VALUES (1001, 'What is an algorithm?', 'A process or set of rules', 'A step-by-step process', 401);
INSERT INTO `Quiz` (`QuizID`, `Question`, `CorrectAnswers`, `UserResponses`, `ContentID`) VALUES (1002, 'What is the derivative of x^2?', '2x', 'x', 402);
INSERT INTO `Quiz` (`QuizID`, `Question`, `CorrectAnswers`, `UserResponses`, `ContentID`) VALUES (1003, 'What is digital ethics?', 'Ethics related to digital world', 'Ethics in tech', 403);
COMMIT;

-- ----------------------------
-- Table structure for QuizGeneration
-- ----------------------------
DROP TABLE IF EXISTS `QuizGeneration`;
CREATE TABLE `QuizGeneration` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `quizgeneration_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of QuizGeneration
-- ----------------------------
BEGIN;
INSERT INTO `QuizGeneration` (`ModuleID`) VALUES (301);
INSERT INTO `QuizGeneration` (`ModuleID`) VALUES (302);
INSERT INTO `QuizGeneration` (`ModuleID`) VALUES (303);
COMMIT;

-- ----------------------------
-- Table structure for ScholarWatchLMS
-- ----------------------------
DROP TABLE IF EXISTS `ScholarWatchLMS`;
CREATE TABLE `ScholarWatchLMS` (
  `lmsID` int(11) NOT NULL,
  PRIMARY KEY (`lmsID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ScholarWatchLMS
-- ----------------------------
BEGIN;
INSERT INTO `ScholarWatchLMS` (`lmsID`) VALUES (201);
INSERT INTO `ScholarWatchLMS` (`lmsID`) VALUES (202);
COMMIT;

-- ----------------------------
-- Table structure for Session
-- ----------------------------
DROP TABLE IF EXISTS `Session`;
CREATE TABLE `Session` (
  `SessionID` int(11) NOT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `ContentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`SessionID`),
  KEY `ContentID` (`ContentID`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`ContentID`) REFERENCES `Content` (`ContentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Session
-- ----------------------------
BEGIN;
INSERT INTO `Session` (`SessionID`, `Type`, `ContentID`) VALUES (501, 'Lecture', 401);
INSERT INTO `Session` (`SessionID`, `Type`, `ContentID`) VALUES (502, 'Tutorial', 402);
INSERT INTO `Session` (`SessionID`, `Type`, `ContentID`) VALUES (503, 'Seminar', 403);
COMMIT;

-- ----------------------------
-- Table structure for SlideGeneration
-- ----------------------------
DROP TABLE IF EXISTS `SlideGeneration`;
CREATE TABLE `SlideGeneration` (
  `ModuleID` int(11) NOT NULL,
  PRIMARY KEY (`ModuleID`),
  CONSTRAINT `slidegeneration_ibfk_1` FOREIGN KEY (`ModuleID`) REFERENCES `Module` (`ModuleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of SlideGeneration
-- ----------------------------
BEGIN;
INSERT INTO `SlideGeneration` (`ModuleID`) VALUES (301);
INSERT INTO `SlideGeneration` (`ModuleID`) VALUES (302);
INSERT INTO `SlideGeneration` (`ModuleID`) VALUES (303);
COMMIT;

-- ----------------------------
-- Table structure for SplitScreen
-- ----------------------------
DROP TABLE IF EXISTS `SplitScreen`;
CREATE TABLE `SplitScreen` (
  `anmID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  PRIMARY KEY (`anmID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `splitscreen_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of SplitScreen
-- ----------------------------
BEGIN;
INSERT INTO `SplitScreen` (`anmID`, `UserID`) VALUES (1101, 101);
INSERT INTO `SplitScreen` (`anmID`, `UserID`) VALUES (1102, 103);
INSERT INTO `SplitScreen` (`anmID`, `UserID`) VALUES (1103, 104);
COMMIT;

-- ----------------------------
-- Table structure for TabSwitching
-- ----------------------------
DROP TABLE IF EXISTS `TabSwitching`;
CREATE TABLE `TabSwitching` (
  `anmID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  PRIMARY KEY (`anmID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `tabswitching_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of TabSwitching
-- ----------------------------
BEGIN;
INSERT INTO `TabSwitching` (`anmID`, `UserID`) VALUES (1201, 101);
INSERT INTO `TabSwitching` (`anmID`, `UserID`) VALUES (1202, 103);
INSERT INTO `TabSwitching` (`anmID`, `UserID`) VALUES (1203, 104);
COMMIT;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `UserID` int(11) NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `UserType` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of User
-- ----------------------------
BEGIN;
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (101, 'Ali Khan', 'ali.khan@example.pk', 'Student');
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (102, 'Sara Ali', 'sara.ali@example.pk', 'Teacher');
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (103, 'Usman Raza', 'usman.raza@example.pk', 'Student');
INSERT INTO `User` (`UserID`, `Name`, `Email`, `UserType`) VALUES (104, 'Ayesha Malik', 'ayesha.malik@example.pk', 'Student');
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
  CONSTRAINT `user_lms_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`),
  CONSTRAINT `user_lms_ibfk_2` FOREIGN KEY (`lmsID`) REFERENCES `ScholarWatchLMS` (`lmsID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of User_LMS
-- ----------------------------
BEGIN;
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (101, 201);
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (102, 201);
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (104, 201);
INSERT INTO `User_LMS` (`UserID`, `lmsID`) VALUES (103, 202);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
