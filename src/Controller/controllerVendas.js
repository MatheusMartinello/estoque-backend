const express = require("express");
const router = express.Router();
const pool = require("../Database/db");
const servico = require("../services/Services");
function Picking() {
  valorPicking = 0;
  idcarrinho = 0;
}
let picking = new Picking();
function controllerCriacao() {
  return (req, res, next) => {
    next();
  };
}

router.post("/picking", async (req, res) => {
  const {
    idcarrinho,
    idprodutos,
    idestoques,
    idusuario,
    quantidade,
  } = req.body;
  picking.idusuario = idusuario;
  picking.quantidade = quantidade;
  const quantidade_total = await pool.query(
    "SELECT quantidade from PRODUTOS where idproduto = $1 and idestoques = $2",
    [idcarrinho, idestoques]
  );
  const valorAtualizado = parseInt(quantidade_total) - parseInt(quantidade);
  await pool.query(
    "UPDATE produtos SET quantidade = $1 where idprodutos = $1 and idestoques = $2 ",
    [valorAtualizado, idprodtuos, idestoques]
  );
  res.send("Picking adicionado!");
});
router.post("/remove/picking", async (req, res) => {
  const { idcarrinho, idprodutos, idestoques, idusuario } = req.body;
  const quantidade_total = await pool.query(
    "SELECT quantidade from PRODUTOS where idproduto = $1 and idestoques = $2",
    [idprodtuos, idestoques]
  );
  const valorAtualizado =
    parseInt(quantidade_total) + parseInt(picking.quantidade);
  await pool.query(
    "UPDATE produtos SET quantidade = $1 where idprodutos = $1 and idestoques = $2 ",
    [valorAtualizado, idprodtuos, idestoques]
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
  res.send("Carrinho limpo, venda adicionada com sucesso");
});
router.get("/vitrine", async (req, res) => {
  const produtos = await pool.query("SELECT * from produtos");
  res.json(await servico.vitrine(produtos.rows));
});

module.exports = (controllerCriacao, (app) => app.use("/venda", router));
