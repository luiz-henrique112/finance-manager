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
	const auth = firebase.auth()

    let task = "transacao";

    async function obterNumero() {
    	try {
    		const numeroDoc = await db.collection("users").doc("usersID").collection(uid).doc("number-transacao").get();
            return numeroDoc.exists ? numeroDoc.data().num : 1;
    	} catch (error) {
            console.error("Erro ao obter número:", error);
            return 1;
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

    obterNumero().then((number) => {
		let transacao = task + number;
		let lista = document.getElementById('transactions');
		let lista2 = document.getElementById('transactionList');
		const btnPlus = document.getElementById("btnPlus");
		const transactionForm = document.getElementById("transactionForm");
		const salvarBtn = document.getElementById("salvarBtn");
		let logoutBtn = document.getElementById('logout');
		
		btnPlus.addEventListener("click", () => {
		transactionForm.classList.toggle("mostrar");
		lista2.classList.toggle("diminuir");
		});

		salvarBtn.addEventListener("click", (e) => {
		e.preventDefault();
		obterNumero().then((newNumber) => {
			transacao = task + newNumber;
			coletarDados(uid, transacao)
			const tag = new Tags(uid, transacao);
			lista.appendChild(tag.getUl());
			transactionForm.classList.remove("mostrar");
			lista2.classList.remove("diminuir");
		});
		});

		logoutBtn.addEventListener('click', (e) => {
				window.location.href = "./index.html"
		})

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
			const docRef = db.collection("users").doc("usersID").collection(uid).doc(transacao);

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
			this.divBtn = document.createElement("div");
			this.divH2 = document.createElement("div");
			this.divLi = document.createElement('div');
			this.h2 = document.createElement("h2");
			this.liValor = document.createElement("li");
			this.liData = document.createElement("li");
			this.btnEditar = document.createElement("button");
			this.btnExcluir = document.createElement("button");
			this.collectionTransacao = db.collection("users").doc("usersID").collection(uid).doc(transacao);
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
			this.ul.append(this.divH2, this.div);

			const { valor, moeda, data, name } = doc.data();

			const dataFormatada = new Date(data);
			const dia = dataFormatada.getDate().toString().padStart(2, '0');
			const mes = (dataFormatada.getMonth() + 1).toString().padStart(2, '0');
			const ano = dataFormatada.getFullYear();

			this.liData.textContent = "Data:" + dia + "/" + mes + "/" + ano;
			this.liValor.textContent = "Valor:" + " " + valor + " " + moeda;

			this.btnEditar.innerHTML = '<i class="fa fa-pencil"></i>';
			this.btnEditar.classList.add("btnEditar");
			this.btnEditar.addEventListener('click', () => editar(this.ul.id, transactionForm, lista2))

			this.btnExcluir.innerHTML = '<i class="fa fa-trash"></i>';
			this.btnExcluir.classList.add("btnExcluir");
			// Removido o atributo onclick e adicionado um event listener
			this.btnExcluir.addEventListener('click', () => remover(this.ul.id));

			this.divBtn.classList.add("div-botoes");
			this.divBtn.append(this.btnEditar, this.btnExcluir);

			this.divLi.append(this.liValor, this.liData);
			this.divLi.classList.add('tag-li');

			this.h2.textContent = name;
			this.divH2.append(this.h2);
			this.divH2.classList.add("tag-h2");

			this.div.append(this.divLi, this.divBtn)
			this.div.classList.add("divs-container")

			lista.appendChild(this.ul);
			} catch (error) {
			window.confirm("Erro, tente novamente");
			console.error("erro:", error);
			}
		}
		}

		// Função remover recebe o ID como parâmetro
		function remover(id) {
		let confirmacao = window.confirm("Tem certeza?");
		if (confirmacao) {
			try {
			let ulList = document.getElementById(id);
			lista.removeChild(ulList);
			db.collection("users").doc("usersID").collection(uid).doc(id).delete()
			} catch (error) {
			console.error(error);
			}
		}
		}

		function editar(id, transactionForm, lista2) {
		let divFormEditar = document.getElementById("btn-plus2");
		let btnSalvarEdicao = document.getElementById("salvarBtn-editar");
	
		divFormEditar.classList.toggle("mostrar");
	
		if (transactionForm.classList.contains("mostrar")) {
			transactionForm.classList.remove("mostrar");
		}
	
		if (transactionForm.classList.contains("mostrar") || divFormEditar.classList.contains("mostrar")) {
			lista2.classList.add("diminuir");
		} else {
			lista2.classList.remove("diminuir");
		}
	
		btnSalvarEdicao.addEventListener('click', (e) => {
			e.preventDefault();
	
			// Move a obtenção dos valores dos campos para dentro do evento de clique do botão
			let novoNome = document.getElementById("novoNome").value;
			let novoValor = document.getElementById("NovoValor").value;
			let novaMoeda = document.getElementById("novaMoeda").value;
			let novaData = document.getElementById("novaData").value;
	
			divFormEditar.classList.remove("mostrar");
			lista2.classList.remove("diminuir");
	
			db.collection("users").doc("usersID").collection(uid).doc(id).update({
				name: novoNome,
				valor: novoValor,
				moeda: novaMoeda,
				data: novaData
			});

			setTimeout(()=>{
				location.reload(true)
			}, 500)
		});
		}
  
    });
});
