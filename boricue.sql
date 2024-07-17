-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 17, 2024 at 10:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `boricue`
--

-- --------------------------------------------------------

--
-- Table structure for table `factura`
--

CREATE TABLE `factura` (
  `idFactura` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fecha` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `metodopago`
--

CREATE TABLE `metodopago` (
  `idMetodopago` int(11) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `ntarjeta` varchar(15) NOT NULL,
  `codigoQR` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proceso`
--

CREATE TABLE `proceso` (
  `idProceso` int(11) NOT NULL,
  `idRegProducto` int(11) NOT NULL,
  `idFactura` int(11) NOT NULL,
  `idMetodopago` int(11) NOT NULL,
  `accion` varchar(15) NOT NULL,
  `valoru` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `proceso`
--
DELIMITER $$
CREATE TRIGGER `inventario` AFTER INSERT ON `proceso` FOR EACH ROW BEGIN
    DECLARE cant_actual INT;
    SELECT cantFin INTO cant_actual FROM regproducto WHERE idRegProducto = NEW.idRegProducto;

    IF cant_actual - NEW.cantidad < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La cantidad final del producto sería menor a cero.';
    ELSE
        UPDATE regproducto 
        SET cantFin = cantFin - NEW.cantidad,
            estado = CASE WHEN cantFin - NEW.cantidad = 0 THEN 'Finalizado' ELSE estado END
        WHERE idRegProducto = NEW.idRegProducto;

        IF (cant_actual - NEW.cantidad = 0) THEN
            UPDATE regproducto 
            SET estado = 'Finalizado' WHERE idRegProducto = NEW.idRegProducto;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `producto`
--

CREATE TABLE `producto` (
  `idProducto` int(11) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `precio` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `producto`
--

INSERT INTO `producto` (`idProducto`, `imagen`, `nombre`, `categoria`, `tipo`, `precio`, `descripcion`, `usuario_id`) VALUES
(1, '1721238644473.png', 'upload testing [Sell]', 'Venta', 'Cuero', '$10000', 'upload test #1', 1),
(2, '1721238814720.png', 'upload testing [Trade]', 'Intercambio', 'Papel', 'CAMBIO', 'upload test #2', 1),
(3, '1721239024850.png', 'upload testing [Donation]', 'Donacion', 'Cuero', 'GRATIS', 'upload test #3 ', 1);

-- --------------------------------------------------------

--
-- Table structure for table `regproducto`
--

CREATE TABLE `regproducto` (
  `idRegProducto` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantIni` int(11) NOT NULL,
  `cantFin` int(11) NOT NULL,
  `longitud` int(11) NOT NULL,
  `fecha` varchar(10) NOT NULL,
  `categoria` varchar(15) NOT NULL,
  `estado` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `identificacion` varchar(10) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(10) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasena` varchar(200) NOT NULL,
  `rol` varchar(15) NOT NULL,
  `estado` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `identificacion`, `nombres`, `direccion`, `telefono`, `correo`, `contrasena`, `rol`, `estado`) VALUES
(1, '1', 'testing', '1', '1', 'tester@test.com', '$2a$08$qyuof6kymqqR3YrmWXsP9uN4woQ0hscHvRmSGABajsNG9PIntDXFC', 'Usuario', 'Activo');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`idFactura`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indexes for table `metodopago`
--
ALTER TABLE `metodopago`
  ADD PRIMARY KEY (`idMetodopago`);

--
-- Indexes for table `proceso`
--
ALTER TABLE `proceso`
  ADD PRIMARY KEY (`idProceso`),
  ADD KEY `idFactura` (`idFactura`),
  ADD KEY `idRegProducto` (`idRegProducto`),
  ADD KEY `idMetodopago` (`idMetodopago`) USING BTREE;

--
-- Indexes for table `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`idProducto`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indexes for table `regproducto`
--
ALTER TABLE `regproducto`
  ADD PRIMARY KEY (`idRegProducto`),
  ADD KEY `idProducto` (`idProducto`) USING BTREE;

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `factura`
--
ALTER TABLE `factura`
  MODIFY `idFactura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `metodopago`
--
ALTER TABLE `metodopago`
  MODIFY `idMetodopago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proceso`
--
ALTER TABLE `proceso`
  MODIFY `idProceso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `producto`
--
ALTER TABLE `producto`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `regproducto`
--
ALTER TABLE `regproducto`
  MODIFY `idRegProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `proceso`
--
ALTER TABLE `proceso`
  ADD CONSTRAINT `proceso_ibfk_1` FOREIGN KEY (`idFactura`) REFERENCES `factura` (`idFactura`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proceso_ibfk_2` FOREIGN KEY (`idRegProducto`) REFERENCES `regproducto` (`idRegProducto`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proceso_ibfk_3` FOREIGN KEY (`idMetodopago`) REFERENCES `metodopago` (`idMetodopago`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`idUsuario`);

--
-- Constraints for table `regproducto`
--
ALTER TABLE `regproducto`
  ADD CONSTRAINT `regproducto_ibfk_1` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
