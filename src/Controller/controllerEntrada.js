const express = require("express");
const router = express.Router();
const pool = require("../Database/db");
const servico = require("../services/Services");
//gera entrada do produto adicionando na base de dado
router.post("/produto", async (req, res) => {
  const { idProdutosE, idfornecedor, idestoques, quantidade } = req.body;
  const idnotafiscal = await servico.geraNota("Entrada");
  const pegaProdutoF = await pool.query(
    'SELECT * FROM "produtosFornecedor" where "idProdutosE" = $1 and idfornecedor = $2',
    [idProdutosE, idfornecedor]
  );
  const verificaProduto = await servico.verificaNaBase(
    idestoques,
    pegaProdutoF.rows[0].nome
  );
  if (verificaProduto !== null) {
    const mediadevalor =
      (quantidade * parseFloat(pegaProdutoF.rows[0].custo, 10) +
        parseFloat(verificaProduto.mediadevalor, 10)) /
      (parseFloat(quantidade, 10) + parseInt(verificaProduto.quantidade, 10));
    await pool.query(
      "UPDATE produtos set quantidade = $1, mediadevalor = $2 where idprodutos = $3",
      [quantidade, mediadevalor, verificaProduto.idprodutos]
    );
  } else {
    const media = parseFloat(pegaProdutoF.rows[0].custo) / quantidade;
    await pool.query(
      "INSERT INTO produtos(nome,quantidade,codigobarras,createat,medida,mediadevalor,idestoques,custo) values($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        pegaProdutoF.rows[0].nome,
        quantidade,
        pegaProdutoF.rows[0].codigobarras,
        servico.geraData(),
        pegaProdutoF.rows[0].medida,
        media,
        idestoques,
        pegaProdutoF.rows[0].custo,
      ]
    );
  }
  const idproduto = await pool.query(
    "select idprodutos from produtos where nome = $1",
    [pegaProdutoF.rows[0].nome]
  );
  await pool.query(
    'INSERT INTO "comprasFornecedor"("idProdutosE",idfornecedor, idprodutos,idestoques,idnotafiscal) values ($1,$2,$3,$4,$5)',
    [
      idProdutosE,
      idfornecedor,
      idproduto.rows[0].idprodutos,
      idestoques,
      idnotafiscal,
    ]
  );
  res.send("produto adicionado ao estoque com sucesso!");
});

module.exports = (controllerCriacao, (app) => app.use("/entrada", router));
