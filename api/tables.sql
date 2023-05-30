-- Drop all tables, if exists
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS User_Passwords;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Book_Genres;
DROP TABLE IF EXISTS Genres;
DROP TABLE IF EXISTS Book_Authors;
DROP TABLE IF EXISTS Book_Images;
DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Publishers;
DROP TABLE IF EXISTS Authors;

-- Create Authors table
CREATE TABLE IF NOT EXISTS Authors (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(100),
    lname VARCHAR(100),
    dob DATE,
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
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Publishers table
CREATE TABLE IF NOT EXISTS Publishers (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(100),
    lname VARCHAR(100),
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
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Books table
CREATE TABLE IF NOT EXISTS Books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    publication_date DATE,
    publisher_id INT,
    lang VARCHAR(50),
    paperback BOOLEAN,
    isbn_10 VARCHAR(20),
    isbn_13 VARCHAR(20),
    dimensions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES Publishers(publisher_id)
);

-- Create Book_Images table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS Book_Images (
    id INT PRIMARY KEY,
    book_id INT,
    photo_url VARCHAR(255),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

-- Create Book_Authors table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS Book_Authors (
    book_id INT,
    author_id INT,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (author_id) REFERENCES Authors(author_id),
    PRIMARY KEY (book_id, author_id)
);

-- Create Genres table
CREATE TABLE IF NOT EXISTS Genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Book_Genres table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS Book_Genres (
    book_id INT,
    genre_id INT,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id),
    PRIMARY KEY (book_id, genre_id)
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    fname VARCHAR(100),
    lname VARCHAR(100),
    dob DATE,
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
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create User_Passwords table
CREATE TABLE IF NOT EXISTS User_Passwords (
    user_id INT,
    password_hash VARCHAR(100),
    salt VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    PRIMARY KEY (user_id)
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    user_id INT,
    rating INT,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);