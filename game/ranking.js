import { supabase } from './supabaseClient.js'

async function montarRanking() {
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('pontuacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar dados:', error)
    return
  }

  const playerId = localStorage.getItem('player_id')

  // Preenche o top 3 (pódio)
  const top3 = usuarios.slice(0, 3)
  const posicoes = ['primeiro', 'segundo', 'terceiro']
  top3.forEach((usuario, index) => {
    const lugar = document.querySelector(`.colocação.${posicoes[index]}`)
    if (lugar) {
      const img = lugar.querySelector('.avatar img')
      const nome = lugar.querySelector('.nome')
      const pontos = lugar.querySelector('.pontos')
      if (img) img.src = usuario.foto_url || '../imagens/icon-pessoa.png'
      if (nome) nome.textContent = usuario.nome
      if (pontos) pontos.textContent = `${usuario.pontuacao} pts`
    }
  })

  // Preenche o ranking geral (a partir do 4º colocado)
  const rankingGeral = usuarios.slice(3)
  const container = document.getElementById('ranking-geral')

  if (!container) {
    console.warn('Div com id="ranking-geral" não encontrada')
    return
  }

  container.innerHTML = '' // Limpa antes de adicionar

  rankingGeral.forEach((usuario, index) => {
    const isJogadorAtual = usuario.ip === playerId

    const div = document.createElement('nav') // Mantém a tag <nav> como no seu HTML original
    div.className = `jogador-ranking${isJogadorAtual ? ' destaque' : ''}`
    div.innerHTML = `
      <img src="${usuario.foto_url || '../imagens/icon-pessoa.png'}" alt="avatar">
      <div class="info">
        <div class="nome">${index + 4}. ${usuario.nome}</div>
        <div class="pontos">${usuario.pontuacao} pts</div>
      </div>
    `
    container.appendChild(div)
  })
}
montarRanking()
// Atualiza o ranking a cada 10 segundos (10000 ms)
// Garante que não crie múltiplos intervals
if (window.rankingInterval) clearInterval(window.rankingInterval);

window.rankingInterval = setInterval(() => {
  montarRanking();
}, 30000);

