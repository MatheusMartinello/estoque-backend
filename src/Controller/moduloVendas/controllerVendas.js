const express = require("express");
const router = express.Router();
const pool = require("../Database/db");
const servico = require("../services/Services");
function controllerCriacao() {
  return (req, res, next) => {
    next();
  };
}

router.post("/picking", async (req, res) => {
  const { idprodutos, idestoques, idusuario, quantidade } = req.body;
  const quantidade_total = await pool.query(
    "SELECT quantidade from PRODUTOS where idproduto = $1 and idestoques = $2",
    [idprodutos, idestoques]
  );
  const valorAtualizado = parseInt(quantidade_total) - parseInt(quantidade);
  await pool.query(
    "UPDATE produtos SET quantidade = $1 where idprodutos = $1 and idestoques = $2 ",
    [valorAtualizado, idprodutos, idestoques]
  );
  await pool.query(
    "INSERT INTO reserva(idusuario,idprodutos,idestoques)values($1,$2,$3,$4",
    [idusuario, idprodutos, idestoques]
  );
  res.send("Picking adicionado!");
});
router.post("/remove/picking", async (req, res) => {
  const { idprodutos, idestoques, idusuario } = req.body;
  const quantidade_total = await pool.query(
    "SELECT quantidade from PRODUTOS where idproduto = $1 and idestoques = $2",
    [idprodtuos, idestoques]
  );
  await pool.query(
    "DELETE from picking where idusuario = $1 and idprodutos = $2",
    [idusuario, idprodutos]
  );
  const valorAtualizado =
    parseInt(quantidade_total) + parseInt(picking.quantidade);
  await pool.query(
    "UPDATE produtos SET quantidade = $1 where idprodutos = $1 and idestoques = $2 ",
    [valorAtualizado, idprodutos, idestoques]
  );
  res.send("Picking removido!");
});
//Cria venda
router.post("/finalizar", async (req, res) => {
  const {
    idprodutos,
    idusuario,
    frete,
    tributos,
    formapagamento,
    valortotal,
  } = req.body;
  const idvenda = await servico.pegaVendaId();
  const idnotafiscal = servico.geraNota("venda");
  for (let index = 0; index < idprodutos.length; index++) {
    servico.diminuiProduto(idprodutos[index]);
    servico.adicionarVenda(
      idprodutos[index],
      idnotafiscal,
      idusuario,
      frete,
      tributos,
      formapagamento,
      valortotal,
      idvenda
    );
  }
  res.send("Venda adicionada com sucesso");
});
router.get("/vitrine", async (req, res) => {
  const produtos = await pool.query("SELECT * from produtos");
  res.json(produtos.rows);
});

module.exports = (controllerCriacao, (app) => app.use("/venda", router));
