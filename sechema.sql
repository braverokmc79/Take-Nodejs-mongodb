
CREATE TABLE `member` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30)  unique NOT NULL ,
  `password` varchar(250) DEFAULT NULL,
  `salt` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
)ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) unique NOT NULL,
  `email` varchar(30) unique NOT NULL,
  `hashed_password` varchar(100) DEFAULT NULL,
  `salt` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `federated_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unique NOT NULL,
  `provider` varchar(100) unique NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`) ,
  FOREIGN KEY (user_id) REFERENCES users(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  
