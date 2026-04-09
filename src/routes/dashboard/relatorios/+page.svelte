<script lang="ts">
  import { jsPDF } from "jspdf";
  import "jspdf-autotable";
  let { data } = $props();

  function calcularIdade(dataNasc: string): number {
    if (!dataNasc) return 0;
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  function exportVaqueiros() {
    const doc = new jsPDF();
    doc.text("Relatório de Vaqueiros", 14, 15);
    const body = data.vaqueiros.map(v => [
      v.cpf, 
      `${v.nomeCompleto} - ${calcularIdade(v.dataNascimento)} anos`, 
      v.apelido || "-", 
      v.cidade || "-"
    ]);
    (doc as any).autoTable({
        head: [['CPF', 'Nome', 'Apelido', 'Cidade']],
        body: body,
        startY: 20
    });
    doc.save("vaqueiros.pdf");
  }

  function exportAnimais() {
    const doc = new jsPDF();
    doc.text("Relatório de Animais", 14, 15);
    const body = data.animais.map(a => [a.nome, a.categoria, a.vaqueiro || "-"]);
    (doc as any).autoTable({
        head: [['Nome', 'Categoria', 'Vaqueiro']],
        body: body,
        startY: 20
    });
    doc.save("animais.pdf");
  }
</script>

<div class="reports-page">
  <h1>Central de Relatórios</h1>
  <p>Escolha o relatório que deseja gerar em PDF.</p>

  <div class="grid">
    <div class="card premium-card">
      <h3>Lista de Vaqueiros</h3>
      <p>Exporta todos os vaqueiros cadastrados com CPF e endereço.</p>
      <button class="premium-button" onclick={exportVaqueiros}>Gerar PDF Vaqueiros</button>
    </div>

    <div class="card premium-card">
      <h3>Lista de Animais</h3>
      <p>Exporta todos os animais vinculados aos seus respectivos vaqueiros.</p>
      <button class="premium-button" onclick={exportAnimais}>Gerar PDF Animais</button>
    </div>
  </div>
</div>

<style>
  .reports-page { display: flex; flex-direction: column; gap: 2rem; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .card { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
  h3 { margin: 0; font-family: 'Outfit'; }
  p { color: var(--text-muted); font-size: 0.9rem; }
</style>
