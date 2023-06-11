"use strict";

import dotenv from "dotenv";
import mysql from "mysql";
import { timestamp } from "./helpers.mjs";

dotenv.config({ path: "./.env" });

// Access the environment variables
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

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
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 10
};

const pool = mysql.createPool(init);

// Helper function to get a connection from the pool
const getConnectionFromPool = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(connection);
    });
  });
};

// Helper function to execute a query
const executeQuery = (connection, query, params) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
};

// Helper function to release a connection back to the pool
const releaseConnection = (connection) => {
  connection.release();
};

const getAll = (request, response, columnName) => {
  // INSERT, UPDATE, DELETE, etc. 
  const pool = mysql.createPool(init), statement = `SELECT * FROM ${columnName}`;
  pool.query(statement, (error, result, fields) => {
    if (error) throw error;
    response.json(result);
    pool.end();
  });
};

const addAuthor = (request, response) => {
  let photo = `../api/uploads/no-photo.png`;
  if (request.file) photo = `../api/${request.file.path}`;
  const {
    fname,
    lname,
    bday,
    language,
    tel,
    country,
    email,
    github,
    twitter,
    facebook,
    instagram,
    youtube,
    url,
    bio
  } = request.body;

  /*
  const {
    originalname,
    encoding,
    mimetype,
    destination,
    filename,
    path,
    size
  } = request.files[0]; // request.file || request.files[0]; const uploadedFiles = req.files;
  */
  const pool = mysql.createPool(init), statement = `INSERT INTO Authors (fname, lname, dob, lang, tel, country, email, github, twitter, facebook, instagram, youtube, website, bio, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let values = [
    fname,
    lname,
    bday,
    language,
    tel,
    country,
    email,
    github,
    twitter,
    facebook,
    instagram,
    youtube,
    url,
    bio,
    photo
  ];
  pool.query(statement, values, (error, result) => {
    if (error) throw error;
    return result && pool.end();
  });
};

const extension = (mimetype) => {
  try {
    switch (mimetype) {
      case "image/jpeg":
        return "jpg";
      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
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
  const pool = mysql.createPool(init), statement = `INSERT INTO Books (title, publication_date, publisher_id, lang, paperback, isbn_13) VALUES (?, ?, ?, ?, ?, ?)`;
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

let users = [];

const addUser = (request, response) => {
  console.log("TODO: Add user to database..");
  users.push(request.user);
  console.log(users);
  response.sendStatus(201);
};

const checkUser = async (request, response) => {
  const user = users.find(user => user.username = request.body.username);
  if (user === null) return response.status(400).send("Can not find user");
  try {
    if (await bcyrpt.compare(request.body.password, user.password)) {
      response.send(`Ahlan wa sahlan, ${user.username}`);
    } else {
      response.send(`Login failed`);
    }
  } catch (error) {
    response.sendStatus(500);
  }
};

export {
  getAll,
  addAuthor,
  addPublisher,
  addBook,
  addUser,
  checkUser,
  getConnectionFromPool,
  executeQuery,
  releaseConnection
};