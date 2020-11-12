const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
const { geraMovimentacao } = require("./services");
function controllerContasAPagar() {
  return (req, res, next) => {
    next();
  };
}
router.post("/adicionar", async (req, res) => {
  const { data, notafiscal, valorTotal, situacao, valorAberto = 0 } = req.body;
  const idmovimentacao = geraMovimentacao(req.body);
  try {
    await pool.query(
      "INSERT INTO contasapagar(data,idnotafiscal,valor,situacao,valorAberto,idmovimentacao) values ($1,$2,$3,$4,$5,$6)",
      [
        data,
        notafiscal,
        valorTotal,
        situacao.toUpperCase(),
        valorAberto,
        idmovimentacao,
      ]
    );
  } catch (error) {
    console.error(error);
  }
  res.send("201");
});
//retorna todas as contas a pagar em aberto
router.get("/abertos", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contasapagar WHERE situacao = "ABERTO"'
  );
  res.send(result.rows);
});
//pega todos as notas liquidados
router.get("/liquidado", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "LIQUIDADO"'
  );
  res.send(result.rows);
});
//pega todas as notas substituidos
router.get("/substituidos", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "SUBSTITUIDO"'
  );
  res.send(result.rows);
});
//pega todas as notas canceladas
router.get("/cancelado", async (req, res) => {
  const result = await pool.query(
    'SELECT data,notafiscal,valor from contas a pagar WHERE situacao = "CANCELADO"'
  );
  res.send(result.rows);
});
router.put("/atualizar", async (req, res) => {
  const { idcontasapagar, situacao, valor } = req.body;
  const pegaBase = await pool.query(
    "SELECT * from contasapagar where idcontasapagar = $1",
    idcontasapagar
  );
  if (situacao.toUpperCase() === "ABERTO") {
    try {
      await pool.query(
        'update contasapagar set valorAberto = $1, situacao = "ABERTO" where idcontasapagar = $2',
        [valor, idcontasapagar]
      );
      res.send("success");
    } catch (error) {
      console.log(error);
    }
  } else if (situacao.toUpperCase() === "LIQUIDADO") {
    try {
      await pool.query(
        'update contasapagar set valorAberto = 0, situacao = "LIQUIDADO" where idcontasapagar = $1',
        idcontasapagar
      );
      res.send("success");
    } catch (error) {
      console.error(error);
    }
  } else if (situacao.toUpperCase() === "CANCELADO") {
    try {
      await pool.query(
        'UPDATE contasapagar set valorAberto = 0, valorTotal = 0, situacao = "CANCELADO" where idcontasapagar = $1',
        [idcontasapagar]
      );
      res.send("success");
    } catch (error) {
      console.log(error);
    }
  } else if (situacao.toUpperCase() === "SUBSTITUIDO") {
    try {
      await pool.query(
        'INSERT INTO contasapagar(data,idnotafiscal,valor,situacao,valorAberto) values ($1,$2,$3,"ABERTO",$5)',
        [
          pegaBase.rows[0].data,
          pegaBase.rows[0].idnotafiscal,
          pegaBase.rows[0].valor,
          valor,
        ]
      );
      const idnovo = await pool.query(
        "SELECT MAX(idcontasapagar) from contasapagar"
      );
      res.send("ID substituido = " + idnovo.rows[0].max);
    } catch (error) {
      console.log(error);
    }
  }
});

module.exports = (controllerContasAPagar, (app) => app.use("/contasp", router));