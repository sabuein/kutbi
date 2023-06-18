/*
 
 SHOW DATABASES;
 CREATE DATABASE kutbi_27may;
 
 MariaDB [kutbi_27may]> SHOW TABLES;
 +-----------------------+
 | Tables_in_kutbi_27may |
 +-----------------------+
 | Authors               |
 | BookAuthors           |
 | BookGenres            |
 | BookImages            |
 | Books                 |
 | Genres                |
 | Publishers            |
 | Reviews               |
 | UserPasswords         |
 | Users                 |
 +-----------------------+
 
 CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
 GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'localhost';
 
 SHOW VARIABLES LIKE 'max_connections';
 SHOW STATUS WHERE `variable_name` = 'Threads_connected';
 
 */
USE kutbi_27may;

-- Drop all tables, if exists
DROP TABLE IF EXISTS Reviews;

DROP TABLE IF EXISTS UserPermissions;

DROP TABLE IF EXISTS UserRoles;

DROP TABLE IF EXISTS UserPasswords;

DROP TABLE IF EXISTS Users;

DROP TABLE IF EXISTS BookGenres;

DROP TABLE IF EXISTS Genres;

DROP TABLE IF EXISTS BookAuthors;

DROP TABLE IF EXISTS BookImages;

DROP TABLE IF EXISTS Books;

DROP TABLE IF EXISTS Publishers;

DROP TABLE IF EXISTS Authors;

-- Create Authors table
CREATE TABLE IF NOT EXISTS Authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    bio TEXT,
    dob DATE,
    lang VARCHAR(50),
    tel VARCHAR(20),
    country VARCHAR(100),
    email VARCHAR(100),
    github VARCHAR(100),
    twitter VARCHAR(100),
    facebook VARCHAR(100),
    instagram VARCHAR(100),
    youtube VARCHAR(100),
    website VARCHAR(100),
    photoUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

-- Create Publishers table
CREATE TABLE IF NOT EXISTS Publishers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company VARCHAR(255),
    imprint VARCHAR(255),
    bio TEXT,
    country VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    github VARCHAR(100),
    twitter VARCHAR(100),
    facebook VARCHAR(100),
    instagram VARCHAR(100),
    youtube VARCHAR(100),
    website VARCHAR(100),
    photoUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

-- Create Books table
CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    publicationDate DATE,
    publisherId INT,
    lang VARCHAR(50),
    paperback BOOLEAN,
    isbn10 VARCHAR(20),
    isbn13 VARCHAR(20),
    dimensions VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP,
    FOREIGN KEY (publisherId) REFERENCES Publishers(id)
);

-- Create BookImages table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS BookImages (
    id INT PRIMARY KEY,
    bookId INT,
    photoUrl VARCHAR(255),
    FOREIGN KEY (bookId) REFERENCES Books(id)
);

-- Create BookAuthors table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS BookAuthors (
    bookId INT,
    authorId INT,
    FOREIGN KEY (bookId) REFERENCES Books(id),
    FOREIGN KEY (authorId) REFERENCES Authors(id),
    PRIMARY KEY (bookId, authorId)
);

-- Create Genres table
CREATE TABLE IF NOT EXISTS Genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

-- Create BookGenres table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS BookGenres (
    bookId INT,
    genreId INT,
    FOREIGN KEY (bookId) REFERENCES Books(id),
    FOREIGN KEY (genreId) REFERENCES Genres(id),
    PRIMARY KEY (bookId, genreId)
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL DEFAULT LOWER(SYS_GUID()),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    fname VARCHAR(100),
    lname VARCHAR(100),
    dob DATE,
    bio TEXT,
    country VARCHAR(100),
    phone VARCHAR(20),
    github VARCHAR(100),
    twitter VARCHAR(100),
    facebook VARCHAR(100),
    instagram VARCHAR(100),
    youtube VARCHAR(100),
    website VARCHAR(100),
    photoUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

-- Create UserPasswords table
CREATE TABLE IF NOT EXISTS UserPasswords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    salt VARCHAR(50) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Create UserRoles table
CREATE TABLE IF NOT EXISTS UserRoles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    roles VARCHAR(255) NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Create UserPermissions table
CREATE TABLE IF NOT EXISTS UserPermissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    permissions VARCHAR(255) NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookId INT,
    userId INT,
    rating INT,
    review TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES Books(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

SHOW TABLES;

/*
 sudo systemctl stop mariadb
 sudo apt-get remove mariadb-server
 https://www.liquidweb.com/kb/upgrade-mariadb-ubuntu-18-04/
 */