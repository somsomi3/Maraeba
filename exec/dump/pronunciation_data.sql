-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: localhost    Database: maraeba_db
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `pronunciation_data`
--

DROP TABLE IF EXISTS `pronunciation_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pronunciation_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `lip_video_url` varchar(255) NOT NULL,
  `pronunciation` varchar(255) NOT NULL,
  `sequence` int NOT NULL,
  `tongue_image_url` varchar(255) NOT NULL,
  `tutorial_video_url` varchar(255) NOT NULL,
  `class_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6i40wsp1aj7ubktbcs9ssutv3` (`class_id`),
  CONSTRAINT `FK6i40wsp1aj7ubktbcs9ssutv3` FOREIGN KEY (`class_id`) REFERENCES `pronunciation_class` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pronunciation_data`
--

LOCK TABLES `pronunciation_data` WRITE;
/*!40000 ALTER TABLE `pronunciation_data` DISABLE KEYS */;
INSERT INTO `pronunciation_data` VALUES (1,NULL,NULL,'입을 크게 벌리고, 혀는 편하게 아래쪽에 둬요.','/videos/아.mp4','아',1,'/tongue/아.png','/voice/모음/아.mp4',1),(2,NULL,NULL,'입을 조금만 벌리고, 혀를 안쪽으로 살짝 당겨요.','/videos/어.mp4','어',2,'/tongue/어.png','/voice/모음/어.mp4',1),(3,NULL,NULL,'입을 작게 벌려 윗니랑 아랫니가 닿게 하고, 혀를 입 안쪽으로 당겨요.','/videos/으.mp4','으',3,'/tongue/으.png','/voice/모음/으.mp4',1),(4,NULL,NULL,'입을 조금만 벌리고 입술을 둥글게 모아서, 혀를 안쪽으로 당겨요.','/videos/오.mp4','오',4,'/tongue/오.png','/voice/모음/오.mp4',1),(5,NULL,NULL,'입을 조금만 벌리고, 혀를 내리고 안쪽으로 살짝 당겨요.','/videos/에.mp4','에',5,'/tongue/에.png','/voice/모음/에.mp4',1),(6,NULL,NULL,'입을 작게 벌려 윗니랑 아랫니가 닿게 하고, 혀끝을 아랫니에 대요.','/videos/이.mp4','이',6,'/tongue/이.png','/voice/모음/이.mp4',1),(7,NULL,NULL,'\"이\"와 \"아\"를 연속으로 이어서 빠르게 발음해요.','/videos/야.mp4','야',1,'/tongue/아.png','/voice/이중모음/야.mp4',2),(8,NULL,NULL,'\"이\"와 \"어\"를 연속으로 이어서 빠르게 발음해요.','/videos/여.mp4','여',2,'/tongue/어.png','/voice/이중모음/여.mp4',2),(9,NULL,NULL,'\"이\"와 \"오\"를 연속으로 이어서 빠르게 발음해요.','/videos/요.mp4','요',3,'/tongue/오.png','/voice/이중모음/요.mp4',2),(10,NULL,NULL,'\"이\"와 \"우\"를 연속으로 이어서 빠르게 발음해요.','/videos/유.mp4','유',4,'/tongue/우.png','/voice/이중모음/유.mp4',2),(11,NULL,NULL,'\"으\"와 \"이\"를 연속으로 이어서 빠르게 발음해요.','/videos/의.mp4','의',5,'/tongue/이.png','/voice/이중모음/의.mp4',2),(12,NULL,NULL,'\"오\"와 \"아\"를 연속으로 이어서 빠르게 발음해요.','/videos/와.mp4','와',6,'/tongue/아.png','/voice/이중모음/와.mp4',2),(13,NULL,NULL,'\"우\"와 \"이\"를 연속으로 이어서 빠르게 발음해요.','/videos/위.mp4','위',7,'/tongue/이.png','/voice/이중모음/위.mp4',2),(14,NULL,NULL,'\"오\"와 \"애\"를 연속으로 이어서 빠르게 발음해요.','/videos/왜.mp4','왜',8,'/tongue/애.png','/voice/이중모음/왜.mp4',2);
/*!40000 ALTER TABLE `pronunciation_data` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-24 21:06:33
