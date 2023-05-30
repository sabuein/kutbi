"use strict";

import mysql from "mysql";
import dotenv from "dotenv";
import { timestamp } from "./helpers.mjs";

dotenv.config({ path: "./.env" });

// Access the environment variables
const dbHost = process.env.dbhost;
const dbPort = process.env.dbport;
const dbUser = process.env.dbuser;
const dbPassword = process.env.dbpassword;
const dbName = process.env.dbname;

/*

const connection = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName
});

connection.connect((error) => {
  if (error) {
    console.error(`error connecting: ${error.stack}`);
    throw error;
  }
  console.log(`Connected to the database as id ${connection.threadId}`);
});

connection.end((error) => {
  if (error) throw error;
  console.log('Database connection closed!');
});

*/

const init = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectionLimit: 10
};

const getAll = (request, response, columnName) => {
  // INSERT, UPDATE, DELETE, etc. 
  const pool = mysql.createPool(init), statement = `SELECT * FROM ${columnName}`;
  pool.query(statement, (error, result, fields) => {
    if (error) throw error;
    console.log(result);
    response.json(result);
    pool.end();
  });
};

const addAuthor = (request, response) => {
  const pool = mysql.createPool(init), statement = `INSERT INTO Authors (fname, lname) VALUES (?, ?)`;
  let values = [(request.query.fname), (request.query.lname)];
  pool.query(statement, values, (error, result) => {
    if (error) throw error;
    console.log(`1 author inserted with ID: ${result.insertId}`);
    response.json({ type: "author", id: result.insertId });
    pool.end();
  });
};

const addPublisher = (request, response) => {
  const pool = mysql.createPool(init), statement = `INSERT INTO Publishers (name, website) VALUES (?, ?)`;
  let values = [(request.query.name), (request.query.website)];
  pool.query(statement, values, (error, result) => {
    if (error) throw error;
    console.log(`1 publisher inserted with ID: ${result.insertId}`);
    response.json({ type: "publisher", id: result.insertId });
    pool.end();
  });
};

const addBook = (request, response) => {
  const pool = mysql.createPool(init), statement = `INSERT INTO Books (title, publication_date, publisher_id, language, paperback, isbn_13) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    String(request.query.title),
    request.query.publication_date,
    request.query.publisher_id,
    String(request.query.language),
    Boolean(request.query.paperback),
    request.query.isbn_13
  ];
  pool.query(statement, values, (error, result, fields) => {
    if (error) throw error;
    console.log(`1 book inserted with ID: ${result.insertId}`);
    response.json({ type: "book", id: result.insertId });
    pool.end();
  });
};

export { getAll, addAuthor, addPublisher, addBook, };

/*

SHOW DATABASES;
CREATE DATABASE kutbi_27may;
USE kutbi_27may;
SHOW TABLES;

MariaDB [kutbi_27may]> show tables;
+-----------------------+
| Tables_in_kutbi_27may |
+-----------------------+
| Authors               |
| Book_Authors          |
| Book_Genres           |
| Books                 |
| Genres                |
| Publishers            |
| Reviews               |
| User_Passwords        |
| Users                 |
+-----------------------+

CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'localhost';

SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS WHERE `variable_name` = 'Threads_connected';

*/