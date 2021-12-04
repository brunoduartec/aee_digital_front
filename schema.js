function getSchema() {
  let schema = {
    Centro: {
      prop: "centro",
      type: {
        Regional: {
          prop: "regional",
          type: String,
        },
        "Casa Completo": {
          prop: "nome",
          type: String,
        },
        "Casa Curto": {
          prop: "curto",
          type: String,
        },
        Usuário: {
          prop: "user",
          type: String,
        },
        Senha: {
          prop: "pass",
          type: String,
        },
      },
    },
  };

  return schema;
}

module.exports = getSchema;
