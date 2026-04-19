<script lang="ts">
  let { data } = $props();
</script>

<div class="dashboard-home">
  <div class="header-section">
    <h1>Olá, Administrador 👋</h1>
    <p>Bem-vindo ao Sistema Vaquejada Elite. Veja o resumo geral abaixo.</p>
  </div>

   <div class="recent-actions premium-card">
      <h2>Ações Rápidas</h2>
      <div class="action-buttons">
          <a href="/dashboard/vaqueiros" class="premium-button">Registrar Vaqueiro</a>
          <a href="/dashboard/animais" class="premium-button secondary">Registrar Animal</a>
          <a href="/dashboard/senhas" class="premium-button secondary">Gerir Senhas</a>
          <a href="/dashboard/relatorios" class="premium-button tertiary">Emitir Relatórios</a>
      </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card premium-card">
      <div class="stat-icon">🤠</div>
      <div class="stat-content">
        <span class="label">Vaqueiros Cadastrados</span>
        <span class="value">{data.stats.vaqueiros}</span>
      </div>
    </div>

    <div class="stat-card premium-card">
      <div class="stat-icon">🐎</div>
      <div class="stat-content">
        <span class="label">Animais Ativos</span>
        <span class="value">{data.stats.animais}</span>
      </div>
    </div>

    <!-- <div class="stat-card premium-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-content">
        <span class="label">Competições Abertas</span>
        <span class="value">{data.stats.competicoes}</span>
      </div>
    </div>

    <div class="stat-card premium-card">
      <div class="stat-icon">🎟️</div>
      <div class="stat-content">
        <span class="label">Senhas Geradas</span>
        <span class="value">{data.stats.senhas}</span>
      </div>
    </div> -->

    <!-- <div class="stat-card premium-card">
      <div class="stat-icon">💰</div>
      <div class="stat-content">
        <span class="label">Premiação Estimada</span>
        <span class="value">{data.stats.premios}</span>
      </div>
    </div> -->
  </div>

 
</div>

<style>
  .dashboard-home {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .header-section h1 {
    font-size: 2.5rem;
    font-family: 'Outfit', sans-serif;
    margin: 0;
  }

  .header-section p {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .stat-icon {
    font-size: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    border: 1px solid var(--border-glass);
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .label { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem; }
  .value { font-size: 2rem; font-weight: 700; font-family: 'Outfit', sans-serif; }

  .recent-actions {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .recent-actions h2 {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .secondary { background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid var(--border-glass); }
  .secondary:hover { background: rgba(255, 255, 255, 0.1); box-shadow: none; }
  
  .tertiary { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
  .tertiary:hover { background: rgba(194, 120, 3, 0.1); box-shadow: none; }
</style>
