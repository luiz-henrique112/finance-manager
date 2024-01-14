document.addEventListener("DOMContentLoaded", function () {
    const qtdIdDisponiveis = Number.MAX_VALUE;
    const firebaseConfig = {
        apiKey: "AIzaSyCMI875OpUZvzjsLTCAeQwY1FrhQvGKk1k",
        authDomain: "gestao-financas-9e33f.firebaseapp.com",
        projectId: "gestao-financas-9e33f",
        storageBucket: "gestao-financas-9e33f.appspot.com",
        messagingSenderId: "409170426387",
        appId: "1:409170426387:web:748051740055f423b6dde6"
    };

    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore(app);

    let task = "transacao";
  let number = parseInt(localStorage.getItem("number"));
  let transacao = task + number;

  let lista = document.getElementById('transactions')

  const btnPlus = document.getElementById("btnPlus");
  const transactionForm = document.getElementById("transactionForm");
  const salvarBtn = document.getElementById("salvarBtn");

  btnPlus.addEventListener("click", () => {
    transactionForm.classList.toggle("mostrar");
  });

  const uid = localStorage.getItem("uid");

  function coletarDados(uid) {
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
          })
          .catch((error) => {
            console.error("Erro ao salvar dados:", error);
          });
      } else {
        console.error("ID da transação não definido.");
      }
    }
  }

  salvarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    coletarDados(uid);
    setTimeout(() => {
      number = number + 1;
      transacao = task + number;
      localStorage.setItem("number", number);
    }, 20);

    const tags = new Tags(uid, transacao);
    lista.appendChild(tags.getUl()); // Adicione o elemento 'ul' à lista

    setTimeout(() => {
      data = "";
      nome = "";
      valor = "";
      moeda = "";
    }, 45);
  });

  class Tags {
    constructor(uid, transacao) {
        this.ul = document.createElement("ul");
        this.div = document.createElement("div");
        this.h2 = document.createElement("h2");
        this.li = [];

        this.collectionTransacao = db
        .collection("users")
        .doc("usersID")
        .collection(uid)
        .doc(transacao);
        this.mostrarDados();
    }

    getUl() {
      return this.ul; // Retorna o elemento 'ul' para ser adicionado à lista
    }

    async mostrarDados() {
        try {
            const doc = await this.collectionTransacao.get();

            this.ul.classList.add("transacao");
            this.ul.id = transacao;
            this.ul.appendChild(this.div);

            const liValor = document.createElement("li");
            liValor.textContent = doc.data().valor + doc.data().moeda;

            const liData = document.createElement("li");
            liData.textContent = doc.data().data;

            this.li.push(liValor, liData);

            this.ul.appendChild(liValor);
            this.ul.appendChild(liData);

            this.h2.textContent = doc.data().name;
            this.div.appendChild(this.h2);
            this.div.classList.add("tag-h2");
            
            lista.appendChild(this.ul);
        } catch (error) {
            window.confirm("Erro, tente novamente");
            console.error("erro:", error);
        }
        }
    }
});
