const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
function controllerContasAPagar() {
  return (req, res, next) => {
    next();
  };
}
router.post("/adicionar", async (req, res) => {
  const { data, notafiscal, valor, situacao } = req.body;
  try {
    await pool.query(
      "INSERT INTO contasapagar(data,idnotafiscal,valor,situacao) values ($1,$2,$3,$4,$5,$6,$7)",
      [data, notafiscal, valor, situacao.toUpperCase()]
    );
  } catch (error) {
    console.error(error);
  }
  res.send("201");
});
//retorna todas as contas a pagar em aberto
router.get("/abertos", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "ABERTO"'
  );
  res.send(result.rows);
});
router.get("/liquidado", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "LIQUIDADO"'
  );
  res.send(result.rows);
});
router.get("/substituidos", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "SUBSTITUIDO"'
  );
  res.send(result.rows);
});
router.get("/cancelado", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "CANCELADO"'
  );
  res.send(result.rows);
});
router.put("/atualizar", async (req, res) => {
  const { idcontasapagar } = req.body;
});

module.exports = (controllerContasAPagar, (app) => app.use("/contasp", router));
