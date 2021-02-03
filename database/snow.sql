-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 03-Fev-2021 às 22:31
-- Versão do servidor: 10.4.14-MariaDB
-- versão do PHP: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `snow`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `dodges`
--

CREATE TABLE `dodges` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `lobby_id` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `dodges`
--

INSERT INTO `dodges` (`id`, `user_id`, `lobby_id`, `date`) VALUES
(4, '751595327567691787', 65, '2021-02-02 17:56:15'),
(5, '751595327567691787', 66, '2021-02-02 18:12:27'),
(6, '806188808483766283', 67, '2021-02-02 18:15:13'),
(7, '784905206726787102', 113, '2021-02-03 17:20:46'),
(8, '468536088546377728', 113, '2021-02-03 17:20:46');

-- --------------------------------------------------------

--
-- Estrutura da tabela `lobby`
--

CREATE TABLE `lobby` (
  `id` int(11) NOT NULL,
  `channel_id` varchar(255) DEFAULT NULL,
  `start_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `queue`
--

CREATE TABLE `queue` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `lobby_id` int(11) NOT NULL,
  `is_ready` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(250) NOT NULL,
  `elo` int(11) NOT NULL DEFAULT 1000,
  `in_queue` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `users`
--

INSERT INTO `users` (`id`, `user_id`, `elo`, `in_queue`) VALUES
(1, '751595327567691787', 1000, 0),
(2, '805999652033921046', 1000, 0),
(3, '806188808483766283', 1000, 0),
(4, '488418143291572237', 1000, 0),
(5, '806258575386607676', 1000, 0),
(6, '640640305128931339', 1000, 0),
(7, '784905206726787102', 1000, 0),
(8, '319163188564459520', 1000, 0),
(9, '754666447141208105', 1000, 0),
(10, '468536088546377728', 1000, 0),
(11, '682245757579165726', 1000, 0),
(12, '606088804733812752', 1000, 0),
(13, '473590025628418059', 1000, 0),
(14, '412351820942278667', 1000, 0),
(15, '630179720624865283', 1000, 0),
(16, '350246530026045443', 1000, 0),
(17, '629061226957373440', 1000, 0),
(18, '363702880412368896', 1000, 0),
(19, '719136002018508841', 1000, 0);

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `dodges`
--
ALTER TABLE `dodges`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `lobby`
--
ALTER TABLE `lobby`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `queue`
--
ALTER TABLE `queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lobby_id` (`lobby_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `dodges`
--
ALTER TABLE `dodges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `lobby`
--
ALTER TABLE `lobby`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT de tabela `queue`
--
ALTER TABLE `queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=197;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `queue`
--
ALTER TABLE `queue`
  ADD CONSTRAINT `queue_ibfk_1` FOREIGN KEY (`lobby_id`) REFERENCES `lobby` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
