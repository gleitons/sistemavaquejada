<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");

  async function handleLogin() {
    loading = true;
    error = "";
    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        error = authError.message || "Credenciais inválidas";
      } else {
        goto("/dashboard");
      }
    } catch (e) {
      error = "Erro ao entrar. Tente novamente.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-page">
  <div class="premium-card auth-card">
    <div class="brand">
        <span class="brand-logo">🐎</span>
        <h1>Vaquejada<span>Elite</span></h1>
        <p>Acesse sua conta</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="auth-form">
      <div class="input-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" bind:value={email} class="premium-input" placeholder="exemplo@email.com" required />
      </div>

      <div class="input-group">
        <label for="password">Senha</label>
        <input type="password" id="password" bind:value={password} class="premium-input" placeholder="••••••••" required />
      </div>

      {#if error}
        <p class="error-msg">{error}</p>
      {/if}

      <button type="submit" class="premium-button" disabled={loading}>
        {loading ? "Entrando..." : "Entrar no Sistema"}
      </button>
    </form>

    <div class="auth-footer">
        Ainda não tem conta? <a href="/signup">Cadastre-se</a>
    </div>
  </div>
</div>

<style>
  .auth-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 8rem);
    padding: 2rem;
  }

  .auth-card {
    width: 100%;
    max-width: 450px;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brand { text-align: center; }
  .brand-logo { font-size: 3rem; display: block; margin-bottom: 1rem; }
  .brand h1 { font-family: 'Outfit', sans-serif; font-weight: 700; margin: 0; font-size: 2rem; }
  .brand h1 span { color: var(--primary); }
  .brand p { color: var(--text-muted); font-size: 0.9rem; }

  .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
  .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .input-group label { font-size: 0.85rem; color: var(--text-muted); }

  .error-msg {
    color: #ef4444;
    font-size: 0.85rem;
    text-align: center;
    background: rgba(239, 68, 68, 0.1);
    padding: 0.75rem;
    border-radius: 0.5rem;
  }

  .auth-footer { text-align: center; font-size: 0.9rem; color: var(--text-muted); }
  .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
</style>
