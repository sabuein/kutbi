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
    response.json(result);
    pool.end();
  });
};

const addAuthor = (request, response) => {
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
  let image = `../api/uploads/no-photo.png`;
  if (request.files[0]) image = `../api/${request.files[0].path}`;
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
    image
  ];
  pool.query(statement, values, (error, result) => {
    if (error) throw error;
    console.log(`1 author inserted with ID: ${result.insertId}`);
    // Redirect the user back to the referring page
    const referer = request.headers.referer;
    if (referer) {
      // response.send("Form submitted successfully");
      response.redirect(referer);
    } else {
      response.json({
        id: result.insertId,
        name: `${fname} ${lname}`,
        type: "author"
      });
    }
    pool.end();
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

const addUser = (request, response) => {
  console.log("TODO: User is being added...");
  response.status(200).send("New user has been created")
};

export { getAll, addAuthor, addPublisher, addBook, addUser };