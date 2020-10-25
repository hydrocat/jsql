class Jsql {
  constructor(data) {
    this.data = data;
    this.debug = false;
    console.log("Db inicializado");
  }

  log() {
    if(this.debug) {
      console.log(arguments);
    }
  }

  /* 
     Compara dois objetos campo-a-campo
     @return Boolean
  */
  matches(query, element) {
    this.log("comparando:", query, element);
    let match_results = [];
    let match = (boolean) => {
      this.log("Match deu em :" + boolean);
      match_results.push(boolean);
    };
    
    match_loop: for( const field in query ) {
      if (! query.hasOwnProperty(field)) {
        continue;
      }

      let query_val = query[field];
      let element_val = element[field];
      this.log('campo:', field, 'valores:', query_val, element_val);
      
      if(typeof(query_val) !== typeof(element_val)) {
        this.log('tipos sao diferentes');
        match(false);
        continue;
      }

      // compara nativos
      let type = typeof(query_val);
      if(type === 'string' ||
         type === 'number' ||
         type === 'undefined' ||
         type === 'boolean') {
        this.log('nativos!');
        match(query_val === element_val);
        continue;
      }

      /* No caso de arrays, todos os elementos do objeto de consulta
       * devem estar dentro do array do consultado
       * ex: [1,2,3] com [0,1,2,3,4] : Objeto selecionado!
       * ex: [1,2,3] com [1,2] : Objeto NAO selecionado!
       */
      if(query_val instanceof Array) {
        this.log('array!');

        // Se houver um false, para a pesquisa neste objeto
        for (let element of query_val) {
          if (!element_val.includes(element)) {
            match(false);
            continue match_loop;
          }
        }

        /* Chegar ate aqui implica que todos da consulta estao no
           consultado */
        match(true);
        continue;
      }

      // Ultimo caso, pesquisa recursivamente
      if(query_val instanceof Object) {
        this.log("Objeto!");
        match(
          this.matches(query_val, element_val)
        );

        continue;
      }
    }
    return match_results.every(e => e === true);
  }

  /* 
     Retoras todas os objetos que cuja aplicacao do predicado (query)
     seja verdade.
  */
  select(query) {

    /*
     * Se query for um array, fazemos uma conjuncao (OR) com cada query.
     * logo, se a primeira der positivo, verifica-se o proximo ojeto.
     * se a query der negativo, executa a proxima query
     */
    if (!(query instanceof Array)) {
      query = [query];
    }
    return this.data.filter(
      element => query.some( q => this.matches(q, element))
    );
  }
}

// let db = new Jsql([
//   {
//     nome: "vitorio",
//     idade: 24,
//     roupas: {
//       camisa: "azul",
//       sapato: 42,
//       cabelo: "castanho"
//     },
//     numeros: [1,2,3,4]
//   },
//   {
//     nome: "savio",
//     idade: 25,
//     roupas: {
//       camisa: undefined,
//       sapato: 42,
//       cabelo: "preto"
//     },
//     numeros: [5,6]
//   },
//   {
//     nome: "mercia",
//     idade: 25,
//     roupas: {
//       camisa: "preta",
//       sapato: 36,
//       cabelo: "preto"
//     },
//     numeros: [1,5]
//   }
// ]);
