"use strict";

import express from "express";
import {
  login,
  recover,
  register,
  clearAuth,
  setupAuth
} from "../modules/auth.mjs";
import { encode, pad } from "../modules/helpers.mjs";

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
    const account = req.app.locals.account;
    if (!req.app.locals.accountTypes.includes(account.type)) return res.status(500).json({ status: 500, message: "Your account type is incorrect." });
    console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/signup$ A ${account.type} account was created by someone.`);
    return res.status(201).send({
      status: 201,
      message: `A ${account.type} account was created`,
      account: encode(account),
      time: + Date.now()
    });
  } catch (error) {
    console.error(error);
  } finally {
    req.app.locals.stats.signups++;
  }
});

accounts.route("/signin").post(login, setupAuth, async (req, res) => {
  try {
    const i = req.app.locals.index;
    const account = req.app.locals.account;

    if (!!account && !req.app.locals.accountTypes.includes(account.type)) {
      console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/signin$ Someone tried to login into a ${account.type} non-existent account.`);
      res.status(500).json({ status: 500, message: "We couldn't locate your Kutbi account", time: + Date.now() });
    }

    req.app.locals.loggedinAccounts.forEach(record => {
      if (record.id === account.guid) {
        console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/todo$ This account is already logged in (with ${++record.totalSessions} sessions).`);
      } else {
        req.app.locals.loggedinAccounts.push({ id: account.guid, totalSessions: 1, time: + Date.now() });
        console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/todo$ A ${account.type} account has been accessed by someone for the first time.`);
      }
    });

    console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/signin$ A ${account.type} account has been accessed by someone.`);
    res.status(200).json({
      status: 200,
      message: `You have logged into your ${account.type} account`,
      account: encode(account),
      time: + Date.now()
    });
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