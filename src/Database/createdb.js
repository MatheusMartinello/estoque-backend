const pool = require("./db");

const db = {
  async inicializadorBD() {
    try {
      this.criaBanco();
    } catch (err) {
      console.log(err);
    }
  },
  async criaBanco() {
    //cria tabela Estoque
    await pool.query(
      "CREATE TABLE 'estoques'" +
        +"(" +
        +"'idestoques' serial NOT NULL," +
        +"'nome'       varchar(100) NOT NULL," +
        +"'endereco'   varchar(100) NOT NULL," +
        +"'telefone'   int4range NOT NULL," +
        +"'tipo'       varchar(50) NOT NULL," +
        +"CONSTRAINT 'PK_estoques' PRIMARY KEY ( 'idestoques' )" +
        +");"
    );
    //cria tabela produtos
    await pool.query(
      'CREATE TABLE "produtos"' +
        "(" +
        ' "idprodutos"     serial NOT NULL,' +
        ' "nome"           varchar(50) NOT NULL,' +
        ' "quantidade"     int NOT NULL,' +
        '"codigodebarras" int NOT NULL,' +
        ' "createat"       date NOT NULL,' +
        '"custo"          numeric NOT NULL,' +
        '"valormedio"     numeric NOT NULL,' +
        '"medida"         varchar(50) NOT NULL,' +
        '"url"            varchar(250) NOT NULL,' +
        '"idestoques"     integer NOT NULL,' +
        'CONSTRAINT "PK_produtos" PRIMARY KEY ( "idprodutos", "idestoques" ),' +
        'CONSTRAINT "FK_21" FOREIGN KEY ( "idestoques" ) REFERENCES "estoques" ( "idestoques" )' +
        ");"
    );
    //cria tabela usuario
    await pool.query(
      'CREATE TABLE "usuario"' +
        "(" +
        '"idusuario" serial NOT NULL,' +
        '"nome"      varchar(50) NOT NULL,' +
        '"cpf"       integer NOT NULL,' +
        'CONSTRAINT "PK_usuario" PRIMARY KEY ( "idusuario" )' +
        ");"
    );
    //cria tabela de notafiscal
    await pool.query(
      'CREATE TABLE "notafiscal"' +
        "(" +
        '"idnotafiscal" serial NOT NULL,' +
        '"tipo"         varchar(50) NOT NULL,' +
        '"createat"     date NOT NULL,' +
        'CONSTRAINT "PK_notafiscal" PRIMARY KEY ( "idnotafiscal" )' +
        ");"
    );
    //cria tabela de venda
    await pool.query(
      'CREATE TABLE "venda"' +
        "(" +
        '"idvenda"        int4range NOT NULL,' +
        '"idprodutos"     integer NOT NULL,' +
        '"idestoques"     integer NOT NULL,' +
        '"frete"          numeric NOT NULL,' +
        '"tributos"       numeric NOT NULL,' +
        '"formapagamento" varchar(50) NOT NULL,' +
        '"valortotal"      NOT NULL,' +
        '"idusuario"      integer NOT NULL,' +
        '"idnotafiscal"   integer NOT NULL,' +
        'CONSTRAINT "PK_venda" PRIMARY KEY ( "idvenda", "idprodutos", "idestoques", "idusuario", "idnotafiscal" ),' +
        'CONSTRAINT "FK_36" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" ),' +
        'CONSTRAINT "FK_40" FOREIGN KEY ( "idusuario" ) REFERENCES "usuario" ( "idusuario" )' +
        ' CONSTRAINT "FK_56" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" )' +
        ");"
    );
    //consumo interno
    await pool.query(
      'CREATE TABLE "consumointerno"' +
        "(" +
        '"idconsumointerno" serial NOT NULL,' +
        '"createat"         date NOT NULL,' +
        '"idprodutos"       integer NOT NULL,' +
        '"idestoques"       integer NOT NULL,' +
        'CONSTRAINT "PK_consumointerno" PRIMARY KEY ( "idconsumointerno", "idprodutos", "idestoques" ),' +
        'CONSTRAINT "FK_47" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" )' +
        ");"
    );
    //cria tabela fornecedor
    await pool.query(
      'CREATE TABLE "fornecedor"' +
        "(" +
        '"idfornecedor" serial NOT NULL,' +
        '"Nome"         varchar(50) NOT NULL,' +
        '"endereco"     varchar(50) NOT NULL,' +
        '"telefone"     integer NOT NULL,' +
        'CONSTRAINT "PK_fornecedor" PRIMARY KEY ( "idfornecedor" )' +
        ");"
    );
    //cria tabela produtosFornecedor
    await pool.query(
      'CREATE TABLE "produtosFornecedor"' +
        "(" +
        '"idprodutosFornecedor" serial NOT NULL,' +
        '"nome"                 varchar(50) NOT NULL,' +
        '"quantidade"           integer NOT NULL,' +
        '"custo"                numeric NOT NULL,' +
        '"codigodebarras"       int8range NOT NULL,' +
        '"medida"               varchar(50) NOT NULL,' +
        '"url"                  varchar(250) NOT NULL,' +
        '"idfornecedor"         integer NOT NULL,' +
        'CONSTRAINT "PK_produtosfornecedor" PRIMARY KEY ( "idprodutosFornecedor", "idfornecedor" ),' +
        'CONSTRAINT "FK_74" FOREIGN KEY ( "idfornecedor" ) REFERENCES "fornecedor" ( "idfornecedor" )' +
        ");"
    );
    //cria tabela comprasFornecedor
    await pool.query(
      'CREATE TABLE "comprasfornecedor"' +
        "(" +
        '"idprodutosFornecedor" integer NOT NULL,' +
        '"idfornecedor"         integer NOT NULL,' +
        '"idprodutos"           integer NOT NULL,' +
        '"idestoques"           integer NOT NULL,' +
        '"idnotafiscal"         integer NOT NULL,' +
        'CONSTRAINT "PK_comprasfornecedor" PRIMARY KEY ( "idprodutosFornecedor", "idfornecedor", "idprodutos", "idestoques", "idnotafiscal" ),' +
        'CONSTRAINT "FK_78" FOREIGN KEY ( "idprodutosFornecedor", "idfornecedor" ) REFERENCES "produtosFornecedor" ( "idprodutosFornecedor", "idfornecedor" ),' +
        'CONSTRAINT "FK_83" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" ),' +
        'CONSTRAINT "FK_87" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" )' +
        ");"
    );
    //cria tabela devolucao
    await pool.query(
      'CREATE TABLE "devolucao"' +
        "(" +
        '"idprodutosFornecedor" integer NOT NULL,' +
        '"idfornecedor"         integer NOT NULL,' +
        '"idprodutos"           integer NOT NULL,' +
        '"idestoques"           integer NOT NULL,' +
        '"idnotafiscal"         integer NOT NULL,' +
        'CONSTRAINT "PK_devolucao" PRIMARY KEY ( "idprodutosFornecedor", "idfornecedor", "idprodutos", "idestoques" ),' +
        'CONSTRAINT "FK_100" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" ),' +
        'CONSTRAINT "FK_91" FOREIGN KEY ( "idprodutosFornecedor", "idfornecedor" ) REFERENCES "produtosFornecedor" ( "idprodutosFornecedor", "idfornecedor" ),' +
        'CONSTRAINT "FK_95" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" )' +
        ");"
    );
    //cria tabela de reserva
    await pool.query(
      'CREATE TABLE "reserva"' +
        "(" +
        '"idreserva"  serial NOT NULL,' +
        '"idusuario"  integer NOT NULL,' +
        '"createat"   date NOT NULL,' +
        '"idprodutos" integer NOT NULL,' +
        '"idestoques" integer NOT NULL,' +
        'CONSTRAINT "PK_reserva" PRIMARY KEY ( "idreserva", "idusuario" ),' +
        'CONSTRAINT "FK_107" FOREIGN KEY ( "idusuario" ) REFERENCES "usuario" ( "idusuario" ),' +
        'CONSTRAINT "FK_110" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" )' +
        ");"
    );
    //cria tabela cotacoes
    await pool.query(
      'CREATE TABLE "cotacao"' +
        "(" +
        '"idcotacao" serial NOT NULL,' +
        '"createat"  date NOT NULL,' +
        '"idusuario" integer NOT NULL,' +
        'CONSTRAINT "PK_cotacao" PRIMARY KEY ( "idcotacao", "idusuario" ),' +
        'CONSTRAINT "FK_118" FOREIGN KEY ( "idusuario" ) REFERENCES "usuario" ( "idusuario" )' +
        ");"
    );
    //cria tabela cotacao_produtos
    await pool.query(
      'CREATE TABLE "cotacao_produtos"' +
        "(" +
        '"idprodutos" integer NOT NULL,' +
        '"idestoques" integer NOT NULL,' +
        '"idcotacao"  integer NOT NULL,' +
        '"idusuario"  integer NOT NULL,' +
        'CONSTRAINT "PK_cotacao_produtos" PRIMARY KEY ( "idprodutos", "idestoques", "idcotacao", "idusuario" ),' +
        'CONSTRAINT "FK_122" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" ),' +
        'CONSTRAINT "FK_127" FOREIGN KEY ( "idcotacao", "idusuario" ) REFERENCES "cotacao" ( "idcotacao", "idusuario" )' +
        ");"
    );
    //cria tabela ordem fornecimento
    await pool.query(
      'CREATE TABLE "ordemfornecimento"' +
        "(" +
        '"idordemfornecimento" serial NOT NULL,' +
        '"idprodutos"          integer NOT NULL,' +
        '"idestoques"          integer NOT NULL,' +
        '"idcotacao"           integer NOT NULL,' +
        '"idusuario"           integer NOT NULL,' +
        '"autorizado"          varchar(50) NOT NULL,' +
        'CONSTRAINT "PK_ordemfornecimento" PRIMARY KEY ( "idordemfornecimento" ),' +
        'CONSTRAINT "FK_134" FOREIGN KEY ( "idprodutos", "idestoques", "idcotacao", "idusuario" ) REFERENCES "cotacao_produtos" ( "idprodutos", "idestoques", "idcotacao", "idusuario" )' +
        ");"
    );
    //cria tabela entrada
    await pool.query(
      'CREATE TABLE "entrada"' +
        "(" +
        '"identrada"           serial NOT NULL,' +
        '"createat"            date NOT NULL,' +
        '"idnotafiscal"        integer NOT NULL,' +
        '"idordemfornecimento" integer NOT NULL,' +
        'CONSTRAINT "PK_entrada" PRIMARY KEY ( "identrada" ),' +
        'CONSTRAINT "FK_145" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" ),' +
        'CONSTRAINT "FK_148" FOREIGN KEY ( "idordemfornecimento" ) REFERENCES "ordemfornecimento" ( "idordemfornecimento" )' +
        ");"
    );
  },
  async populabd() {
    await pool.query(
      "INSERT INTO fornecedor(nome,endereco,telefone)values($1,$2,$3)",
      ["barracao distribuidora".toLocaleUpperCase(), "Rua rua", "3003030"]
    );
    await pool.query(
      "INSERT INTO fornecedor(nome,endereco,telefone)values($1,$2,$3)",
      ["mundo distribuidora".toLocaleUpperCase(), "Rua rua", "3003030"]
    );
    await pool.query(
      "INSERT INTO fornecedor(nome,endereco,telefone)values($1,$2,$3)",
      ["Tinellos distribuidora".toLocaleUpperCase(), "Rua rua", "3003030"]
    );
    await pool.query(
      'INSERT INTO "produtosFornecedor"(idfornecedor,nome,quantidade,custo, codigobarras,medida,url)values($1,$2,$3,$34,$5,$6,$7',
      [
        1,
        "caneta",
        15,
        "2.50",
        "1085016",
        "gramas",
        "https://graffite.vteximg.com.br/arquivos/ids/162793-1000-1000/shopping.png?v=636995026143930000",
      ]
    );
    await pool.query(
      'INSERT INTO "produtosFornecedor"(idfornecedor,nome,quantidade,custo, codigobarras,medida,url)values($1,$2,$3,$34,$5,$6,$7',
      [
        2,
        "Caderno",
        15,
        "25.50",
        "10852016",
        "gramas",
        "https://d26lpennugtm8s.cloudfront.net/stores/001/073/365/products/company-ultra-systemflex-cartao-fibra-091-2e009f14016870662e15741736423737-1024-1024.png",
      ]
    );
    await pool.query(
      'INSERT INTO "produtosFornecedor"(idfornecedor,nome,quantidade,custo, codigobarras,medida,url)values($1,$2,$3,$34,$5,$6,$7',
      [
        3,
        "Carro",
        10,
        "35000.00",
        "10852016",
        "Tonelada",
        "https://www.chevrolet.com.br/content/dam/chevrolet/mercosur/brazil/portuguese/index/cars/cars-subcontent/segmento-carros/02-images/cruze-premier.png?imwidth=960",
      ]
    );
    await pool.query(
      "INSERT INTO estoques(nome,endereco,telefone)values($1,$2,$3)",
      ["Martinello revenda".toLocaleUpperCase(), "Rua rua", "3003030"]
    );
    await pool.query(
      "INSERT INTO estoques(nome,endereco,telefone)values($1,$2,$3)",
      ["Alex revenda".toLocaleUpperCase(), "Rua rua", "3003030"]
    );
    await pool.query(
      'INSERT INTO "produtos"(idestoques,nome,quantidade,custo, codigobarras,medida,url)values($1,$2,$3,$34,$5,$6,$7',
      [
        1,
        "Carro",
        10,
        "35000.00",
        "10852016",
        "Tonelada",
        "https://www.chevrolet.com.br/content/dam/chevrolet/mercosur/brazil/portuguese/index/cars/cars-subcontent/segmento-carros/02-images/cruze-premier.png?imwidth=960",
      ]
    );
    await pool.query(
      'INSERT INTO "produtos"(idestoques,nome,quantidade,custo, codigobarras,medida,url)values($1,$2,$3,$34,$5,$6,$7',
      [
        2,
        "Caderno",
        15,
        "25.50",
        "10852016",
        "gramas",
        "https://d26lpennugtm8s.cloudfront.net/stores/001/073/365/products/company-ultra-systemflex-cartao-fibra-091-2e009f14016870662e15741736423737-1024-1024.png",
      ]
    );
    await pool.query(
      1,
      "caneta",
      15,
      "2.50",
      "1085016",
      "gramas",
      "https://graffite.vteximg.com.br/arquivos/ids/162793-1000-1000/shopping.png?v=636995026143930000"
    );
  },
};
module.exports = db;
