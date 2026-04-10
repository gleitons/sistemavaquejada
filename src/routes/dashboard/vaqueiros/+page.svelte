<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import type { PageData } from './$types';
  
  let { data, form }: { data: PageData, form: any } = $props();
  
  let showForm = $state(false);
  let editingVaqueiro = $state<any>(null);
  let search = $state("");
  let loading = $state(false);

  // Form state for responsavel/grau
  let responsavelId = $state("");
  let grauParentesco = $state("");
  let grauOutro = $state("");
  let dataNascimentoVal = $state("");
  let selectedAnimais = $state<string[]>([]);

  function toggleAnimal(id: string) {
    if (selectedAnimais.includes(id)) {
      selectedAnimais = selectedAnimais.filter(oid => oid !== id);
    } else if (id) {
      selectedAnimais = [...selectedAnimais, id];
    }
  }

  let filteredVaqueiros = $derived(
    (data.vaqueiros || []).filter(v => 
        v.nomeCompleto.toLowerCase().includes(search.toLowerCase()) || 
        v.cpf.includes(search) ||
        (v.apelido && v.apelido.toLowerCase().includes(search.toLowerCase()))
    )
  );

  // Check if current vaqueiro being edited/created is minor
  let isMenorForm = $derived(() => {
    if (!dataNascimentoVal) return false;
    const [year, month, day] = dataNascimentoVal.split('-').map(Number);
    const nasc = new Date(year, month - 1, day);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade < 18;
  });

  function calcularIdade(dataNasc: string): number {
    if (!dataNasc) return 0;
    const [year, month, day] = dataNasc.split('-').map(Number);
    const nasc = new Date(year, month - 1, day);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  function startEdit(v: any) {
    editingVaqueiro = v;
    responsavelId = v.responsavelId || "";
    grauParentesco = v.grauParentesco || "";
    grauOutro = "";
    dataNascimentoVal = v.dataNascimento || "";
    selectedAnimais = v.animais ? v.animais.map((a: any) => a.id) : [];
    // If grauParentesco is custom (not in list), set grauParentesco to "outro" and grauOutro to the value
    const opcoesPadrao = ['mae', 'pai', 'avo', 'avó', 'tio', 'tia', 'tutor'];
    if (v.grauParentesco && !opcoesPadrao.includes(v.grauParentesco)) {
      grauOutro = v.grauParentesco;
      grauParentesco = 'outro';
    }
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingVaqueiro = null;
    responsavelId = "";
    grauParentesco = "";
    grauOutro = "";
    dataNascimentoVal = "";
    selectedAnimais = [];
  }

  async function handleSubmit(e: SubmitEvent) {
    // If minor, validate responsavel is selected
    if (isMenorForm() && !responsavelId) {
      e.preventDefault();
      alert('Vaqueiro menor de idade: é obrigatório vincular um responsável!');
      return;
    }
    loading = true;
  }
</script>

<div class="cowboys-page">
  <div class="page-header">
    <div>
        <h1>Vaqueiros</h1>
        <p>Gerenciamento de competidores</p>
    </div>
    <button class="premium-button" onclick={showForm ? closeForm : () => showForm = true}>
        {showForm ? 'Fechar Formulário' : '+ Novo Vaqueiro'}
    </button>
  </div>

  {#if showForm}
    <div class="form-container premium-card">
      <form method="POST" action={editingVaqueiro ? "?/atualizar" : "?/registrar"} onsubmit={handleSubmit}>
        {#if editingVaqueiro}
          <input type="hidden" name="id" value={editingVaqueiro.id} />
        {/if}
        
        <div class="form-grid">
          <div class="input-group">
            <label for="nomeCompleto">Nome Completo *</label>
            <input id="nomeCompleto" name="nomeCompleto" value={editingVaqueiro?.nomeCompleto || ''} required class="premium-input" placeholder="Ex: João Silva" />
          </div>
          <div class="input-group">
            <label for="cpf">CPF *</label>
            <input id="cpf" name="cpf" value={editingVaqueiro?.cpf || ''} required class="premium-input" placeholder="000.000.000-00" disabled={!!editingVaqueiro} />
            {#if editingVaqueiro}
              <input type="hidden" name="cpf" value={editingVaqueiro.cpf} />
            {/if}
          </div>
          <div class="input-group">
            <label for="apelido">Apelido</label>
            <input id="apelido" name="apelido" value={editingVaqueiro?.apelido || ''} class="premium-input" placeholder="Como é conhecido" />
          </div>
          <div class="input-group">
            <label for="dataNascimento">Data Nascimento *</label>
            <input id="dataNascimento" name="dataNascimento" type="date" bind:value={dataNascimentoVal} required class="premium-input" />
          </div>
          <div class="input-group">
            <label for="identidade">Identidade (RG)</label>
            <input id="identidade" name="identidade" value={editingVaqueiro?.identidade || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="telefone">Telefone</label>
            <input id="telefone" name="telefone" value={editingVaqueiro?.telefone || ''} class="premium-input" placeholder="(00) 00000-0000" />
          </div>
          <div class="input-group">
            <label for="nomeMae">Nome da Mãe</label>
            <input id="nomeMae" name="nomeMae" value={editingVaqueiro?.nomeMae || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="nomePai">Nome do Pai</label>
            <input id="nomePai" name="nomePai" value={editingVaqueiro?.nomePai || ''} class="premium-input" />
          </div>
          <div class="input-group span-2">
            <label for="logradouro">Endereço / Logradouro</label>
            <input id="logradouro" name="logradouro" value={editingVaqueiro?.logradouro || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="numero">Número</label>
            <input id="numero" name="numero" value={editingVaqueiro?.numero || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="bairro">Bairro</label>
            <input id="bairro" name="bairro" value={editingVaqueiro?.bairro || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="comunidade">Comunidade</label>
            <input id="comunidade" name="comunidade" value={editingVaqueiro?.comunidade || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="cidade">Cidade</label>
            <input id="cidade" name="cidade" value={editingVaqueiro?.cidade || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="cep">CEP</label>
            <input id="cep" name="cep" value={editingVaqueiro?.cep || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="tituloEleitor">Título de Eleitor</label>
            <input id="tituloEleitor" name="tituloEleitor" value={editingVaqueiro?.tituloEleitor || ''} class="premium-input" />
          </div>
          {#if isMenorForm()}
            <div class="input-group">
              <label for="responsavelId">Responsável (Obrigatório para menor) *</label>
              <select id="responsavelId" name="responsavelId" bind:value={responsavelId} required={isMenorForm()} class="premium-input">
                <option value="">Selecione o Responsável</option>
                {#each (data.vaqueiros || []) as v}
                  {#if v.id !== editingVaqueiro?.id}
                    <option value={v.id}>{v.nomeCompleto} ({v.cpf})</option>
                  {/if}
                {/each}
              </select>
            </div>

            <div class="input-group">
              <label for="grauParentescoSelect">Grau de Parentesco *</label>
              <select id="grauParentescoSelect" bind:value={grauParentesco} required={isMenorForm()} class="premium-input">
                <option value="">Selecione...</option>
                <option value="mae">Mãe</option>
                <option value="pai">Pai</option>
                <option value="avo">Avô</option>
                <option value="avó">Avó</option>
                <option value="tio">Tio</option>
                <option value="tia">Tia</option>
                <option value="tutor">Tutor</option>
                <option value="outro">Outro...</option>
              </select>
            </div>

            {#if grauParentesco === 'outro'}
              <div class="input-group">
                <label for="grauOutro">Especifique o Parentesco</label>
                <input id="grauOutro" bind:value={grauOutro} required={grauParentesco === 'outro'} class="premium-input" placeholder="Ex: Primo, Irmão" />
              </div>
            {/if}

            <input type="hidden" name="grauParentesco" value={grauParentesco === 'outro' ? grauOutro : grauParentesco} />
          {/if}

          <div class="input-group span-2">
            <label for="animais-select">Animais Vinculados</label>
            <div class="multi-select-container premium-input">
              <div class="tags-list">
                {#each selectedAnimais as animalId}
                  {@const animal = data.animais.find(a => a.id === animalId)}
                  {#if animal}
                    <span class="tag">
                      {animal.nome}
                      <button type="button" onclick={() => toggleAnimal(animalId)}>×</button>
                    </span>
                  {/if}
                {/each}
              </div>
              <select 
                class="premium-input" 
                onchange={(e) => toggleAnimal(e.currentTarget.value)}
                value=""
              >
                <option value="">+ Vincular Animal...</option>
                {#each data.animais as a}
                  {#if !selectedAnimais.includes(a.id)}
                    <option class="premium-input" value={a.id}>{a.nome} ({a.categoria})</option>
                  {/if}
                {/each}
              </select>
              {#each selectedAnimais as animalId}
                <input type="hidden" name="animalIds" value={animalId} />
              {/each}
            </div>
          </div>
        </div>
        
        {#if form?.error}
          <p class="error-text">{form.error}</p>
        {/if}

        <div class="form-actions">
          <button type="submit" class="premium-button submit-btn" disabled={loading}>
            {loading ? 'Salvando...' : (editingVaqueiro ? 'Atualizar Dados' : 'Salvar Cadastro')}
          </button>
          {#if editingVaqueiro}
            <button type="button" class="premium-button secondary" onclick={closeForm}>Cancelar</button>
          {/if}
        </div>
      </form>
    </div>
  {/if}

  <div class="list-section premium-card">
    <div class="search-bar">
      <input type="text" bind:value={search} placeholder="Buscar por nome, CPF ou apelido..." class="premium-input" />
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>CPF</th>
          <th>Nome / Apelido</th>
          <th>Cidade / Comunidade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredVaqueiros as v}
          <tr>
            <td>{v.cpf}</td>
            <td>
              <div class="name-cell">
                <span class="main-name">{v.nomeCompleto}</span>
                {#if v.apelido}<span class="nick">"{v.apelido}"</span>{/if}
              </div>
            </td>
            <td>{v.cidade || '-'} / {v.comunidade || '-'}</td>
            <td>
              <div class="row-actions">
                <button class="edit-btn" onclick={() => startEdit(v)}>✏️</button>
                <form method="POST" action="?/delete" onsubmit={() => confirm('Excluir este vaqueiro?')}>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" class="delete-btn">🗑️</button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .cowboys-page { display: flex; flex-direction: column; gap: 2rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; }
  .page-header h1 { margin: 0; font-family: 'Outfit'; }
  .page-header p { color: var(--text-muted); margin: 0; }

  .form-container { padding: 2rem; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
  .span-2 { grid-column: span 2; }
  .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .input-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
  .submit-btn { margin-top: 2rem; width: 100%; max-width: 300px; }

  .list-section { padding: 1.5rem; overflow: hidden; }
  .search-bar { margin-bottom: 1.5rem; }
  .search-bar input { width: 100%; }

  .premium-table { width: 100%; border-collapse: collapse; text-align: left; }
  .premium-table th { padding: 1rem; border-bottom: 1px solid var(--border-glass); color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
  .premium-table td { padding: 1rem; border-bottom: 1px solid var(--border-glass); font-size: 0.95rem; }
  
  .name-cell { display: flex; flex-direction: column; }
  .nick { color: var(--primary); font-size: 0.8rem; font-weight: 600; }
  
  .row-actions { display: flex; gap: 0.5rem; align-items: center; }
  .edit-btn, .delete-btn { background: transparent; border: none; cursor: pointer; opacity: 0.6; transition: 0.2s; font-size: 1.1rem; }
  .edit-btn:hover, .delete-btn:hover { opacity: 1; transform: scale(1.1); }
  
  .form-actions { display: flex; gap: 1rem; margin-top: 2rem; align-items: center; }
  .error-text { color: #ef4444; margin-top: 1rem; font-size: 0.9rem; }

  .multi-select-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    min-height: 50px;
  }
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .tag {
    background: var(--primary);
    color: #fff;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
  }
  .tag button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0;
    line-height: 1;
  }
  .hidden-select {
    /* background: transparent; */
    border: 1px dashed var(--border-glass);
    color: var(--text-muted);
    padding: 0.3rem;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }
  .hidden-select:hover {
    border-color: var(--primary);
    color: var(--text-main);
  }
</style>
