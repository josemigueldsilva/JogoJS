function start() {
    $('#start').hide();
    $('#gameover').hide();

    let contagem = 3;
    $('#contador').text(contagem).show();

    const musica = document.getElementById("musicaFundo");
    const musicaInicial = document.getElementById("musicaInicio"); // Obtendo a música inicial

    // Para a música inicial ao iniciar o jogo
    if (musicaInicial) {
        musicaInicial.pause();
        musicaInicial.currentTime = 0; // Reinicia caso precise tocar novamente depois
    }

    // Garante que a música do jogo vai começar junto com a contagem
    if (musica) {
        musica.currentTime = 0;
        musica.volume = 0.6;
        musica.play().catch((e) => {
            console.log("Erro ao tentar tocar a música:", e);
        });
    }

    const intervalo = setInterval(() => {
        contagem--;
        if (contagem > 0) {
            $('#contador').text(contagem);
        } else if (contagem === 0) {
            $('#contador').text("LUTA!");
        } else {
            clearInterval(intervalo);
            $('#contador').fadeOut();

            // Adiciona os personagens
            $('#area_jogo').append("<div id='player' class='player'></div>");
            $('#area_jogo').append("<div id='inimigo' class='inimigo'></div>");

            // Inicia o jogo
            iniciarJogo();
        }
    }, 1000);
}

function iniciarJogo() {

    const tecla = {
        CIMA: 38,
        BAIXO: 40,
        ESQUERDA: 37,
        DIREITA: 39,
        ESPACO: 32
    };

    const jogo = {
        pressionou: [],
        atacando: false
    };

    let podeAtacar = true;
    let inimigoAtacando = false;
    let jogoRodando = true;
    let inimigoVivo = true;

    $(document).keydown(function (e) {
        jogo.pressionou[e.which] = true;
        if (e.which === tecla.ESPACO) atacar();
    });

    $(document).keyup(function (e) {
        jogo.pressionou[e.which] = false;
    });

    function loop() {
        if (!jogoRodando) return;
        movimentaPlayer();
        movimentaInimigo();
        requestAnimationFrame(loop);
    }

    loop();

    function movimentaPlayer() {
        const jogador = $("#player");
        if (jogo.atacando) return;

        jogador.removeClass("movendo");

        const limiteSuperior = 600, limiteInferior = 800, limiteEsquerdo = 10, limiteDireito = 1300;

        if (jogo.pressionou[tecla.CIMA]) {
            jogador.addClass("movendo");
            jogador.css("top", Math.max(parseInt(jogador.css("top")) - 2, limiteSuperior));
        }
        if (jogo.pressionou[tecla.BAIXO]) {
            jogador.addClass("movendo");
            jogador.css("top", Math.min(parseInt(jogador.css("top")) + 2, limiteInferior));
        }
        if (jogo.pressionou[tecla.DIREITA]) {
            jogador.addClass("movendo");
            jogador.css("left", Math.min(parseInt(jogador.css("left")) + 2, limiteDireito));
        }
        if (jogo.pressionou[tecla.ESQUERDA]) {
            jogador.addClass("movendo");
            jogador.css("left", Math.max(parseInt(jogador.css("left")) - 2, limiteEsquerdo));
        }
    }

    function atacar() {
    if (!podeAtacar || jogo.atacando || !inimigoVivo) return;

    const jogador = $("#player");
    const inimigo = $("#inimigo");

    podeAtacar = false;
    jogo.atacando = true;

    jogador.removeClass("movendo").addClass("atacando");

    if (inimigo.length && jogador.collision("#inimigo").length > 0) {
        inimigo.removeClass("andando atacando").addClass("inimigo-morrendo");
        inimigoVivo = false;

        // Aguarda a animação antes de remover o inimigo
        setTimeout(() => {
            inimigo.fadeOut(800, () => inimigo.remove()); // 800ms de fade antes de remover
        }, 4000); // Tempo total antes de sumir

    }

    setTimeout(() => {
    jogador.fadeOut(800, () => {
        $("#gameover2").fadeIn();
    });
    }, 5000);

    setTimeout(() => {
        jogador.removeClass("atacando");
        jogo.atacando = false;
    }, 500);

    setTimeout(() => podeAtacar = true, 600);
}

    function movimentaInimigo() {
        const inimigo = $("#inimigo");
        const jogador = $("#player");
        if (!inimigo.length || !inimigoVivo) return;

        const posInimigo = inimigo.position();
        const posJogador = jogador.position();
        const velocidade = 2;

        const distanciaX = posJogador.left - posInimigo.left;
        const distanciaY = posJogador.top - posInimigo.top;
        const distancia = Math.hypot(distanciaX, distanciaY);

        const limiteEsquerdo = 10;
        const limiteDireito = 1430;
        const limiteSuperior = 650;
        const limiteInferior = 926;

        if (!inimigoAtacando) {
            inimigo.removeClass("atacando").addClass("andando");

            if (Math.abs(distanciaX) > 5) {
                let novaEsquerda = posInimigo.left + (distanciaX > 0 ? velocidade : -velocidade);
                novaEsquerda = Math.max(limiteEsquerdo, Math.min(novaEsquerda, limiteDireito));
                inimigo.css("left", novaEsquerda);
            }

            if (Math.abs(distanciaY) > 5) {
                let novoTopo = posInimigo.top + (distanciaY > 0 ? velocidade : -velocidade);
                novoTopo = Math.max(limiteSuperior, Math.min(novoTopo, limiteInferior));
                inimigo.css("top", novoTopo);
            }
        }

        if (distancia < 50 && !inimigoAtacando && jogoRodando) { // Adicionamos "jogoRodando"
            inimigoAtacando = true;
            inimigo.removeClass("andando").addClass("atacando");

        if (inimigoVivo && inimigo.collision("#player").length > 0) {causarDano();}

    setTimeout(() => {
        if (jogoRodando) { // Só continua atacando se o jogo ainda estiver rodando
            inimigo.removeClass("atacando");
            inimigoAtacando = false;
        }
    }, 1000);
}
    }

    function causarDano() {
    const jogador = $("#player");
    const inimigo = $("#inimigo");

    jogoRodando = false; // Para o loop do jogo

    jogador.removeClass("movendo atacando").addClass("morrendo");

    // Aguarda 1s antes de parar completamente o inimigo
    setTimeout(() => {
        inimigo.removeClass("andando atacando"); // Faz o inimigo parar
        inimigoAtacando = false;
    }, 1000);

    setTimeout(() => {
        jogador.fadeOut(800, () => {
            $("#gameover").fadeIn();
        });
    }, 3330); // Tempo da animação antes de sumir

    setTimeout(() => {
    jogador.fadeOut(800, () => {
        $("#gameover").fadeIn();
    });
    }, 3330);
}
}

document.addEventListener("DOMContentLoaded", function() {
    // Oculta a área inicial do jogo até que a tela intermediária seja fechada
    document.getElementById("area_jogo").style.display = "none";

    // Obtém o elemento de áudio
    const musicaInicial = document.getElementById("musicaInicio");

    // Quando o usuário clica na tela inicial, exibe a tela intermediária e inicia a música
    document.getElementById("tela_inicial").addEventListener("click", function() {
        this.style.display = "none";
        document.getElementById("tela_intermediaria").style.display = "block";

        // Inicia a música
        if (musicaInicial) {
            musicaInicial.currentTime = 0;
            musicaInicial.volume = 0.6;
            musicaInicial.play().catch((e) => {
                console.log("Erro ao tentar tocar a música:", e);
            });
        }
    });

    // Obtém o botão "Start"
    const startButton = document.getElementById("start");

    // Previne cliques na tela intermediária e permite apenas no botão "Start"
    document.getElementById("tela_intermediaria").addEventListener("click", function(event) {
        if (event.target !== startButton) { 
            event.stopPropagation(); // Impede que a tela avance ao clicar em qualquer outro lugar
        }
    });

    // Quando o usuário clica no botão "Start", exibe a área inicial do jogo
    startButton.addEventListener("click", function() {
        document.getElementById("tela_intermediaria").style.display = "none";
        document.getElementById("area_jogo").style.display = "block";
    });
});


function reiniciar() {
    location.reload();
}
