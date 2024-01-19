document.addEventListener("DOMContentLoaded", function() {
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const salvar = document.getElementById('salvar');
   
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
    const auth = firebase.auth(app);

    emailInput.addEventListener('keypress', (e) => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value;

        if (e.keycode == 13) {
            if (email !== '' && senha == '') {
                autenticar(email, senha);
            } else if (email == '' && senha == '') {
                window.confirm('Por favor, preencha todos os campos.');
            }
        }
    })

    senhaInput.addEventListener('keypress', (e) => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value;

        if (e.keycode == 13) {
            if (email !== '' && senha !== '') {
                autenticar(email, senha);
            } else if (email == '' && senha == '') {
                window.confirm('Por favor, preencha todos os campos.');
            }
        }
    })

    salvar.addEventListener('click', (e) => { 
        e.preventDefault();

        const email = emailInput.value.trim();
        const senha = senhaInput.value;

        if (email !== '' && senha !== '') {
            autenticar(email, senha);
        } else if (email == '' && senha == '') {
            window.confirm('Por favor, preencha todos os campos.');
        }
    });

    function autenticar(email, senha) {
        auth.signInWithEmailAndPassword(email, senha)
        .then(() => {
            console.log("Login bem-sucedido");
            redirecionarParaDashboard();
        })
        .catch((error) => {
            console.error("Erro ao autenticar:", error);
            criarNovaConta(email, senha);
        });
    }

    function criarNovaConta(email, senha) {
        auth.createUserWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;
            
            let number = 1
            localStorage.setItem("number", number)

            db.collection("users").doc("usersID").collection(uid).add({})
            .then(() => {
                console.log("Nova conta criada e subcoleção adicionada");
                localStorage.setItem('uid', uid);
                console.log(uid);
                redirecionarParaDashboard();
            })
            .catch((error) => {
                console.error("Erro ao criar subcoleção:", error);
            });
        })
        .catch((error) => {
            console.error("Erro ao criar conta:", error);
        });
    }

    function redirecionarParaDashboard() {
        setTimeout(() => {
            window.location.href = "./dashboard.html";
        }, 50);
    }
})
