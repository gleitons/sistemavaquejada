<script lang="ts">
  let { data, form } = $props();
  let showForm = $state(false);
  let editingAnimal = $state<any>(null);
  let search = $state("");
  let loading = $state(false);
  let selectedVaqueiros = $state<string[]>([]);

  let filteredAnimais = $derived(
    (data.animais || []).filter(a => 
        a.nome.toLowerCase().includes(search.toLowerCase()) || 
        (a.vaqueiros && a.vaqueiros.some(v => v.nomeCompleto.toLowerCase().includes(search.toLowerCase())))
    )
  );

  function toggleVaqueiro(id: string) {
    if (selectedVaqueiros.includes(id)) {
      selectedVaqueiros = selectedVaqueiros.filter(oid => oid !== id);
    } else if (id) {
      selectedVaqueiros = [...selectedVaqueiros, id];
    }
  }

  function startEdit(a: any) {
    editingAnimal = a;
    selectedVaqueiros = a.vaqueiros ? a.vaqueiros.map((v: any) => v.id) : [];
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingAnimal = null;
    selectedVaqueiros = [];
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
          
          <div class="input-group span-2">
            <label for="vaqueiros-select">Vaqueiros Responsáveis</label>
            <div class="multi-select-container premium-input">
              <div class="tags-list">
                {#each selectedVaqueiros as vId}
                  {@const vaqueiro = data.vaqueiros.find(v => v.id === vId)}
                  {#if vaqueiro}
                    <span class="tag">
                      {vaqueiro.nomeCompleto}
                      <button type="button" onclick={() => toggleVaqueiro(vId)}>×</button>
                    </span>
                  {/if}
                {/each}
              </div>
              <select 
                id="vaqueiros-select"
                class="hidden-select" 
                onchange={(e) => toggleVaqueiro(e.currentTarget.value)}
                value=""
              >
                <option value="">+ Vincular Vaqueiro...</option>
                {#each data.vaqueiros as v}
                  {#if !selectedVaqueiros.includes(v.id)}
                    <option value={v.id}>{v.nomeCompleto} ({v.cpf})</option>
                  {/if}
                {/each}
              </select>
              {#each selectedVaqueiros as vId}
                <input type="hidden" name="vaqueiroIds" value={vId} />
              {/each}
            </div>
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
            <td>
              <div class="name-cell">
                {#each (a.vaqueiros || []) as v}
                  <span class="main-name text-xs">{v.nomeCompleto}</span>
                {:else}
                  <span class="text-muted text-xs">-</span>
                {/each}
              </div>
            </td>
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
  /* .hidden-select {
    background: white;
    border: 1px dashed var(--border-glass);
    color: black;
    padding: 0.3rem;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }
  .hidden-select:hover {
    border-color: var(--primary);
    background: white;
    color: black;
  } */
</style>
