"use strict";

import express from "express";
import {
  login,
  recover,
  register,
  setupAuth,
  validateAuthHeader,
  validateAuthCookie,
  clearAuthTokens,
  clearAuthCookies,
} from "../modules/auth.mjs";
import { roles, checkPermission } from "../modules/roles.mjs";

const accounts = express.Router();

accounts.route("/").post((req, res) => {
  try {
    console.log("Redirecting from /accounts to /accounts/signup");
    res.redirect(301, "/accounts/signup");
  } catch (error) {
    console.error(error);
  }
});

accounts.route("/signup").post(register, setupAuth, async (req, res) => {
  try {
    const account = await res.locals.account;
    if (!res.locals.accountTypes.includes(account.type)) return res.status(500).json({ error: "Your account type is incorrect" });
    console.log(`${account.guid}@kutbi:~/signup$ A ${account.type} account was created.`);
    return res.status(201).send({account: encodeObjectToString(account)});
  } catch (error) {
    console.error(error);
  }
});

const loggedinAccounts = [];

accounts.route("/signin").post(login, setupAuth, async (req, res) => {
  try {
    const account = res.locals.account;

    if (!res.locals.accountTypes.includes(account.type)) {
      console.log(`${account.guid}@kutbi:~/signin$ Someone tried to login into a ${account.type} non-existent account.`);
      return res.status(500).json({ error: "We couldn't locate your Kutbi account" });
    }
    
    loggedinAccounts.forEach(record => {
      if (record.id === account.guid) {
        console.log(`${account.guid}@kutbi:~/todo$ This account is already logged in (with ${++record.totalSessions} sessions).`);
      } else {
        loggedinAccounts.push({ id: account.guid, totalSessions: 1 });
        console.log(`${account.guid}@kutbi:~/signin$ Someone have logged into a ${account.type} account for the first time (after the big bang!).`);
      }
    });
    console.log(`${account.guid}@kutbi:~/signin$ Someone have logged into a ${account.type} account.`);
    return res.status(200).json({ account: encodeObjectToString(account) });
  } catch (error) {
    console.error(error);
  }
});

accounts.route("/signin/recovery").post(recover, (req, res) => {
  try {
    console.log(`@kutbi:~/todo$ route("/signin/recovery")`);
  } catch (error) {
    console.error(error);
  } finally {
    console.log(JSON.stringify({statistics: res.locals.stats}, null, 2));
  }
});

accounts.route("/logout").delete(clearAuthTokens, async (req, res) => {
  console.log("TODO: Delete token from database");
  return res
    .status(204)
    .json({ message: "Successfully deleted refresh token" });
});

const encodeObjectToString = (object) =>
  Buffer.from(JSON.stringify(object)).toString("base64");
const decodeStringToObject = (string) =>
  JSON.parse(Buffer.from(string, "base64").toString());

export { accounts };

// /google.com//
