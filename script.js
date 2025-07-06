import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

document.addEventListener('DOMContentLoaded', () => {
  // Configuração do Supabase
  const supabaseUrl = 'https://soopobfpnbrwdongeszg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3BvYmZwbmJyd2Rvbmdlc3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MDkyNzEsImV4cCI6MjA2MzA4NTI3MX0.646nptjmHIiTvlueCIMk8jG7ELmGY8FJvjYPjf-huT0'; 
  const supabase = createClient(supabaseUrl, supabaseKey);


  const inputFile = document.getElementById('upload');
  const fotoPerfil = document.querySelector('.foto-perfil');
  const nomeInput = document.getElementById('nome');
  const botaoJogar = document.getElementById('btn-jogar');

  // Redirecionamento imediato se player já estiver cadastrado
const playerId = localStorage.getItem('player_id');
if (playerId) {
  window.location.href = '/game/game.html';
}

  // Função para atualizar a foto de perfil
  function atualizarFoto(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        fotoPerfil.src = e.target.result;
        fotoPerfil.style.display = 'block'; // Exibe a imagem
      };
      reader.readAsDataURL(file);
    }
  }

  // Função para verificar se nome e foto foram fornecidos
  function verificarCampos() {
    if (nomeInput.value.trim() !== '' && inputFile.files.length > 0) {
      botaoJogar.disabled = false;
    } else {
      botaoJogar.disabled = true;
    }
  }

  // Evento para limpar o valor do input de arquivo e forçar o evento change
  inputFile.addEventListener('click', function () {
    this.value = null;
  });

  // Evento para atualizar a foto e verificar os campos
  inputFile.addEventListener('change', function (event) {
    atualizarFoto(event);
    verificarCampos();
  });

  // Evento para verificar os campos sempre que o nome for alterado
  nomeInput.addEventListener('input', verificarCampos);

  // Evento para redirecionar ao clicar no botão "Jogar"
  botaoJogar.addEventListener('click', async function (event) {
    if (nomeInput.value.trim() !== '' && inputFile.files.length > 0) {
      // 1. Obter o arquivo de imagem
      const file = inputFile.files[0];
      const nome = nomeInput.value.trim();

      // 2. Fazer upload da foto no Supabase Storage
      const filePath = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) {
        alert('Erro ao enviar imagem.');
        console.error(uploadError);
        return;
      }

      // 3. Obter a URL pública da foto
      const { data: publicUrlData } = supabase
        .storage
        .from('fotos')
        .getPublicUrl(filePath);

      const fotoURL = publicUrlData.publicUrl;

      // 4. Inserir dados do jogador no banco de dados
      const { data: insertData, error: insertError } = await supabase
        .from('usuarios')
        .insert([{ nome: nome, foto_url: fotoURL }])
        .select();

      if (insertError || !insertData || !insertData[0]) {
        alert('Erro ao salvar jogador.');
        console.error(insertError);
        return;
      }

      // 5. Salvar o ID do jogador no localStorage
      localStorage.setItem('player_id', insertData[0].id);

      // 6. Redirecionar para a próxima página (jogo)
      history.replaceState(null, null, '/game/game.html'); // Remove cadastro da pilha
      window.location.href = '/game/game.html';
    } else {
      event.preventDefault(); // Impede o redirecionamento se as condições não forem atendidas
      alert('Por favor, preencha o nome e carregue uma foto de perfil.');
    }
  });
});
