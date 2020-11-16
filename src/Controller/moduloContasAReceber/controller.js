const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
function controllerContasAReceber() {
  return (req, res, next) => {
    next();
  };
}
router.post("/adiciona", async (req, res) => {
  const {
    data,
    notafiscal,
    valorTotal,
    situacao,
    valorPago = 0,
    formapag = null,
    datavenc = null,
  } = req.body;
  const idmovimentacao = await geraMovimentacao(req.body);
  try {
    if (valorTotal > valorPago) {
      await pool.query(
        "INSERT INTO contasareceber(data,idnotafiscal,valor,situacao,valorAberto,idmovimentos,formapag,venc) values ($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          data,
          parseInt(notafiscal),
          parseFloat(valorTotal),
          "ABERTO",
          parseFloat(valorPago),
          parseInt(idmovimentacao),
          formapag,
          datavenc,
        ]
      );
    } else {
      await pool.query(
        "INSERT INTO contasareceber(data,idnotafiscal,valor,situacao,valorAberto,idmovimentos,formapag,venc) values ($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          data,
          parseInt(notafiscal),
          parseFloat(valorTotal),
          situacao.toUpperCase(),
          parseFloat(valorPago),
          parseInt(idmovimentacao),
          formapag,
          datavenc,
        ]
      );
    }
  } catch (error) {
    console.error(error);
  }
  res.send("201");
});
router.get("/abertos", async (req, res) => {
  const result = await pool.query(
    "SELECT data,idnotafiscal,valor,situacao from contasareceber WHERE situacao like 'ABERTO'"
  );
  res.send(result.rows);
});
//pega todos as notas liquidados
router.get("/liquidado", async (req, res) => {
  const result = await pool.query(
    "SELECT data,idnotafiscal,valor from contasareceber WHERE situacao like 'LIQUIDADO'"
  );
  res.send(result.rows);
});
//pega todas as notas substituidos
router.get("/substituidos", async (req, res) => {
  const result = await pool.query(
    "SELECT data,idnotafiscal,valor,situacao from contasareceber WHERE situacao like 'SUBSTITUIDO'"
  );
  res.send(result.rows);
});
//pega todas as notas canceladas
router.get("/cancelado", async (req, res) => {
  const result = await pool.query(
    "SELECT data,notafiscal,valor from contasareceber WHERE situacao like 'CANCELADO'"
  );
  res.send(result.rows);
});

router.put("/atualizar", async (req, res) => {
  const { idcontasareceber, situacao, valor } = req.body;
  const pegaBase = await pool.query(
    "SELECT * from contasareceber where idcontasareceber = $1",
    idcontasareceber
  );
  if (situacao.toUpperCase() === "ABERTO") {
    try {
      await pool.query(
        'update contasareceber set valorAberto = $1, situacao = "ABERTO" where idcontasareceber = $2',
        [valor, idcontasareceber]
      );
      res.send("success");
    } catch (error) {
      console.log(error);
    }
  } else if (situacao.toUpperCase() === "LIQUIDADO") {
    try {
      await pool.query(
        'update contasareceber set valorAberto = 0, situacao = "LIQUIDADO" where idcontasareceber = $1',
        idcontasareceber
      );
      res.send("success");
    } catch (error) {
      console.error(error);
    }
  } else if (situacao.toUpperCase() === "CANCELADO") {
    try {
      await pool.query(
        'UPDATE contasareceber set valorAberto = 0, valorTotal = 0, situacao = "CANCELADO" where idcontasareceber = $1',
        [idcontasareceber]
      );
      res.send("success");
    } catch (error) {
      console.log(error);
    }
  } else if (situacao.toUpperCase() === "SUBSTITUIDO") {
    try {
      await pool.query(
        'INSERT INTO contasareceber(data,idnotafiscal,valor,situacao,valorAberto) values ($1,$2,$3,"ABERTO",$5)',
        [
          pegaBase.rows[0].data,
          pegaBase.rows[0].idnotafiscal,
          pegaBase.rows[0].valor,
          valor,
        ]
      );
      const idnovo = await pool.query(
        "SELECT MAX(idcontasareceber) from contasareceber"
      );
      res.send("ID substituido = " + idnovo.rows[0].max);
    } catch (error) {
      console.log(error);
    }
  }
});

module.exports =
  (controllerContasAReceber, (app) => app.use("/contasr", router));
