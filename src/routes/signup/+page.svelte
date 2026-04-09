<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");

  async function handleSignup() {
    loading = true;
    error = "";
    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        error = authError.message || "Erro ao realizar cadastro";
      } else {
        goto("/");
      }
    } catch (e) {
      error = "Erro inesperado. Tente novamente.";
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
        <p>Crie sua conta administrativa</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleSignup(); }} class="auth-form">
      <div class="input-group">
        <label for="name">Nome Completo</label>
        <input type="text" id="name" bind:value={name} class="premium-input" placeholder="Seu nome" required />
      </div>

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
        {loading ? "Cadastrando..." : "Criar Conta"}
      </button>
    </form>

    <div class="auth-footer">
        Já tem uma conta? <a href="/">Entre aqui</a>
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

  .brand {
    text-align: center;
  }

  .brand-logo {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .brand h1 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    margin: 0;
    font-size: 2rem;
    letter-spacing: -0.02em;
  }

  .brand h1 span {
    color: var(--primary);
  }

  .brand p {
    color: var(--text-muted);
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .error-msg {
    color: #ef4444;
    font-size: 0.85rem;
    text-align: center;
    background: rgba(239, 68, 68, 0.1);
    padding: 0.75rem;
    border-radius: 0.5rem;
  }

  .auth-footer {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .auth-footer a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>
