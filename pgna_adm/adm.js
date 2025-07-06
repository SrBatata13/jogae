import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuração do Supabase
const supabaseUrl = 'https://soopobfpnbrwdongeszg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3BvYmZwbmJyd2Rvbmdlc3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MDkyNzEsImV4cCI6MjA2MzA4NTI3MX0.646nptjmHIiTvlueCIMk8jG7ELmGY8FJvjYPjf-huT0'; 
const supabase = createClient(supabaseUrl, supabaseKey);




// Função para resetar usuários e fotos
async function resetarTudo() {
  localStorage.clear();
  try {
    // 1. Apagar todos os usuários da tabela "usuarios"
    const { error: usuariosError } = await supabase
      .from('usuarios')
      .delete()
      .not('id', 'is', null);

    if (usuariosError) {
      console.error('Erro ao deletar usuários:', usuariosError);
      alert('Erro ao deletar usuários.');
      return;
    }

    // 2. Listar todos os arquivos no bucket "fotos"
    const { data: listaDeFotos, error: fotosError } = await supabase
      .storage
      .from('fotos')
      .list('', { recursive: true });

    if (fotosError) {
      console.error('Erro ao listar fotos:', fotosError);
      alert('Erro ao listar fotos.');
      return;
    }

    // 3. Filtrar apenas os arquivos (excluindo pastas)
    const nomesDasFotos = listaDeFotos
      .filter(f => f.metadata) // só arquivos
      .map(f => f.name);

    if (nomesDasFotos.length > 0) {
      const { error: deleteFotosError } = await supabase
        .storage
        .from('fotos')
        .remove(nomesDasFotos);

      if (deleteFotosError) {
        console.error('Erro ao deletar fotos:', deleteFotosError);
        alert('Erro ao deletar fotos.');
        return;
      }
    }

    alert('Todos os usuários e fotos foram apagados!');
    
  } catch (error) {
    console.error('Erro no reset:', error);
    alert('Erro ao realizar o reset.');
  }
}

// Texto quando clicar no botão de iniciar
async function iniciarCronometro() {
 
const agora = new Date().toISOString();

    console.log("🟡 Tentando iniciar o jogo às", agora);

    const { data, error } = await supabase
      .from('jogo_status')
      .update({
        iniciado: true,
        inicio_em: agora
      })
      .eq('id', 1)
      .select();

    if (error) {
      console.error("❌ Erro ao atualizar jogo_status:", error.message);
      document.getElementById("status").textContent = "Erro: " + error.message;
    } else {
      console.log("✅ Atualização feita:", data);
      document.getElementById("status").textContent = "🎉 Jogo iniciado com sucesso!";
    }

}


window.resetarTudo = resetarTudo;
window.iniciarCronometro = iniciarCronometro;