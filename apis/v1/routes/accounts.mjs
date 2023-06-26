"use strict";

import express from "express";
import {
  login,
  recover,
  register,
  requireAuth,
  clearAuth,
  requireRefreshToken,
  setupAuth,
  validateAuthHeader,
  validateAccessCookie,
  clearAuthTokens,
  clearAuthCookies,
} from "../modules/auth.mjs";
import { encode, decode } from "../modules/helpers.mjs";
import { roles, checkPermission } from "../modules/roles.mjs";

const accounts = express.Router();

accounts.route("/").post((req, res) => {
  try {
    const i = req.app.locals.index;
    console.log(`${i}: @kutbi:~$ Redirecting from /accounts to /accounts/signup.`);
    return res.redirect(301, "/accounts/signup");
  } catch (error) {
    console.error(error);
  }
});

accounts.route("/signup").post(register, setupAuth, async (req, res) => {
  try {
    const i = req.app.locals.index;
    const account = await res.locals.account;
    if (!req.app.locals.accountTypes.includes(account.type)) return res.status(500).json({ status: 500, message: "Your account type is incorrect." });
    console.log(`${i}: ${account.guid}@kutbi:~/signup$ A ${account.type} account was created.`);
    return res.status(201).send({account: encode(account)});
  } catch (error) {
    console.error(error);
  } finally {
    req.app.locals.stats.signups++;
  }
});

accounts.route("/signin").post(login, setupAuth, async (req, res) => {
  try {
    const i = req.app.locals.index;
    const account = res.locals.account;

    if (!req.app.locals.accountTypes.includes(account.type)) {
      console.log(`${i}: ${account.guid}@kutbi:~/signin$ Someone tried to login into a ${account.type} non-existent account.`);
      return res.status(500).json({ status: 500, message: "We couldn't locate your Kutbi account" });
    }
    
    req.app.locals.loggedinAccounts.forEach(record => {
      if (record.id === account.guid) {
        console.log(`${i}: ${account.guid}@kutbi:~/todo$ This account is already logged in (with ${++record.totalSessions} sessions).`);
      } else {
        req.app.locals.loggedinAccounts.push({ id: account.guid, totalSessions: 1 });
        console.log(`${i}: ${account.guid}@kutbi:~/signin$ Someone have logged into a ${account.type} account for the first time (after the big bang!).`);
      }
    });
    console.log(`${i}: ${account.guid}@kutbi:~/signin$ Someone have logged into a ${account.type} account.`);
    return res.status(200).json({ status: 200, account: encode(account) });
  } catch (error) {
    console.error(error);
  } finally {
    req.app.locals.stats.logins++;
  }
});

accounts.route("/signin/recovery").post(recover, (req, res) => {
  try {
    console.log(`@kutbi:~/todo$ Route("/signin/recovery")`);
  } catch (error) {
    console.error(error);
  } finally {
    req.app.locals.stats.recoveries++;
  }
});

accounts.route("/logout").delete(clearAuth, async (req, res) => {
  console.log("@kutbi:~/todo$ Delete token from database");
  return res
    .status(204)
    .json({ status: 204, message: "Successfully deleted refresh token." });
});

export { accounts };