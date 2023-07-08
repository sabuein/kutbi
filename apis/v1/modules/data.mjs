"use strict";

import dotenv from "dotenv";
import mysql from "mysql";
import fakeAuthors from "../data/authors.json" assert { type: "json" };
import { isEmptyObject } from "./helpers.mjs";

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
  connectionLimit: 10,
  multipleStatements: true,
  typeCast: function (field, next) {
    if (field.type === "VAR_STRING") {
      return field.string();
    }
    return next();
  }
};

const pool = mysql.createPool(init);

// Helper function to get a connection from the pool
const getConnectionFromPool = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return null;
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
        return null;
      }
      resolve(result);
    });
  });
};

// Helper function to release a connection back to the pool
const releaseConnection = (connection) => {
  connection.release();
};

const getAllAuthors = async (request, response, next) => {
  try {
    const pool = mysql.createPool(init), statement = `SELECT * FROM Authors`;
    pool.query(statement, (error, result, fields) => {
      if (error) throw error;
      request.authors = result;
      pool.end();
      next();
    });
  } catch (error) {
    console.error(error);
    throw Error(`We got a problem at getAll() function. Please help!`);
  } finally {
    // Nothing for now!
  }
};

const addAuthor = (request, response, next) => {
  
  const authors = request.app.locals.fakeData.authors;
  console.log(authors);
  
  const message = `Greetings to the matrix! You have successfully included ${authors.length} fictitious authors! Enjoy your exploration!`;
  console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/authors$ ${message.split("! ")[1]}.`);

  if (!!authors && !isEmptyObject(authors)) {
    const added = [];
    authors.forEach(author => {
      console.log(author);
      const {
        fname,
        lname,
        bio,
        dob,
        lang,
        tel,
        country,
        email,
        github,
        twitter,
        facebook,
        instagram,
        youtube,
        website,
        photoUrl,
        /*createdAt,
        updatedAt,
        deletedAt*/
      } = author;
      added.push([writeAuthor({
        fname: fname,
        lname: lname,
        bio: bio,
        dob: dob,
        lang: lang,
        tel: tel,
        country: country,
        email: email,
        github: github,
        twitter: twitter,
        facebook: facebook,
        instagram: instagram,
        youtube: youtube,
        website: website,
        photoUrl: photoUrl
      })]);
    });
    request.author = added;
    next();
  } else {
    const {
      fname,
      lname,
      bio,
      dob,
      lang,
      tel,
      country,
      email,
      github,
      twitter,
      facebook,
      instagram,
      youtube,
      website,
      photoUrl,
      /*createdAt,
      updatedAt,
      deletedAt*/
    } = request.body;
    request.author = [writeAuthor({
      fname: fname,
      lname: lname,
      bio: bio,
      dob: dob,
      lang: lang,
      tel: tel,
      country: country,
      email: email,
      github: github,
      twitter: twitter,
      facebook: facebook,
      instagram: instagram,
      youtube: youtube,
      website: website,
      photoUrl: photoUrl
    })];
    //const photoUrl = request.file ? `../apis/v1/${request.file.path}` : `../apis/v1/uploads/no-photo.png`;
    next();
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
  }
};

const writeAuthor = (author) => {
  try {
    const x = [];
    const pool = mysql.createPool(init), statement = `INSERT INTO Authors (fname, lname, bio, dob, lang, tel, country, email, github, twitter, facebook, instagram, youtube, website, photoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      author.fname || null,
      author.lname || null,
      author.bio || null,
      author.dob || null,
      author.lang || null,
      author.tel || null,
      author.country || null,
      author.email || null,
      author.github || null,
      author.twitter || null,
      author.facebook || null,
      author.instagram || null,
      author.youtube || null,
      author.website || null,
      author.photoUrl || null
    ];
    pool.query(statement, values, (error, result) => {
      if (error) throw error;
      x.push(result);
      pool.end();
    });
    return x;
  } catch (error) {
    console.error(error);
  }
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

const getAllBooks = (request, response, next) => {
  try {
    console.log({ "todo": "getAllBooks" });
  } catch (error) {
    console.error(error);
    throw Error(`We got a problem at getAllBooks() function. Please help!`);
  } finally {
    next();
  }
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

const getAllUsers = (request, response, next) => {
  try {
    console.log({ "todo": "getAllUsers" });
  } catch (error) {
    console.error(error);
    throw Error(`We got a problem at getAllBooks() function. Please help!`);
  } finally {
    next();
  }
};

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

const getAllOperations = (request, response, next) => {
  try {
    console.log({ "todo": "getAllOperations" });
  } catch (error) {
    console.error(error);
    throw Error(`We got a problem at getAllBooks() function. Please help!`);
  } finally {
    next();
  }
};

const addOperation = (request, response, next) => {
  try {
    console.log({ "todo": "addOperation" });
  } catch (error) {
    console.error(error);
    throw Error(`We got a problem at getAllBooks() function. Please help!`);
  } finally {
    next();
  }
};

const fakeData = () => {
  return {
    authors: JSON.parse(JSON.stringify(fakeAuthors.authors))
  };
};

export {
  getAllAuthors,
  addAuthor,
  addPublisher,
  getAllBooks,
  addBook,
  getAllUsers,
  addUser,
  checkUser,
  getAllOperations,
  addOperation,
  getConnectionFromPool,
  executeQuery,
  releaseConnection,
  fakeData
};