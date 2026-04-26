<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  import { page, navigating } from "$app/state";
  // import { navigating } from "$app/stores";
  import Load from "../../components/Load.svelte";

  let { children } = $props();
  let sidebarOpen = $state(true);
  
  // Variável para controlar quando o loading vai aparecer
  let showLoading = $state(false);
  let timeoutId: ReturnType<typeof setTimeout>;

  // O $effect vai observar toda vez que o "navigating" mudar
  $effect(() => {
    if (navigating) {
      // Se começou a navegar, aguarda um tempo antes de mostrar o Load
      // Exemplo: 500ms (meio segundo). Se quiser 2 segundos, troque para 2000
      timeoutId = setTimeout(() => {
        showLoading = false;
      }, 0); 
    } else {
      // Se terminou de carregar (navigating virou null), cancela o timer e esconde
      clearTimeout(timeoutId);
      showLoading = true;
    }
  });

  async function handleLogout() {
    await authClient.signOut();
    goto("/login");
  }

  const menuItems = [
    { name: "Início", path: "/dashboard", icon: "📊" },
    { name: "Vaqueiros", path: "/dashboard/vaqueiros", icon: "🤠" },
    { name: "Animais", path: "/dashboard/animais", icon: "🐎" },
    { name: "Senhas", path: "/dashboard/senhas", icon: "🎟️" },
    { name: "Relatórios", path: "/dashboard/relatorios", icon: "📋" },
  ];
</script>

<!-- Renderiza o componente de carregamento passando a nossa variável controlada -->
<Load show={showLoading} />

<div class="dashboard-container">
  <!-- Sidebar -->
  <aside class="sidebar" class:closed={!sidebarOpen}>
    <div class="sidebar-header">
      <span class="logo-icon">🐎</span>
      {#if sidebarOpen}
        <span class="logo-text">Vaquejada<span></span></span>
      {/if}
    </div>

    <nav class="sidebar-nav">
      {#each menuItems as item}
        <a href={item.path} class={page.url.pathname === item.path ? "active" : ""}>
          <span class="icon">{item.icon}</span>
          {#if sidebarOpen}
            <span>{item.name}</span>
          {/if}
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <!-- <button onclick={handleLogout} class="logout-btn">
        <span class="icon">🚪</span>
        {#if sidebarOpen}
          <span>Sair</span>
        {/if}
      </button> -->
      <a href="/">
        <button class="logout-btn">
          <span class="icon">🚪</span>
          {#if sidebarOpen}
            <span>Sair</span>
          {/if}
        </button>
      </a>
    </div>
  </aside>

  <!-- Main Content -->
  <div class="main-wrapper">
    <header class="top-nav">
      <button onclick={() => sidebarOpen = !sidebarOpen} class="toggle-btn">
        {sidebarOpen ? "«" : "»"}
      </button>
      <div class="user-info">
        <span>Painel de Controle</span>
      </div>
    </header>

    <main class="dashboard-content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .dashboard-container {
    display: flex;
    min-height: 100vh;
    background: transparent;
  }

  .sidebar {
    width: 260px;
    background: var(--bg-glass);
    backdrop-filter: blur(30px);
    border-right: 1px solid var(--border-glass);
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .sidebar.closed {
    width: 80px;
  }

  .sidebar-header {
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid var(--border-glass);
  }

  .logo-icon { font-size: 1.5rem; }
  .logo-text { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.2rem; }
  .logo-text span { color: var(--primary); }

  .sidebar-nav {
    flex: 1;
    padding: 1.5rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: all 0.2s;
    font-weight: 500;
  }

  .sidebar-nav a:hover, .sidebar-nav a.active {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  .sidebar-nav a.active {
    border-left: 3px solid var(--primary);
    background: rgba(194, 120, 3, 0.1);
  }

  .sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-glass);
  }

  .logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: #ef4444;
    cursor: pointer;
    border-radius: 0.75rem;
    transition: background 0.2s;
  }

  .logout-btn:hover { background: rgba(239, 68, 68, 0.1); }

  .main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .top-nav {
    height: 70px;
    background: rgba(18, 18, 18, 0.5);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-glass);
    display: flex;
    align-items: center;
    padding: 0 2rem;
    justify-content: space-between;
  }

  .toggle-btn {
    background: var(--bg-card);
    border: 1px solid var(--border-glass);
    color: #fff;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .dashboard-content {
    padding: 2.5rem;
    flex: 1;
    overflow-y: auto;
  }
</style>
