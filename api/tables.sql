DROP TABLE Reviews;
DROP TABLE User_Passwords;
DROP TABLE Users;
DROP TABLE Book_Genres;
DROP TABLE Genres;
DROP TABLE Book_Authors;
DROP TABLE Books;
DROP TABLE Publishers;
DROP TABLE Authors;

-- Create Authors table with separate columns for different social media platforms
CREATE TABLE Authors (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Publishers table
CREATE TABLE Publishers (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Books table with additional columns
CREATE TABLE Books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    publication_date DATE,
    publisher_id INT,
    language VARCHAR(50),
    paperback BOOLEAN,
    isbn_10 VARCHAR(20),
    isbn_13 VARCHAR(20),
    dimensions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES Publishers(publisher_id)
);

-- Create Book_Authors table (Many-to-Many Mapping)
CREATE TABLE Book_Authors (
    book_id INT,
    author_id INT,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (author_id) REFERENCES Authors(author_id),
    PRIMARY KEY (book_id, author_id)
);

-- Create Genres table
CREATE TABLE Genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Book_Genres table (Many-to-Many Mapping)
CREATE TABLE Book_Genres (
    book_id INT,
    genre_id INT,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id),
    PRIMARY KEY (book_id, genre_id)
);

-- Create Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100),
    name VARCHAR(100),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create User_Passwords table to store passwords and salts
CREATE TABLE User_Passwords (
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
CREATE TABLE Reviews (
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