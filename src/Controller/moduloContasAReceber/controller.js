const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
function controllerContasAReceber() {
  return (req, res, next) => {
    next();
  };
}
router.post("/adiciona", async (req, res) => {});
module.exports =
  (controllerContasAReceber, (app) => app.use("/contasr", router));
