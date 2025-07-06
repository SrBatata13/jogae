import { supabase } from './supabaseClient.js';
const idUsuario = localStorage.getItem('player_id');

// Variáveis globais
let desafios = [];
let desafioIndex = 0;
let pontuacaoTotal = 0;
let desafiosFeitos = [];
let desafiosRecusados = [];
let horaInicioJogo = null;
let horaFimJogo = null;
let intervaloCronometro = null;
let acaoEmAndamento = false;

// ⏳ Buscar hora de início do jogo no Supabase
async function buscarHoraInicioJogo() {
    const { data, error } = await supabase
        .from('jogo_status')
        .select('inicio_em')
        .eq('id', 1)
        .single();

    if (error) {
        console.error("❌ Erro ao buscar hora de início:", error.message);
        return;
    }

    if (data && data.inicio_em) {
    // Corrigir UTC para local manualmente
    horaInicioJogo = new Date(data.inicio_em);
    horaInicioJogo = new Date(horaInicioJogo.getTime() - 3 * 60 * 60 * 1000); // -3h

    // Definir fim do jogo como 3h depois
    horaFimJogo = new Date(horaInicioJogo.getTime() + 3 * 60 * 60 * 1000);

    console.log("Início corrigido (local):", horaInicioJogo.toLocaleString());
    console.log("Fim corrigido (local):", horaFimJogo.toLocaleString());

    await carregarPontuacaoDoUsuario();
    iniciarJogo();
    }

else {
        document.getElementById("desafioTexto").textContent = "⏳ Aguardando o início do jogo...";
        setTimeout(buscarHoraInicioJogo, 5000);
    }
}

// 📥 Carrega a pontuação do Supabase
async function carregarPontuacaoDoUsuario() {
    if (!idUsuario) return;

    const { data, error } = await supabase
        .from('usuarios')
        .select('pontuacao')
        .eq('id', idUsuario)
        .single();

    if (error) {
        console.error("❌ Erro ao carregar pontuação:", error.message);
        return;
    }

    if (data && typeof data.pontuacao === 'number') {
        pontuacaoTotal = data.pontuacao;
        document.getElementById("pontuacao").textContent = `${pontuacaoTotal} pts`;
    }
}

// 🎯 Gera os desafios do jogo
function gerarDesafios() {
    const desafios10_emb = [
        { texto: "Missão: Selfie! → Tire uma selfie com três pessoas da festa.", pontos: 10 },
        { texto: "Coração aberto → Elogie alguém aleatório de forma sincera.", pontos: 10 },
        { texto: "Desafio da pose! → Durante uma música, congele em uma pose engraçada por 10 segundos.", pontos: 10 },
        { texto: "Desafio do drink criativo → Invente um nome e história para o drink que estiver tomando.", pontos: 10 },
        { texto: "Brinde relâmpago → Brinde com alguém da festa.", pontos: 10 },
        { texto: "Faça uma dancinha de TikTok com outra pessoa.", pontos: 10 },
        { texto: "Passinho do ombro → Faça apenas o ombro dançar durante 10 segundos.", pontos: 10 },
        { texto: "Irmão de cores → Encontre alguém com algo da mesma cor que você está usando e tire uma foto juntos.", pontos: 10 },
        { texto: "Complete a frase → Alguém diz: “Essa festa é…” e você completa com a palavra mais absurda possível.", pontos: 10 },
        { texto: "Toca aqui! → Faça um high five com 5 pessoas diferentes em menos de 1 minuto.", pontos: 10 }
    ].sort(() => Math.random() - 0.5).slice(0, 3);

    const desafios50_emb = [
        { texto: "Dançar com alguém → Chame alguém para dançar uma música inteira.", pontos: 50 },
        { texto: "Influencie alguém a beber com você → Use carisma e lábia!", pontos: 50 },
        { texto: "Solte a voz! → Cante ou duble uma música em voz alta.", pontos: 50 },
        { texto: "Famoso por um minuto! → Chame a atenção de todos como se fosse uma celebridade.", pontos: 50 },
        { texto: "Corrente de elogios → Elogie alguém e incentive essa pessoa a elogiar outra.", pontos: 50 },
        { texto: "Dueto improvisado → Cante (ou duble) com outra pessoa uma música qualquer.", pontos: 50 },
        { texto: "Desfile com alguém → Caminhem juntos como se estivessem em um desfile.", pontos: 50 },
        { texto: "Troca de nomes → Apresente-se com um nome falso criativo.", pontos: 50 },
        { texto: "Pedir um 'look do dia' de alguém → Entreviste alguem como se fosse influencer e comente sobre a roupa dela.", pontos: 50 },
        { texto: "Ritual do drink invisível → Brinde com um copo vazio fingindo que é a bebida mais cara do mundo.", pontos: 50 }
    ].sort(() => Math.random() - 0.5).slice(0, 3);
    const desafios100_emb = [
        { texto: "Mostre seu lado dançarino! → Dance solo por 1 minuto na pista de dança.", pontos: 100 },
        { texto: "Dance como se ninguém estivesse olhando (mas todos estão!) → Faça sua dança mais esquisita em público.", pontos: 100 },
        { texto: "Caminhada de passarela do tapete neon → Entre com pose e presença como se estivesse num desfile de gala.", pontos: 100 },
        { texto: "Desafio Britney Breakdown → Faça um mini drama estilo estrela pop. Exagere com humor!", pontos: 100 },
        { texto: "Troca de personalidade → Imite um famoso por 30 segundos.", pontos: 100 },
        { texto: "Flashmob solo → Comece a dançar do nada e tente puxar as pessoas pra dançar com você.", pontos: 100 },
        { texto: "Declare algo 'épico' para todos ouvirem → Tipo: 'Eu sou a alma dessa festa!'", pontos: 100 },
        { texto: "Proposta de casamento fake → Finja propor alguém com pose e tudo (com consentimento!).", pontos: 100 },
        { texto: "Grave um vídeo como influencer → Mostre a festa e comente como se fosse um story.", pontos: 100 },
        { texto: "Entrevista maluca → Improvise uma entrevista com alguém como se ele fosse um famoso.", pontos: 100 }

    ].sort(() => Math.random() - 0.5).slice(0, 3);

    const todos = [...desafios10_emb, ...desafios50_emb, ...desafios100_emb];
    return todos.sort(() => Math.random() - 0.5);
}

// 🕒 Calcula quantos desafios devem estar liberados
function calcularDesafiosDisponiveis() {
    const agora = new Date();
    const diffMinutos = Math.floor((agora.getTime() - horaInicioJogo.getTime()) / (1000 * 60));
    return Math.min(1 + Math.floor(diffMinutos / 20), desafios.length);
}

// ▶️ Inicia o jogo
function iniciarJogo() {
    const desafiosSalvos = localStorage.getItem('desafios');
    const indiceSalvo = localStorage.getItem('desafioIndex');
    const feitosSalvos = localStorage.getItem('desafiosFeitos');

    if (desafiosSalvos) {
        desafios = JSON.parse(desafiosSalvos);
        desafioIndex = parseInt(indiceSalvo, 10) || 0;
        desafiosFeitos = feitosSalvos ? JSON.parse(feitosSalvos) : [];
    } else {
        desafios = gerarDesafios();
        desafioIndex = 0;
        desafiosFeitos = [];
        localStorage.setItem('desafios', JSON.stringify(desafios));
        localStorage.setItem('desafioIndex', desafioIndex);
        localStorage.setItem('desafiosFeitos', JSON.stringify([]));
    }
   console.log("🔢 Total de desafios gerados:", desafios.length);
    mostrarDesafio();
    atualizarCronometro();
    intervaloCronometro = setInterval(() => {
        atualizarCronometro();
        mostrarDesafio();
    }, 1000);
}

// 🧩 Mostra o desafio atual
function mostrarDesafio() {
    const agora = Date.now();
    if (agora >= horaFimJogo) {
        encerrarJogo("Tempo encerrado!");
        return;
    }

    const desafiosLiberados = calcularDesafiosDisponiveis();

    if (desafioIndex < desafiosLiberados) {
        const desafioAtual = desafios[desafioIndex];
        document.getElementById("loading").style.display = "none";
        document.getElementById("desafioContainer").style.display = "block";
        document.getElementById("desafioTexto").textContent = `Desafio ${desafioIndex + 1}: ${desafioAtual.texto}`;
        document.getElementById("valorPonto").textContent = ` (${desafioAtual.pontos} pts)`;
        document.getElementById("botaoFeito").disabled = false;
        document.getElementById("botaoRecusar").disabled = false;
    } else {
        document.getElementById("desafioTexto").textContent = "⏳ Aguardando o próximo desafio...";
        document.getElementById("botaoFeito").disabled = true;
        document.getElementById("botaoRecusar").disabled = true;
    }
}

// ✅ Marcar desafio como feito
async function marcarDesafioComoFeito() {
       if (acaoEmAndamento) return;
    acaoEmAndamento = true;

    document.getElementById("botaoFeito").disabled = true;
    document.getElementById("botaoRecusar").disabled = true;

    desafiosFeitos.push(desafios[desafioIndex]);
    localStorage.setItem('desafiosFeitos', JSON.stringify(desafiosFeitos));

    pontuacaoTotal += desafios[desafioIndex].pontos;
    document.getElementById("pontuacao").textContent = `${pontuacaoTotal} pts`;
    document.getElementById("desafioTexto").textContent = "✅ Desafio concluído! Carregando próximo...";


    if (idUsuario) {
        const { error } = await supabase
            .from('usuarios')
            .update({ pontuacao: pontuacaoTotal })
            .eq('id', idUsuario);

        if (error) console.error("Erro ao atualizar pontuação:", error.message);
    }

    setTimeout(() => {
        avancarParaProximo();
        acaoEmAndamento = false; // 🔓 libera para próxima ação
    }, 1500);
}

// ❌ Recusar desafio
function recusarDesafio() {
    document.getElementById("botaoFeito").disabled = true;
    document.getElementById("botaoRecusar").disabled = true;

    desafiosRecusados.push(desafios[desafioIndex]);
    document.getElementById("desafioTexto").textContent = "❌ Desafio recusado! Carregando próximo...";
    setTimeout(avancarParaProximo, 1500);
}

// ⏭ Avança para o próximo
function avancarParaProximo() {
    desafioIndex++;
    localStorage.setItem('desafioIndex', desafioIndex);
    document.getElementById("desafioContainer").style.display = "none";
    document.getElementById("loading").style.display = "block";
}

// ⏱ Atualiza cronômetro
function atualizarCronometro() {
    const agora = new Date(); // também como objeto Date
    const tempoRestante = horaFimJogo - agora;

    if (tempoRestante <= 0) {
        document.getElementById("timer").textContent = "00:00:00";
        encerrarJogo("Tempo esgotado!");
        return;
    }

    const horas = Math.floor(tempoRestante / (1000 * 60 * 60));
    const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);

    document.getElementById("timer").textContent =
        `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}


// 🛑 Encerra o jogo
function encerrarJogo(mensagem) {
    clearInterval(intervaloCronometro);
    document.getElementById("botaoFeito").disabled = true;
    document.getElementById("botaoRecusar").disabled = true;
    document.getElementById("loading").style.display = "none";
    document.getElementById("desafioContainer").style.display = "block";
    document.getElementById("valorPonto").textContent = "";
    document.getElementById("desafioTexto").textContent =
        `${mensagem} Você fez ${desafiosFeitos.length} desafio(s) e marcou ${pontuacaoTotal} ponto(s).`;
}

// Inicialização
window.marcarDesafioComoFeito = marcarDesafioComoFeito;
window.recusarDesafio = recusarDesafio;
document.getElementById("pontuacao").textContent = `${pontuacaoTotal} pts`;

window.onload = () => {
    verificarJogador();
};

async function verificarJogador() {
    const playerId = localStorage.getItem('player_id');

    if (!playerId) {
        window.location.href = '../index.html';
        return;
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', playerId)
        .single();

    if (error || !data) {
        localStorage.clear();
        window.location.href = '../index.html';
        return;
    }

    buscarHoraInicioJogo();
}
