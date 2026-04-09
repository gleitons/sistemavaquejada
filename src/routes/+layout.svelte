<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';

  let { children } = $props();
</script>

<svelte:head>
  <title>Sistema Vaquejada | Gestão Premium</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-bg" style="background-image: url('/vaquejada_background.png')"></div>

<div class="app-container">
  <main class="main-content">
    {@render children()}
  </main>

  <footer class="footer">
    <p>&copy; 2026 Sistema Vaquejada Elite - Todos os direitos reservados</p>
  </footer>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    background-color: #121212;
  }

  .app-container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .footer {
    padding: 2rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.8rem;
    letter-spacing: 0.05em;
  }
</style>
