<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { enhance } from "$app/forms";
  import { jsPDF } from "jspdf";

  let { data, form } = $props();
  console.log(data);

  let showModal = $state(false);
  let selectedSenha = $state<any>(null);
  let selectedLote = $state<any>(null);

  // Form states for linking
  let puxadorId = $state("");
  let animalPuxadorId = $state("");
  let esteiraId = $state("");
  let animalEsteiraId = $state("");
  let competitionDate = $state("");

  let filteredSenhas = $derived(
    selectedLote 
      ? data.senhas.filter(s => s.loteId === selectedLote.id)
      : []
  );

  function openLinkModal(senha: any) {
    console.log(senha);
    selectedSenha = senha;
    puxadorId = senha.puxadorId || "";
    animalPuxadorId = senha.animalPuxadorId || "";
    esteiraId = senha.esteiraId || "";
    animalEsteiraId = senha.animalEsteiraId || "";
    competitionDate = senha.dataCompeticao || new Date().toISOString().split('T')[0];
    showModal = true;
  }

  function pprintVoucher(senha: any) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 150] // Compact receipt format
    });

    const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
    const animalP = data.animais.find(a => a.id === senha.animalPuxadorId);
    const esteira = data.vaqueiros.find(v => v.id === senha.esteiraId);
    const animalE = data.animais.find(a => a.id === senha.animalEsteiraId);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VAQUEJADA ELITE", 40, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`SENHA Nº: ${senha.numero}`, 40, 25, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(10, 30, 70, 30);

    doc.setFontSize(10);
    doc.text("PUXADOR:", 10, 40);
    doc.setFont("helvetica", "normal");
    doc.text(puxador?.nomeCompleto || "---", 10, 45);
    doc.text(`CPF: ${puxador?.cpf || "---"}`, 10, 50);
    doc.text(`ANIMAL: ${animalP?.nome || "---"}`, 10, 55);

    doc.setFont("helvetica", "bold");
    doc.text("ESTEIRA:", 10, 65);
    doc.setFont("helvetica", "normal");
    doc.text(esteira?.nomeCompleto || "---", 10, 70);
    doc.text(`ANIMAL: ${animalE?.nome || "---"}`, 10, 75);

    doc.setFontSize(9);
    doc.text(`Data: ${senha.dataCompeticao || "---"}`, 40, 90, { align: "center" });

    if (puxador?.responsavelId) {
        const resp = data.vaqueiros.find(v => v.id === puxador.responsavelId);
        doc.setFontSize(8);
        doc.text(`Responsável: ${resp?.nomeCompleto || ""}`, 40, 100, { align: "center" });
    }

    doc.save(`voucher_senha_${senha.numero}.pdf`);
  }
  // import jsPDF from 'jspdf';

function printVoucher(senha: any) {
  // Ajustado para A4 (210x297mm) para caber todas as informações do formulário
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
  const animalP = data.animais.find(a => a.id === senha.animalPuxadorId);

  // --- CABEÇALHO ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PREFEITURA MUNICIPAL DE LAGOA DOS PATOS", 105, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("PRAÇA 31 DE MARÇO, 111 - CENTRO | TEL. (38) 3745-1239", 105, 20, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("VAQUEJADA NACIONAL DE LAGOA DOS PATOS-2025", 105, 30, { align: "center" });
  doc.text("08 a 11 de maio - Parque Pedro Pereira Durães", 105, 35, { align: "center" });

  doc.setFontSize(14);
  doc.text("FICHA DE INSCRIÇÃO", 105, 45, { align: "center" });
  doc.setFontSize(11);
  doc.text("CATEGORIA MUNICIPAL", 105, 50, { align: "center" });

  // --- NÚMERO DA SENHA ---
  doc.rect(160, 40, 30, 15); // Caixa da senha
  doc.setFontSize(8);
  doc.text("Nº DA SENHA", 175, 44, { align: "center" });
  doc.setFontSize(14);
  doc.text(`${senha.numero}`, 175, 52, { align: "center" });

  // --- DADOS DO COMPETIDOR ---
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 60, 190, 7, 'F');
  doc.setFontSize(10);
  doc.text("DADOS DO COMPETIDOR (PUXADOR)", 12, 65);

  // Tabela de Nome e Apelido
  doc.rect(10, 67, 130, 12); // Nome
  doc.rect(140, 67, 60, 12);  // Apelido
  doc.setFontSize(8);
  doc.text("NOME COMPLETO", 12, 71);
  doc.text("APELIDO", 142, 71);
  doc.setFontSize(10);
  doc.text(puxador?.nomeCompleto || "---", 12, 76);
  doc.text(puxador?.apelido || "---", 142, 76);

  // CPF, RG e Telefone
  doc.rect(10, 79, 60, 12); 
  doc.rect(70, 79, 60, 12);
  doc.rect(130, 79, 70, 12);
  doc.setFontSize(8);
  doc.text("CPF", 12, 83);
  doc.text("IDENTIDADE (RG)", 72, 83);
  doc.text("TELEFONE", 132, 83);
  doc.setFontSize(10);
  doc.text(puxador?.cpf || "---", 12, 88);
  doc.text(puxador?.rg || "---", 72, 88);
  doc.text(puxador?.telefone || "---", 132, 88);

  // Endereço, Cidade e Título
  doc.rect(10, 91, 100, 12);
  doc.rect(110, 91, 50, 12);
  doc.rect(160, 91, 40, 12);
  doc.setFontSize(8);
  doc.text("ENDEREÇO", 12, 95);
  doc.text("CIDADE", 112, 95);
  doc.text("TÍTULO DE ELEITOR", 162, 95);
  doc.setFontSize(10);
  doc.text(puxador?.endereco || "---", 12, 100);
  doc.text(puxador?.cidade || "LAGOA DOS PATOS", 112, 100);
  doc.text(puxador?.tituloEleitor || "---", 162, 100);

  // --- DADOS DO ANIMAL ---
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 110, 190, 7, 'F');
  doc.text("DADOS DO ANIMAL (PUXADOR)", 12, 115);

  doc.rect(10, 117, 130, 12); // Nome Animal
  doc.rect(140, 117, 60, 12);  // Cor
  doc.setFontSize(8);
  doc.text("NOME", 12, 121);
  doc.text("COR", 142, 121);
  doc.setFontSize(10);
  doc.text(animalP?.nome || "---", 12, 126);
  doc.text(animalP?.cor || "---", 142, 126);

  // --- RODAPÉ E ASSINATURAS ---
  doc.setFontSize(8);
  const declaracao = "DECLARO que todas as informações prestadas acima são verdadeiras e assumo total responsabilidade pelas mesmas.";
  doc.text(declaracao, 10, 140);

  const dataAtual = `Lagoa dos Patos/MG, ${new Date().toLocaleDateString('pt-BR')}.`;
  doc.text(dataAtual, 10, 150);

  // Linhas de assinatura
  doc.line(10, 170, 90, 170);
  doc.text("ASSINATURA (Competidor/puxador)", 50, 175, { align: "center" });

  doc.line(110, 170, 190, 170);
  doc.text("Resp. pelo recebimento de documentos", 150, 175, { align: "center" });

  // Nota importante
  doc.setFontSize(7);
  doc.text("* Para validação da inscrição (pela comissão), deverá ser anexada junto a esta ficha, cópia legível de", 10, 185);
  doc.text("documento (com foto) do competidor, comprovante de endereço e título de eleitor.", 10, 189);

  doc.save(`inscricao_${puxador?.nomeCompleto || senha.numero}.pdf`);
}

function senhaJuizes(senha: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
  const animalP = data.animais.find(a => a.id === senha.animalPuxadorId);
  const esteira = data.vaqueiros.find(v => v.id === senha.esteiraId);

  function drawCard(yOff: number) {
    const cx = 105; // center X

    // --- CABEÇALHO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("VAQUEJADA NACIONAL DE LAGOA DOS PATOS-2025", cx, yOff + 14, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("08 a 11 de maio – Parque Pedro Pereira Durães", cx, yOff + 19, { align: "center" });

    // --- CATEGORIA MUNICIPAL (sublinhado) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    const catText = "CATEGORIA MUNICIPAL";
    const catW = doc.getTextWidth(catText);
    const catX = 75;
    doc.text(catText, catX, yOff + 33);
    doc.setLineWidth(0.5);
    doc.line(catX, yOff + 34, catX + catW, yOff + 34);

    // --- CAIXA Nº DA SENHA ---
    doc.setLineWidth(0.4);
    doc.rect(148, yOff + 23, 42, 18);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Nº DA SENHA", 169, yOff + 27, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(`${senha.numero}`, 169, yOff + 38, { align: "center" });

    // --- TABELA VAQUEIRO / ANIMAL / ESTEIREIRO ---
    const tX = 20;       // table X start
    const tW = 170;      // table total width
    const labelW = 28;   // label column width
    const rowH = 9;      // row height
    const tY = yOff + 48;

    // Linha 1: VAQUEIRO
    doc.setFillColor(200, 200, 200);
    doc.rect(tX, tY, labelW, rowH, 'FD');
    doc.rect(tX + labelW, tY, tW - labelW, rowH);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("VAQUEIRO", tX + 3, tY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(puxador?.nomeCompleto?.toUpperCase() || "---", tX + labelW + 4, tY + 6.5);

    // Linha 2: ANIMAL + COR
    const r2Y = tY + rowH;
    const corLabelX = 135;
    const corLabelW = 13;
    doc.setFillColor(200, 200, 200);
    doc.rect(tX, r2Y, labelW, rowH, 'FD');
    doc.rect(tX + labelW, r2Y, corLabelX - tX - labelW, rowH);
    doc.rect(corLabelX, r2Y, corLabelW, rowH);
    doc.rect(corLabelX + corLabelW, r2Y, tX + tW - corLabelX - corLabelW, rowH);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ANIMAL", tX + 3, r2Y + 6);
    doc.text("COR", corLabelX + 2, r2Y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(animalP?.nome?.toUpperCase() || "---", tX + labelW + 4, r2Y + 6.5);
    doc.text(animalP?.cor?.toUpperCase() || "---", corLabelX + corLabelW + 3, r2Y + 6.5);

    // Linha 3: ESTEIREIRO
    const r3Y = r2Y + rowH;
    doc.setFillColor(200, 200, 200);
    doc.rect(tX, r3Y, labelW, rowH, 'FD');
    doc.rect(tX + labelW, r3Y, tW - labelW, rowH);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ESTEIREIRO", tX + 3, r3Y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(esteira?.nomeCompleto?.toUpperCase() || "", tX + labelW + 4, r3Y + 6.5);

    // --- CLASSIFICAÇÃO ---
    const boxSize = 14;
    const boxGap = 7;
    const classLabelW = 35;
    const classY = r3Y + rowH + 12;

    doc.setFillColor(200, 200, 200);
    doc.rect(tX, classY, classLabelW, boxSize, 'FD');
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CLASSIFICAÇÃO", tX + 2, classY + 9);

    for (let i = 0; i < 5; i++) {
      const bx = tX + classLabelW + 10 + i * (boxSize + boxGap);
      doc.rect(bx, classY, boxSize, boxSize);
    }

    // --- DISPUTA ---
    const dispY = classY + boxSize + 10;
    doc.setFillColor(200, 200, 200);
    doc.rect(tX + 5, dispY, classLabelW - 5, boxSize, 'FD');
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("DISPUTA", tX + 8, dispY + 9);

    for (let i = 0; i < 5; i++) {
      const bx = tX + classLabelW + 10 + i * (boxSize + boxGap);
      doc.rect(bx, dispY, boxSize, boxSize);
    }
  }

  // Cartão superior
  drawCard(0);

  // Linha tracejada separadora
  doc.setLineDashPattern([3, 2], 0);
  doc.setLineWidth(0.3);
  doc.line(10, 148, 200, 148);
  doc.setLineDashPattern([], 0);

  // Cartão inferior (segunda via)
  drawCard(148);

  doc.save(`senha_juizes_${senha.numero}.pdf`);
}
const verIdade = (dataNascimento: string) => {
  const hoje = new Date();
  const dataNasc = new Date(dataNascimento);
  const diff = hoje - dataNasc;
  const idade = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return idade;
}
function autorizacaoMenor(senha: any) {
  const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
  if (!puxador) { alert('Puxador não encontrado.'); return; }
  if (!puxador.responsavelId) { alert('Este vaqueiro não possui um responsável vinculado. Cadastre o responsável na página de Vaqueiros.'); return; }

  const resp = data.vaqueiros.find(v => v.id === puxador.responsavelId);
  if (!resp) { alert('Responsável não encontrado no cadastro.'); return; }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = 210;
  const mx = 15;
  const cw = pw - 2 * mx;

  // --- CABEÇALHO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PREFEITURA MUNICIPAL DE LAGOA DOS PATOS', pw / 2, 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('PRAÇA 31 DE MARÇO, 111 - CENTRO', pw / 2, 19, { align: 'center' });
  doc.text('TEL. (38) 3745-1239', pw / 2, 23, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VAQUEJADA NACIONAL DE LAGOA DOS PATOS-2025', pw / 2, 32, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('De 08 a 11 de maio - Parque Pedro Pereira Duraes', pw / 2, 37, { align: 'center' });

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(13);
  const catText = 'CATEGORIA MUNICIPAL';
  const catW2 = doc.getTextWidth(catText);
  doc.text(catText, pw / 2, 45, { align: 'center' });
  doc.line((pw - catW2) / 2, 46, (pw + catW2) / 2, 46);

  // --- TITULO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TERMO DE AUTORIZACAO', pw / 2, 55, { align: 'center' });
  doc.setFontSize(9);
  doc.text('DOS PAIS OU RESPONSAVEIS PARA MENORES DE IDADE PARTICIPAREM NA', pw / 2, 60, { align: 'center' });
  doc.text('CATEGORIA MUNICIPAL DA VAQUEJA DE LAGOA DOS PATOS - 2025', pw / 2, 65, { align: 'center' });

  // --- DADOS DO MENOR ---
  let y = 73;
  doc.setFillColor(180, 180, 180);
  doc.rect(mx, y, cw, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DADOS DO (A) MENOR', pw / 2, y + 5, { align: 'center' });

  y += 7;
  doc.setFillColor(220, 220, 220);
  doc.rect(mx, y, cw, 6, 'FD');
  doc.setFontSize(7);
  doc.text('Nome', mx + 3, y + 4);
  doc.text('Data de Nascimento', mx + 95, y + 4);
  doc.text('Documento', mx + 140, y + 4);

  y += 6;
  doc.rect(mx, y, 90, 8);
  doc.rect(mx + 90, y, 50, 8);
  doc.rect(mx + 140, y, cw - 140, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text((puxador.nomeCompleto || '---').toUpperCase(), mx + 3, y + 5.5);
  doc.text(puxador.dataNascimento.split('-').reverse().join('/') + ' - ' + verIdade(puxador.dataNascimento) + ' anos' || '---', mx + 93, y + 5.5);
  doc.text(puxador.cpf || '---', mx + 143, y + 5.5);

  // --- DADOS DO RESPONSAVEL ---
  y += 12;
  doc.setFillColor(180, 180, 180);
  doc.rect(mx, y, cw, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DADOS DO(A) RESPONSAVEL', pw / 2, y + 5, { align: 'center' });

  y += 7;
  doc.setFillColor(220, 220, 220);
  doc.rect(mx, y, cw, 6, 'FD');
  doc.setFontSize(7);
  doc.text('Nome', mx + 3, y + 4);
  doc.text('Endereco', mx + 80, y + 4);
  doc.text('Grau de Parentesco', mx + 148, y + 4);

  y += 6;
  const enderecoResp = [resp.logradouro, resp.numero, resp.bairro, resp.cidade].filter(Boolean).join(', ');
  let parentesco = (puxador.grauParentesco || 'RESPONSAVEL').toUpperCase();

  doc.rect(mx, y, 75, 12);
  doc.rect(mx + 75, y, 73, 12);
  doc.rect(mx + 148, y, cw - 148, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text((resp.nomeCompleto || '---').toUpperCase(), mx + 3, y + 5);
  const endLines = doc.splitTextToSize((enderecoResp || '---').toUpperCase(), 68);
  doc.text(endLines, mx + 78, y + 5);
  doc.text(parentesco, mx + 151, y + 5);

  // Extra row: CPF, Tel, RG do responsavel
  y += 12;
  doc.setFillColor(220, 220, 220);
  doc.rect(mx, y, cw, 6, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CPF do Responsavel', mx + 3, y + 4);
  doc.text('Telefone', mx + 65, y + 4);
  doc.text('RG / Identidade', mx + 125, y + 4);

  y += 6;
  doc.rect(mx, y, 60, 8);
  doc.rect(mx + 60, y, 65, 8);
  doc.rect(mx + 125, y, cw - 125, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(resp.cpf || '---', mx + 3, y + 5.5);
  doc.text(resp.telefone || '---', mx + 63, y + 5.5);
  doc.text(resp.identidade || '---', mx + 128, y + 5.5);

  // --- TEXTO DE AUTORIZACAO ---
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const par1 = 'Pelo presente, autorizo a participacao do menor acima identificado como competidor (puxador) na VAQUEJADA NACIONAL DE LAGOA DOS PATOS, "CATEGORIA MUNICIPAL" que acontecera entre os dias 08 a 11 de maio de 2025, no Parque de Vaquejada Pedro Pereira Duraes.';
  const l1 = doc.splitTextToSize(par1, cw);
  doc.text(l1, mx, y);

  y += l1.length * 5 + 4;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(9);
  const par2 = 'Declaro que a participacao e efetuada por livre e espontanea vontade do menor e que este nao tem qualquer contraindicacao para a pratica da atividade (vaquejada) e que assumo, integralmente, a responsabilidade pelos riscos que envolvem a participacao do referido menor neste evento, bem como por sua integridade fisica e moral e pelo teor das informacoes acima descritas. Declaro, ainda, que estou ciente dos riscos envolvidos nesta modalidade, sendo assim, em hipotese alguma, responsabilizarei seus organizadores, nem outras instituicoes e pessoas, por acidentes, incidentes e possiveis consequencias que possam ocorrer em funcao da participacao do menor na Vaquejada Nacional de Lagoa dos Patos, categoria Municipal.';
  const l2 = doc.splitTextToSize(par2, cw);
  doc.text(l2, mx, y);

  y += l2.length * 4.5 + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Por ser verdade, assino a presente autorizacao para que surta seus efeitos legais e necessarios.', mx + 10, y);

  y += 14;
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text('Lagoa dos Patos/MG, ' + dataAtual + '.', pw / 2, y, { align: 'center' });

  y += 25;
  doc.line(mx + 35, y, pw - mx - 35, y);
  doc.setFontSize(9);
  doc.text('Assinatura do responsavel', pw / 2, y + 5, { align: 'center' });

  y += 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('* Anexar copia de documento do responsavel', mx + 10, y);

  doc.save('autorizacao_menor_' + (puxador.nomeCompleto || senha.numero) + '.pdf');
}

// Derived: check if selected puxador is minor without responsible
let puxadorMenorSemResponsavel = $derived(() => {
  if (!puxadorId) return false;
  const pux = data.vaqueiros.find(v => v.id === puxadorId);
  if (!pux || !pux.dataNascimento) return false;
  const nasc = new Date(pux.dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  if (idade >= 18) return false;
  return !pux.responsavelId;
});
</script>

<div class="senhas-page">
  <header class="page-header">
    <div>
      <h1>Gestão de Senhas</h1>
      <p>Gere sequências de números e vincule-os aos competidores.</p>
    </div>
    <form method="POST" action="?/gerar" use:enhance class="generator-form">
      <div class="input-row">
        <input type="number" name="inicio" placeholder="De" class="premium-input" required />
        <input type="number" name="fim" placeholder="Até" class="premium-input" required />
        <input type="date" name="data" class="premium-input" required />
      </div>
      <button type="submit" class="premium-button">Gerar Sequência</button>
    </form>
  </header>

  {#if !selectedLote}
    <div class="lotes-section">
      <h3>Sequências Geradas</h3>
      <div class="lotes-list">
        {#each data.lotes as lote}
          <button class="lote-link premium-card" onclick={() => selectedLote = lote}>
            <div class="lote-info">
              <span class="lote-title">Sequência #{lote.inicio} ao #{lote.fim}</span>
              <span class="lote-date">Competição: {lote.dataCompeticao}</span>
            </div>
            <span class="lote-arrow">Ver Senhas →</span>
          </button>
        {:else}
          <div class="empty-state">Nenhuma sequência gerada ainda.</div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="batch-detail-header">
        <button class="premium-button secondary" onclick={() => selectedLote = null}>← Voltar aos Lotes</button>
        <h2>Sequência #{selectedLote.inicio} - #{selectedLote.fim} ({selectedLote.dataCompeticao})</h2>
    </div>

    <div class="flex flex-wrap gap-6 p-4">
  {#each filteredSenhas as senha}
    {@const puxador = data?.vaqueiros?.find(v => v.id === senha?.puxadorId)}
    {@const isMenor = () =>{
      if(!puxador?.dataNascimento) return false;
      const dataNascimento = new Date(puxador?.dataNascimento);
      const idade = new Date().getFullYear() - dataNascimento.getFullYear();
      return idade < 18;
    }}

    <div class="group relative  w-full sm:w-[340px]">
      <div
        class="w-full relative overflow-hidden transition-all duration-300  border-2 rounded-2xl p-4
               {senha.status === 'vinculado' 
                ? 'border-indigo-100 shadow-sm bg-green-800' 
                : 'border-slate-100 bg-indigo-300 border-dashed hover:border-emerald-300'}"
      >
        <button 
          onclick={() => openLinkModal(senha)}
          class="w-full text-left mb-4"
        >
          <div class="absolute top-3 right-3">
            <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md
              {senha.status === 'vinculado' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}">
              {senha.status === 'vinculado' ? 'Ocupada' : 'Livre'}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl 
              {senha.status === 'vinculado' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'} 
              group-hover:scale-105 transition-transform duration-300 shadow-md">
              <span class="text-[10px] uppercase font-bold opacity-80 leading-none">Senha</span>
              <span class="text-2xl font-black leading-tight">{senha.numero}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-tight truncate">
                {puxador ? 'Competidor' : 'Status'}
              </p>
              <h3 class="text-lg font-bold text-slate-800 truncate leading-tight">
                {puxador?.apelido || 'Disponível'}
              </h3>
              {#if puxador}
                <p class="text-[11px] text-slate-500 truncate mt-0.5">
                  {puxador.nomeCompleto.toUpperCase()}
                </p>
              {/if}
            </div>
          </div>
        </button>

        {#if senha.status === 'vinculado'}
          <div class="pt-3 border-t border-slate-100">
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Documentos</p>
            <div class="grid {isMenor() ? 'grid-cols-3' : 'grid-cols-2'} gap-2">
              
              <button 
                title="Ficha de Inscrição"
                class="flex items-center justify-center py-2 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors text-slate-600 shadow-sm"
                onclick={(e) => { e.stopPropagation(); printVoucher(senha); }}>
                <span class="text-lg">📝</span>
              </button>

              <button 
                title="Senha para Juízes"
                class="flex items-center justify-center py-2 bg-slate-50 hover:bg-amber-500 hover:text-white rounded-lg transition-colors text-slate-600 shadow-sm"
                onclick={(e) => { e.stopPropagation(); senhaJuizes(senha); }}>
                <span class="text-lg">⚖️</span>
              </button>

              {#if isMenor()}
                <button 
                  title="Autorização de Menor"
                  class="flex items-center justify-center py-2 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors text-slate-600 shadow-sm"
                  onclick={(e) => { e.stopPropagation(); autorizacaoMenor(senha); }}>
                  <span class="text-lg">📜</span>
                </button>
              {/if}

            </div>
          </div>
        {:else}
          <div class="mt-2 py-2 text-center border-t border-slate-50">
             <span class="text-[10px] font-medium text-slate-300 italic text-center">Aguardando vínculo para liberar documentos</span>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
  {/if}
</div>

{#if showModal}
  <div 
    class="modal-backdrop" 
    onclick={() => showModal = false} 
    onkeydown={e => e.key === 'Escape' && (showModal = false)}
    role="button"
    tabindex="-1"
  >
    <div 
        class="modal-content premium-card h-[40%] overflow-y-auto" 
        onclick={e => e.stopPropagation()} 
        onkeydown={e => e.stopPropagation()}
        role="none"
    >
      <h2>Senha Nº {selectedSenha.numero}</h2>
      
      <form method="POST" action="?/vincular" use:enhance={() => {
        return async ({ result }) => {
          if (result.type === 'success') {
            await invalidateAll();
            // Find the updated senha in the new data
            const updated = data.senhas.find(s => s.id === selectedSenha.id);
            if (updated) {
                selectedSenha = updated;
                // Auto print after linking
                // printVoucher(updated);
            }
            showModal = false;
          }
        };
      }} class="link-form">
        <input type="hidden" name="id" value={selectedSenha.id} />
        
        <div class="section">
          <h4>Puxador</h4>
          <select name="puxadorId" bind:value={puxadorId} class="premium-input uppercase">
            <option value="">Selecione o Vaqueiro</option>
            {#each data.vaqueiros.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)) as v}
              <option class="uppercase" value={v.id}>{v.nomeCompleto} ({v.cpf})</option>
            {/each}
          </select>
          <select  name="animalPuxadorId" bind:value={animalPuxadorId} class="premium-input uppercase">
            <option class="uppercase" value="">Selecione o Animal</option>
            {#each data.animais.sort((a, b) => a.nome.localeCompare(b.nome)) as a}
              <option value={a.id}>{a.nome} ({a.categoria})</option>
            {/each}
          </select>
        </div>

        <div class="section">
          <h4>Esteira</h4>
          <select name="esteiraId" bind:value={esteiraId} class="premium-input uppercase">
            <option value="">Selecione o Vaqueiro</option>
            {#each data.vaqueiros.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)) as v}
              <option class="uppercase" value={v.id}>{v.nomeCompleto} ({v.cpf})</option>
            {/each}
          </select>
          <select name="animalEsteiraId" bind:value={animalEsteiraId} class="premium-input">
            <option value="">Selecione o Animal</option>
            {#each data.animais.sort((a, b) => a.nome.localeCompare(b.nome)) as a}
            
              <option value={a.id}>{a.nome} ({a.categoria})</option>
            {/each}
          </select>
        </div>

        <div class="section">
          <label for="compDate">Data da Competição</label>
          <input id="compDate" type="date" name="data" bind:value={competitionDate} class="premium-input uppercase" />
        </div>

      <div class="space-y-6 p-4">
  <!-- {#if selectedSenha.status === 'vinculado'}
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentos Disponíveis</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          type="button" 
          class="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 active:scale-95"
          onclick={() => printVoucher(selectedSenha)}>
          <span>🖨️</span> Ficha de Inscrição
        </button>

        <button 
          type="button" 
          class="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 active:scale-95"
          onclick={() => printVoucher(selectedSenha)}>
          <span>⚖️</span> Senha Para Juízes
        </button>

        <button 
          type="button" 
          class="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 active:scale-95"
          onclick={() => printVoucher(selectedSenha)}>
          <span>📜</span> Autorização
        </button>
      </div>
    </div>
  {/if} -->

  {#if puxadorMenorSemResponsavel()}
    <div class="bg-red-50 border border-red-300 rounded-lg p-4 mt-2">
      <p class="text-red-700 font-bold text-sm">⚠️ ATENÇÃO: Vaqueiro menor de idade sem responsável vinculado!</p>
      <p class="text-red-600 text-xs mt-1">Este vaqueiro é menor de 18 anos e não possui um responsável cadastrado. Vá até a página de <strong>Vaqueiros</strong>, edite o cadastro do menor e vincule um responsável antes de salvar o vínculo da senha.</p>
    </div>
  {/if}

  <div class="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-100">
    <button 
      type="submit" 
      disabled={puxadorMenorSemResponsavel()}
      class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md shadow-indigo-200 transition-all active:transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
      Salvar Vínculo
    </button>
    
    <button 
      type="button" 
      class="px-8 py-3 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600 rounded-lg font-medium transition-all"
      onclick={() => showModal = false}>
      Fechar
    </button>
  </div>
</div>
      </form>
    </div>
  </div>
{/if}

<style>
  .senhas-page { display: flex; flex-direction: column; gap: 2rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-glass); }
  .generator-form { display: flex; flex-direction: column; gap: 1rem; align-items: flex-end; }
  .input-row { display: flex; gap: 0.5rem; }
  .generator-form input { width: 130px; }

  .lotes-section { display: flex; flex-direction: column; gap: 1.5rem; }
  .lotes-list { display: flex; flex-direction: column; gap: 1rem; }
  .lote-link { 
    display: flex; justify-content: space-between; align-items: center; 
    padding: 1.5rem; cursor: pointer; border: 1px solid var(--border-glass);
    transition: all 0.2s; background: rgba(255,255,255,0.02);
  }
  .lote-link:hover { border-color: var(--primary); background: rgba(194, 120, 3, 0.05); transform: translateX(5px); }
  .lote-info { display: flex; flex-direction: column; gap: 0.25rem; text-align: left; }
  .lote-title { font-size: 1.1rem; font-weight: 700; color: #fff; }
  .lote-date { font-size: 0.85rem; color: var(--text-muted); }
  .lote-arrow { color: var(--primary); font-weight: 600; font-size: 0.9rem; }

  .batch-detail-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 1rem; }
  .batch-detail-header h2 { margin: 0; font-family: 'Outfit'; font-size: 1.5rem; }

  .empty-state { padding: 3rem; text-align: center; color: var(--text-muted); border: 2px dashed var(--border-glass); border-radius: 1rem; }

  .senhas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }

  .senha-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .senha-card:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
  .senha-card.vinculado { background: rgba(9, 216, 2, 0.315); border-color: var(--primary); }
  .senha-card.vinculado .number { color: var(--primary); }

  .number { font-size: 1.5rem; font-weight: 700; font-family: 'Outfit'; color: var(--text-main); }
  .status-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 2rem; }
  .modal-content { max-width: 600px; width: 100%; height: 90%; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; }
  .link-form { display: flex; flex-direction: column; gap: 1.5rem; }
  .section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; }
  .section h4 { margin: 0; color: var(--primary); text-transform: uppercase; font-size: 0.8rem; }
  .modal-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
  
  .premium-button.secondary { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
  .premium-button.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
</style>
