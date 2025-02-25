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
-- Table structure for table `food_game`
--

DROP TABLE IF EXISTS `food_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_game` (
  `id` int NOT NULL AUTO_INCREMENT,
  `result_image` varchar(255) NOT NULL,
  `result_name` varchar(20) NOT NULL,
  `food1_id` int NOT NULL,
  `food2_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK481oje3c9wp8jhadql8rwo6n6` (`food1_id`),
  UNIQUE KEY `UK2jon69bjsgdf6n7lxwj6jllti` (`food2_id`),
  CONSTRAINT `FK481ykbgdq0g8s9ohy2mggv738` FOREIGN KEY (`food2_id`) REFERENCES `food_item` (`id`),
  CONSTRAINT `FKhc3g705ri91ho37tg594i3edj` FOREIGN KEY (`food1_id`) REFERENCES `food_item` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_game`
--

LOCK TABLES `food_game` WRITE;
/*!40000 ALTER TABLE `food_game` DISABLE KEYS */;
INSERT INTO `food_game` VALUES (1,'/foodImg/사과 파이.png','사과 파이',1,2),(2,'/foodImg/감자튀김.png','감자튀김',3,4),(3,'/foodImg/샌드위치.png','샌드위치',5,6),(4,'/foodImg/딸기 케이크.png','딸기 케이크',7,8),(5,'/foodImg/코코아.png','코코아',12,11),(6,'/foodImg/초밥.png','초밥',9,10),(7,'/foodImg/버터맛 팝콘.png','버터맛 팝콘',14,13),(8,'/foodImg/딸기잼 바른 식빵.png','딸기잼 바른 식빵',15,16),(9,'/foodImg/초코 쿠키.png','초코 쿠키',17,18);
/*!40000 ALTER TABLE `food_game` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-24 21:06:21
