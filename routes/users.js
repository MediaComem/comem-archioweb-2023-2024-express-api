import createDebugger from "debug";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { bcryptCostFactor, jwtSecret } from "../config.js";
import User from "../models/user.js";
import { authenticate } from "./utils.js";

const debug = createDebugger("express-api:users");
const router = express.Router();

const signJwt = promisify(jwt.sign);

router.post("/", (req, res, next) => {
  const plainPassword = req.body.password;

  const newUser = new User(req.body);

  bcrypt.hash(plainPassword, bcryptCostFactor).then(hashedPassword => {
    newUser.password = hashedPassword;
    return newUser.save().then(savedUser => {
      debug(`Created new user: ${savedUser.name}`)
      res.send(savedUser);
    });
  }).catch(next);
});

router.get("/", authenticate, function (req, res, next) {
  User.find().sort("name").exec().then(users => {
    res.send(users);
  }).catch(next);
});

router.post("/login", function (req, res, next) {
  User.findOne({ name: req.body.name })
    .exec()
    .then(user => {
      if (!user) return res.sendStatus(401); // Unauthorized
      if (!req.body.password) return res.sendStatus(401); // Unauthorized
      return bcrypt.compare(req.body.password, user.password).then(valid => {
        if (!valid) return res.sendStatus(401); // Unauthorized
        // Login is valid...

        const payload = {
          sub: user._id,
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
          scope: user.role
        };

        signJwt(payload, jwtSecret).then(jwt => {
          debug(`User ${user.name} logged in`)
          res.send({
            message: `Welcome ${user.name}!`,
            token: jwt
          });
        });
      });
    })
    .catch(next);
});

export default router;
