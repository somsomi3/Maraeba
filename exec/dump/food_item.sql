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
-- Table structure for table `food_item`
--

DROP TABLE IF EXISTS `food_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `food_image` varchar(255) DEFAULT NULL,
  `ingredient_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_item`
--

LOCK TABLES `food_item` WRITE;
/*!40000 ALTER TABLE `food_item` DISABLE KEYS */;
INSERT INTO `food_item` VALUES (1,'/foodItemImg/사과.png','사과'),(2,'/foodItemImg/파이 반죽.png','파이 반죽'),(3,'/foodItemImg/감자.png','감자'),(4,'/foodItemImg/기름.png','기름'),(5,'/foodItemImg/빵.png','빵'),(6,'/foodItemImg/야채.png','야채'),(7,'/foodItemImg/딸기.png','딸기'),(8,'/foodItemImg/케이크 시트.png','케이크 시트'),(9,'/foodItemImg/밥.png','밥'),(10,'/foodItemImg/생선 살.png','생선 살'),(11,'/foodItemImg/우유.png','우유'),(12,'/foodItemImg/코코아 가루.png','코코아 가루'),(13,'/foodItemImg/옥수수.png','옥수수'),(14,'/foodItemImg/버터.png','버터'),(15,'/foodItemImg/딸기잼.png','딸기잼'),(16,'/foodItemImg/식빵.png','식빵'),(17,'/foodItemImg/초콜릿.png','초콜릿'),(18,'/foodItemImg/쿠키 반죽.png','쿠키 반죽'),(19,NULL,'밀가루'),(20,NULL,'당근'),(21,NULL,'고기'),(22,NULL,'빵가루'),(23,NULL,'부추'),(24,NULL,'꿀'),(25,NULL,'면'),(26,NULL,'설탕');
/*!40000 ALTER TABLE `food_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-24 21:06:24
