<script lang="ts">
  let { data, form } = $props();
  let showForm = $state(false);
  let editingAnimal = $state<any>(null);
  let search = $state("");
  let loading = $state(false);

  let filteredAnimais = $derived(
    (data.animais || []).filter(a => 
        a.nome.toLowerCase().includes(search.toLowerCase()) || 
        (a.vaqueiroNome && a.vaqueiroNome.toLowerCase().includes(search.toLowerCase()))
    )
  );

  function startEdit(a: any) {
    editingAnimal = a;
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingAnimal = null;
  }

  async function handleSubmit(e: SubmitEvent) {
    loading = true;
  }
</script>

<div class="animals-page">
  <div class="page-header">
    <div>
        <h1>Animais</h1>
        <p>Bovinos e Equinos registrados</p>
    </div>
    <button class="premium-button" onclick={showForm ? closeForm : () => showForm = true}>
        {showForm ? 'Fechar Formulário' : '+ Novo Animal'}
    </button>
  </div>

  {#if showForm}
    <div class="form-container premium-card">
      <form method="POST" action={editingAnimal ? "?/atualizar" : "?/registrar"} onsubmit={handleSubmit}>
        {#if editingAnimal}
          <input type="hidden" name="id" value={editingAnimal.id} />
        {/if}

        <div class="form-grid">
          <div class="input-group">
            <label for="nome">Nome do Animal *</label>
            <input id="nome" name="nome" value={editingAnimal?.nome || ''} required class="premium-input" />
          </div>
          <div class="input-group">
            <label for="cor">Cor / Pelagem</label>
            <input id="cor" name="cor" value={editingAnimal?.cor || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="raca">Raça</label>
            <input id="raca" name="raca" value={editingAnimal?.raca || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="dataNascAn">Data Nascimento</label>
            <input id="dataNascAn" name="dataNascimento" type="date" value={editingAnimal?.dataNascimento || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="peso">Peso (kg)</label>
            <input id="peso" name="peso" type="number" step="0.1" value={editingAnimal?.peso || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="categoria">Categoria *</label>
            <select id="categoria" name="categoria" value={editingAnimal?.categoria || 'puxador'} required class="premium-input">
              <option value="puxador">Puxador</option>
              <option value="esteirador">Esteirador</option>
            </select>
          </div>
          <div class="input-group">
            <label for="vaqueiroResponsavel">Vaqueiro Responsável *</label>
            <select id="vaqueiroResponsavel" name="vaqueiroId" value={editingAnimal?.vaqueiroId || ''} required class="premium-input">
              <option value="">Selecione o Vaqueiro</option>
              {#each (data.vaqueiros || []) as v}
                <option value={v.id}>{v.nomeCompleto} ({v.cpf})</option>
              {/each}
            </select>
          </div>
          <div class="input-group">
            <label for="pedigreePai">Pai (Pedigree)</label>
            <input id="pedigreePai" name="pai" value={editingAnimal?.pai || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="pedigreeMae">Mãe (Pedigree)</label>
            <input id="pedigreeMae" name="mae" value={editingAnimal?.mae || ''} class="premium-input" />
          </div>
          <div class="input-group">
            <label for="valorComercial">Valor Comercial (R$)</label>
            <input id="valorComercial" name="valorReal" type="number" step="0.01" value={editingAnimal?.valorReal || ''} class="premium-input" />
          </div>
        </div>

        {#if form?.error}
          <p class="error-text">{form.error}</p>
        {/if}

        <div class="form-actions">
          <button type="submit" class="premium-button submit-btn" disabled={loading}>
            {loading ? 'Salvando...' : (editingAnimal ? 'Atualizar Dados' : 'Registrar Animal')}
          </button>
          {#if editingAnimal}
            <button type="button" class="premium-button secondary" onclick={closeForm}>Cancelar</button>
          {/if}
        </div>
      </form>
    </div>
  {/if}

  <div class="list-section premium-card">
    <div class="search-bar">
      <input type="text" bind:value={search} placeholder="Buscar por nome ou vaqueiro..." class="premium-input" />
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Raça / Cor</th>
          <th>Vaqueiro</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredAnimais as a}
          <tr>
            <td>
              <div class="name-cell">
                <span class="main-name">{a.nome}</span>
                <span class="nick">{a.categoria}</span>
              </div>
            </td>
            <td>{a.raca || '-'} / {a.cor || '-'}</td>
            <td>{a.vaqueiroNome}</td>
            <td>
              <div class="row-actions">
                <button class="edit-btn" onclick={() => startEdit(a)}>✏️</button>
                <form method="POST" action="?/delete" onsubmit={() => confirm('Excluir este animal?')}>
                  <input type="hidden" name="id" value={a.id} />
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
  .animals-page { display: flex; flex-direction: column; gap: 2rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; }
  .page-header h1 { margin: 0; font-family: 'Outfit'; }
  .page-header p { color: var(--text-muted); margin: 0; }

  .form-container { padding: 2rem; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
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
  .nick { color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: capitalize; }
  
  .row-actions { display: flex; gap: 0.5rem; align-items: center; }
  .edit-btn, .delete-btn { background: transparent; border: none; cursor: pointer; opacity: 0.6; transition: 0.2s; font-size: 1.1rem; }
  .edit-btn:hover, .delete-btn:hover { opacity: 1; transform: scale(1.1); }
  
  .form-actions { display: flex; gap: 1rem; margin-top: 1rem; align-items: center; }
  .error-text { color: #ef4444; margin-top: 1rem; font-size: 0.9rem; }
</style>
