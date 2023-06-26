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
    if (!res.locals.accountTypes.includes(account.type)) return res.status(500).json({ status: 500, message: "Your account type is incorrect." });
    let i = req.app.locals.index;
    console.log(`${i}: ${account.guid}@kutbi:~/signup$ A ${account.type} account was created.`);
    return res.status(201).send({account: encodeObjectToString(account)});
  } catch (error) {
    console.error(error);
  } finally {
    req.app.locals.stats.signups++;
  }
});

accounts.route("/signin").post(login, setupAuth, async (req, res) => {
  try {
    const account = res.locals.account;

    if (!req.app.locals.accountTypes.includes(account.type)) {
      console.log(`${account.guid}@kutbi:~/signin$ Someone tried to login into a ${account.type} non-existent account.`);
      return res.status(500).json({ status: 500, message: "We couldn't locate your Kutbi account" });
    }
    
    req.app.locals.loggedinAccounts.forEach(record => {
      if (record.id === account.guid) {
        console.log(`${account.guid}@kutbi:~/todo$ This account is already logged in (with ${++record.totalSessions} sessions).`);
      } else {
        req.app.locals.loggedinAccounts.push({ id: account.guid, totalSessions: 1 });
        console.log(`${account.guid}@kutbi:~/signin$ Someone have logged into a ${account.type} account for the first time (after the big bang!).`);
      }
    });

    let i = req.app.locals.index;
    console.log(`${i}: ${account.guid}@kutbi:~/signin$ Someone have logged into a ${account.type} account.`);
    return res.status(200).json({ status: 200, account: encodeObjectToString(account) });
  } catch (error) {
    console.error(error);
  } finally {
    req.app.locals.stats.logins++;
  }
});

accounts.route("/signin/recovery").post(recover, (req, res) => {
  try {
    console.log(`@kutbi:~/todo$ route("/signin/recovery")`);
  } catch (error) {
    console.error(error);
  } finally {
    console.log("TODO: /signin/recovery");
    req.app.locals.stats.recoveries++;
  }
});

accounts.route("/logout").delete(clearAuthTokens, async (req, res) => {
  console.log("TODO: Delete token from database");
  return res
    .status(204)
    .json({ status: 204, message: "Successfully deleted refresh token." });
});

const encodeObjectToString = (object) => {
  try {
    return Buffer.from(JSON.stringify(object)).toString("base64");
  } catch (error) {
    console.error(error);
  }
};

const decodeStringToObject = (string) => {
  try {
    return JSON.parse(Buffer.from(string, "base64").toString());
  } catch (error) {
    console.error(error);
  }
};

export { accounts };

// /google.com//
