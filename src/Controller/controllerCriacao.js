const express = require("express");
const router = express.Router();
const pool = require("../Database/db");
function controllerCriacao() {
  return (req, res, next) => {
    next();
  };
}
//cria estoque
router.post("/", async (req, res) => {
  const { idestoques, nome, endereco, telefone, tipo } = req.body;
  const empresa = await pool.query(
    "SELECT nome FROM estoques WHERE nome = $1",
    [nome]
  );
  if (empresa.rows.length == 0) {
    const newEmpresa = await pool.query(
      "INSERT INTO estoques ( idestoques, nome, endereco,telefone,tipo) VALUES($1,$2,$3,$4,$5)",
      [idestoques, nome, endereco, telefone, tipo]
    );
    res.json(newEmpresa);
  } else {
    res.status(400).send({ error: "Ja tem essa empresa cadastrada!" });
  }
});
//ve toda os estoques empresas
router.get("/", async (req, res) => {
  const empresasBD = await pool.query("SELECT * FROM estoques");
  res.send(empresasBD.rows[0]);
});
//verifica todos os produtos disponiveis para certa empreasa
router.get("/estoque/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT nome, quantidade, custo FROM produtos WHERE idestoques = $1",
      [req.params.id]
    );
    res.send(result.rows);
  } catch (err) {
    res.status(401).send(err);
  }
});
//pega produto a partir do id
router.get("/produto:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 'nome' 'qnt' from produtoswhere idprodutos = $1`,
      [req.param.id]
    );
    res.send(result.json());
  } catch (err) {
    console.error(err);
  }
});
//cria fornecedor ---
router.post("/fornecedor", async (req, res) => {
  const { Nome, telefone, endereco } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO fornecedor("Nome",telefone,endereco)values($1,$2,$3)',
      [Nome, telefone, endereco]
    );
    res.send("Forncedor Adicionado ---\n");
  } catch (err) {
    console.error(err);
  }
});
//gera produto do fornecedor ---
router.post("/fornecedor/produto", async (req, res) => {
  const { nome, qnt, valor, idfornecedor, codigobarras, medida } = req.body;
  try {
    await pool.query(
      'INSERT INTO "produtosFornecedor"(idfornecedor,nome,qnt,custo,codigobarras, medida) values ($1,$2,$3,$4,$5,$6)',
      [idfornecedor, nome, qnt, valor, codigobarras, medida]
    );
    const result = await pool.query('SELECT * from "produtosFornecedor"');
    res.send(
      "Produto fornecedor adicionado com sucesso!\nID do produto ==>" +
        result.rows[0].idProdutosE
    );
  } catch (err) {
    console.error(err);
  }
});

module.exports = (controllerCriacao, (app) => app.use("/criacao", router));
