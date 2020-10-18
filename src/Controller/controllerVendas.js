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
router.post("/adiciona/carrinho/", async (req, res) => {
  const { idprodtuos, idestoque, idusuario, quantidade } = req.body;
  await pool.query(
    "INSERT INTO carrinho(idproduto,idestoque,idcarrinho,idusuario,valortotal,quantidade) values($1,$2,$3,$4,$5,$6)",
    [idprodtuos, idestoque, idcarrinho, idusuario, valortotal, quantidade]
  );
  res.send("Produto adicionado ao carrinho!");
});
router.post("/remover/carrinho", async (req, res) => {
  const { idprodutos, idcarrinho } = req.body;
  await pool.query(
    "DELETE FROM carrinho where idprodutos = $1 and idcarrinho = $2",
    [idprodutos, idcarrinho]
  );
  res.send("Produto removido do carrinho :)");
});
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
router.post("/finalizar", async (req, res) => {
  const { idcarrinho, idusuario } = req.body;
  const getCarrinho = await pool.query(
    "Select * from carrinho where idcarrinho = $1 and idusuario = $2",
    [idcarrinho, idusuario]
  );
  for (let index = 0; index < getCarrinho.rows.length; index++) {
    const element = getCarrinho.rows[index];
    const produto = servico.getProdutoId(
      element.idprodutos,
      element.idestoques
    );
    const n_quantidade =
      parseInt(produto.quantidade, 10) - parseInt(getCarrinho.quantidade, 10);
    await pool.query(
      "Update produtos set quantidade = $1 where idproduto = $2 and idestoques = $3",
      [n_quantidade, produto.idprodutos, produto.idestoques]
    );
    await pool.query(
      "DELETE FROM carrinho WHERE idcarrinho = $1 and idprodutos = $2",
      [getCarrinho.idcarrinho, getCarrinho.produtos]
    );
  }
  res.send("Carrinho limpo, venda adicionada");
});
router.get("/vitrine", async (req, res) => {
  const produtos = await pool.query("SELECT * from produtos");
  res.send(produtos.rows);
});

module.exports = (controllerCriacao, (app) => app.use("/venda", router));
