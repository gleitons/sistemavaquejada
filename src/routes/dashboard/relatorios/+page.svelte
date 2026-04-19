<script lang="ts">
  import { jsPDF } from "jspdf";
  import autoTable from "jspdf-autotable";
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
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.text("Relação de Vaqueiros Inscritos", 14, 15);

  // 1. Primeiro, ordenamos a lista original por nome completo
  const vaqueirosOrdenados = [...data.vaqueiros].sort((a, b) =>
    a.nomeCompleto.localeCompare(b.nomeCompleto)
  );

  // 2. Agora mapeamos os dados já na ordem correta
  const body = vaqueirosOrdenados.map((v: any, index: number) => {
    const senhasDoVaqueiro = data.senhas
      ?.filter((s: any) => s.vaqueiroPuxadorId === v.id || s.vaqueiroEsteiraId === v.id)
      .map((s: any) => s.numero)
      .join(", ") || "-";

    const cavalos = v.animaisAtribuidos?.map((a: any) => a.animal?.nome || "-").join(", ") || "-";
    const cores = v.animaisAtribuidos?.map((a: any) => a.animal?.cor || "-").join(", ") || "-";
    const racas = v.animaisAtribuidos?.map((a: any) => a.animal?.raca || "-").join(", ") || "-";

    return [
      index + 1, // Índice sequencial agora alinhado ao nome
      v.cpf, // Coluna 2 conforme o seu cabeçalho (Head)
      v.nomeCompleto.toUpperCase(),
      v.apelido?.toUpperCase() || "-",
      v.dataNascimento ? `${calcularIdade(v.dataNascimento)} anos` : "-",
      cavalos.toUpperCase(),
      cores.toUpperCase(),
      racas.toUpperCase()
    ];
  });

  autoTable(doc, {
    head: [['Nº', 'CPF', 'Nome', 'Apelido', 'Idade', 'Cavalo(s)', 'Cor', 'Raça']],
    body: body,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] } // Azul
  });

  doc.save("vaqueiros.pdf");
}

 function exportAnimais() {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("Relação Detalhada de Animais", 14, 15);

    // 1. Primeiro, criamos uma cópia organizada por nome
    const animaisOrdenados = [...data.animais].sort((a, b) => 
        a.nome.localeCompare(b.nome)
    );

    // 2. Agora mapeamos para o formato da tabela
    // O 'index' aqui já seguirá a ordem alfabética
    const body = animaisOrdenados.map((a: any, index: number) => {
        const donos = a.vaqueirosAtribuidos?.map((v: any) => v.vaqueiro?.nomeCompleto || "-").join(", ") || "-";
        
        return [
            index + 1, // Índice sequencial correto
            a.nome.toUpperCase(),
            a.categoria?.toUpperCase() || "-",
            a.sexo?.toUpperCase() || "-",
            a.cor?.toUpperCase() || "-",
            a.raca?.toUpperCase() || "-",
            a.dataNascimento ? `${calcularIdade(a.dataNascimento)} anos` : "-",
            a.pai?.toUpperCase() || "-",
            donos.split(", ").map((d: any) => d.toUpperCase()).join(", ")
        ];
    });

    autoTable(doc, {
        head: [['Nº', 'Nome', 'Categoria', 'Sexo','Cor', 'Raça', 'Idade', 'Pai', 'Vaqueiro(s)']],
        body: body,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [120, 120, 120] }
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
