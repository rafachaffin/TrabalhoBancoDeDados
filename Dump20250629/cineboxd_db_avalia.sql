-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cineboxd_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avalia`
--

DROP TABLE IF EXISTS `avalia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avalia` (
  `ID_Avaliacao` int NOT NULL,
  `Nota` decimal(2,1) NOT NULL,
  `Review` varchar(1000) DEFAULT NULL,
  `Data_Avaliacao` date NOT NULL,
  `ID_Filme` int NOT NULL,
  `Apelido` varchar(30) NOT NULL,
  PRIMARY KEY (`Apelido`,`ID_Filme`,`ID_Avaliacao`),
  KEY `ID_Filme` (`ID_Filme`),
  CONSTRAINT `avalia_ibfk_1` FOREIGN KEY (`ID_Filme`) REFERENCES `filme` (`ID_Filme`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `avalia_ibfk_2` FOREIGN KEY (`Apelido`) REFERENCES `usuario` (`Apelido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `avalia_chk_1` CHECK ((`Nota` in (0.5,1,1.5,2,2.5,3,3.5,4,4.5,5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avalia`
--

LOCK TABLES `avalia` WRITE;
/*!40000 ALTER TABLE `avalia` DISABLE KEYS */;
/*!40000 ALTER TABLE `avalia` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-29 16:51:21
