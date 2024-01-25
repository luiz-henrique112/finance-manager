document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCMI875OpUZvzjsLTCAeQwY1FrhQvGKk1k",
    authDomain: "gestao-financas-9e33f.firebaseapp.com",
    projectId: "gestao-financas-9e33f",
    storageBucket: "gestao-financas-9e33f.appspot.com",
    messagingSenderId: "409170426387",
    appId: "1:409170426387:web:748051740055f423b6dde6"
  };

  const uid = localStorage.getItem("uid");
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(app);

  let task = "transacao";

  let inputs = document.getElementsByTagName('input')

  async function obterNumero() {
    try {
      const numeroDoc = await db.collection("users").doc("usersID").collection(uid).doc("number-transacao").get();
      const numero = numeroDoc.exists ? numeroDoc.data().num : 1;
      return numero;
    } catch (error) {
      console.error("Erro ao obter número:", error);
      return 1; // ou o valor padrão desejado
    }
  }

  async function obterTodasTransacoes() {
    try {
      const transacoesSnapshot = await db.collection("users").doc("usersID").collection(uid).where(firebase.firestore.FieldPath.documentId(), "!=", "number-transacao").get();
      return transacoesSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    } catch (error) {
      console.error("Erro ao obter transações:", error);
      return [];
    }
  }

  // Aguardar a obtenção do número antes de usar
  obterNumero().then((number) => {
    let transacao = task + number;
    let lista = document.getElementById('transactions');
    let lista2 = document.getElementById('transactionList')
    const btnPlus = document.getElementById("btnPlus");
    const transactionForm = document.getElementById("transactionForm");
    const salvarBtn = document.getElementById("salvarBtn");

    btnPlus.addEventListener("click", () => {
      transactionForm.classList.toggle("mostrar");
      lista2.classList.toggle("diminuir")
    });

    salvarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      obterNumero().then((newNumber) => {
        transacao = task + newNumber;
    
        coletarDados(uid, transacao);
    
        const tags = new Tags(uid, transacao);
        lista.appendChild(tags.getUl());
    
      });
    });


    

    obterTodasTransacoes().then((transacoes) => {
      transacoes.forEach((transacao) => {
        const tags = new Tags(uid, transacao.id);
        lista.appendChild(tags.getUl());
      });
    });

    function coletarDados(uid, transacao) {
      const nome = document.getElementById("nome").value;
      const valor = document.getElementById("valor").value;
      const moeda = document.getElementById("moeda").value;
      const data = document.getElementById("data").value;

      if (transactionForm.classList.contains("mostrar")) {
        if (uid && typeof uid === "string") {
          const docRef = db
            .collection("users")
            .doc("usersID")
            .collection(uid)
            .doc(transacao);

          docRef
            .set({
              name: nome,
              valor: valor,
              moeda: moeda,
              data: data,
            })
            .then(() => {
              console.log("Dados salvos com sucesso!");
              aumentarNumero(uid);
            })
            .catch((error) => {
              console.error("Erro ao salvar dados:", error);
            });
        } else {
          console.error("ID da transação não definido.");
        }
      }
    }

    function aumentarNumero(uid) {
      obterNumero().then((numero) => {
        let numbr = numero + 1;
        db.collection("users").doc("usersID").collection(uid).doc("number-transacao").update({ num: numbr });
      });
    }

    class Tags {
      constructor(uid, transacao) {
        this.ul = document.createElement("ul");
        this.div = document.createElement("div");
        this.h2 = document.createElement("h2");
        this.divLi = document.createElement('div');
        this.liValor = document.createElement("li");
        this.liData = document.createElement("li");

        this.collectionTransacao = db
          .collection("users")
          .doc("usersID")
          .collection(uid)
          .doc(transacao);
        this.mostrarDados(transacao);
      }

      getUl() {
        return this.ul;
      }

      async mostrarDados(transacao) {
        try {
          const doc = await this.collectionTransacao.get();

          this.ul.classList.add("transacao");
          this.ul.id = transacao;
          this.ul.appendChild(this.div);

          const { valor, moeda, data, name } = doc.data();

          const dataFormatada = new Date(data);
          const dia = dataFormatada.getDate().toString().padStart(2, '0');
          const mes = (dataFormatada.getMonth() + 1).toString().padStart(2, '0');
          const ano = dataFormatada.getFullYear();

          this.liData.textContent = "Data:" + dia + "/" + mes + "/" + ano;
          this.liValor.textContent = "Valor:" + " " + valor + " " + moeda;

          this.divLi.append(this.liValor, this.liData);
          this.divLi.classList.add('tag-li');
          this.ul.appendChild(this.divLi);

          this.h2.textContent = name;
          this.div.append(this.h2);
          this.div.classList.add("tag-h2");

          lista.appendChild(this.ul);
        } catch (error) {
          window.confirm("Erro, tente novamente");
          console.error("erro:", error);
        }
      }
    }
  });
});
