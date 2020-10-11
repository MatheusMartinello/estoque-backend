const express = require('express');
const router = express.Router();
const pool = require('../Database/db')
const servico = require('../services/Services');

function controllerCriacao() {
  return (req, res, next) => {
    next();
  }
}
//cria estoque
router.post("/", async (req, res) => {
  const { nome, endereco, telefone } = req.body;
  const empresa = await pool.query(
    "SELECT name FROM estoques WHERE name = $1",
    [nome]
  );
  if (empresa.rows.length == 0) {
    const newEmpresa = await pool.query(
      "INSERT INTO estoques (name, endereco,telefone) VALUES($1,$2,$3)",
      [nome, endereco, telefone]
    );
    res.json(newEmpresa);
  } else {
    res.status(400).send({ error: "Ja tem essa empresa cadastrada!" });
  }
});
//ve toda os estoques empresas
router.get("/", async (req, res) => {
  const empresasBD = await pool.query("SELECT * FROM estoques");
  res.send(empresasBD);
});
//verifica todos os produtos disponiveis para certa empreas
router.get("/estoque/:id", async (req, res) => {
  try {
    console.log(req.params.id);
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
    const result = await pool.query('INSERT INTO forncedor("Nome",telefone,enderco)values($1,$2,$3)', [Nome, telefone, endereco]);
    res.send('Forncedor Adicionado ---\n' + result)
  } catch (err) {
    console.error(err)
  }
});
//gera produto do fornecedor ---
router.post("/forncedor/produto", async (req, res) => {
  const { nome, qnt, valor, idfornecedor } = req.body;
  try {
    await pool.query('INSERT INTO produtosFornecedor(idfornecedor,nome,qnt,custo) values ($1,$2,$3,$4)', [idfornecedor, nome, qnt, valor]);
    const result = await pool.query('SELECT * from "produtosFornecedor"')
    res.send("Produto fornecedor adicionado com sucesso!\nID do produto ==>" + result.rows[0].idProdutosE);
  } catch (err) {
    console.error(err)
  }
})
//gera entrada produto ---
router.post("/entrada/produto", async (req, res) => {
  const { idProdutosE, idfornecedor, idestoques, quantidade } = req.body;
  const idnotafiscal = servico.geraNota("Entrada Produto");
  const pegaProdutoF = await pool.query('SELECT * FROM "produtosFornecedor" where "idProdutosE" = $1', [idProdutosE]);
  const verificaProduto = servico.verificaNaBase(pegaProdutoF.rows[0]);
  if (verificaProduto) {
    const mediadevalor = () => {
      return (quantidade * parseFloat(pegaProdutoF.rows[0].custo) + parseFloat(verificaProduto.mediadevalor)) / (quantidade + parseInt(verificaProduto.quantidade));
    }
    await pool.query('UPDATE produtos set quantidade = $1, mediadevalor = $2 , medida = $3 where idproduto = $4', [quantidade, mediadevalor, pegaProdutoF.medida, verificaNaBase.idprodutos])
  }
  else
    await pool.query('INSERT INTO PRODUTO(nome,quantidade,codigobarras,createat,')

});
module.exports = (controllerCriacao, (app) => app.use("/criacao", router));