<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { enhance } from "$app/forms";
  import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Loading from "../../../components/Loading.svelte";

  let { data, form } = $props();

  // console.log(data);

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
  async function getBase64FromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous'); // Evita erro de CORS
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
}

  function openLinkModal(senha: any) {
    // console.log(senha);
    selectedSenha = senha;
    puxadorId = senha.puxadorId || "";
    animalPuxadorId = senha.animalPuxadorId || "";
    esteiraId = senha.esteiraId || "";
    animalEsteiraId = senha.animalEsteiraId || "";
    competitionDate = senha.dataCompeticao || new Date().toISOString().split('T')[0];
    showModal = true;
  }

  function calcularIdade(dataNasc: string): number {
    if (!dataNasc) return 0;
    const [year, month, day] = dataNasc.split('-').map(Number);
    const nasc = new Date(year, month - 1, day);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
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

async function printVoucher(senha: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
  const animalP = data.animais.find(a => a.id === senha.animalPuxadorId);
  
  // Conta quantos cavalos estão vinculados a este puxador no sistema
  const cavalosVinculados = data.senhas.filter(s => s.puxadorId === puxador?.id).length;

  // --- CABEÇALHO ---
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(14);
  // doc.text("PREFEITURA MUNICIPAL DE LAGOA DOS PATOS", 105, 15, { align: "center" }); // [cite: 1]
  
  // doc.setFontSize(10);
  // doc.setFont("helvetica", "normal");
  // doc.text("PRAÇA 31 DE MARÇO, 111 - CENTRO | TEL. (38) 3745-1239", 105, 20, { align: "center" }); // [cite: 2, 3]

  // --- IMAGENS (LOGOS) ---
  // Substitua as strings abaixo pelo seu código Base64 real (ex: 'data:image/png;base64,iVBORw...')
  const logoEsquerdo = await getBase64FromUrl("/brasao-lagoa.jpg"); 
  const logoDireito = await getBase64FromUrl("/logo-administracao.jpg");

  // addImage(params: base64, formato, x, y, largura, altura)
  if (logoEsquerdo) {
    doc.addImage(logoEsquerdo, 'JPG', 10, 10, 25, 25); 
  }
  
  if (logoDireito) {
    doc.addImage(logoDireito, 'JPG', 165, 10, 40, 25);
  }

  // --- CABEÇALHO TEXTUAL ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PREFEITURA MUNICIPAL DE LAGOA DOS PATOS", 105, 15, { align: "center" }); // [cite: 1]
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("PRAÇA 31 DE MARÇO, 111 - CENTRO | TEL. (38) 3426-0398", 105, 20, { align: "center" }); // [cite: 2, 3]
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("VAQUEJADA NACIONAL DE LAGOA DOS PATOS - 2026", 105, 30, { align: "center" }); // [cite: 4]
  doc.text("07 a 10 de maio - Parque de Vaquejada Pedro Pereira Durães", 105, 35, { align: "center" }); // [cite: 5]

  doc.setFontSize(14);
  doc.text("FICHA DE INSCRIÇÃO", 105, 45, { align: "center" }); // [cite: 6]
  doc.setFontSize(11);
  doc.text("CATEGORIA MUNICIPAL", 105, 50, { align: "center" }); // [cite: 7]

  // --- NÚMERO DA SENHA ---
  doc.rect(160, 40, 30, 15); 
  doc.setFontSize(8);
  doc.text("Nº DA SENHA", 175, 44, { align: "center" }); // [cite: 9]
  doc.setFontSize(24);
  doc.text(`${senha.numero}`, 175, 52, { align: "center" }); // [cite: 10]



  // Linha 1: Nome e Apelido
  doc.rect(10, 67, 130, 12); 
  doc.rect(140, 67, 60, 12); 
  doc.setFontSize(7);
  doc.text("NOME COMPLETO", 12, 71); // [cite: 12]
  doc.text("APELIDO", 142, 71); // [cite: 12]
  doc.setFontSize(9);
  doc.text(puxador?.nomeCompleto?.toUpperCase() || "---", 12, 76);
  doc.text(puxador?.apelido?.toUpperCase() || "---", 142, 76);

  // Linha 2: Nascimento, Idade e Cavalos Vinculados
  doc.rect(10, 79, 60, 12);
  doc.rect(70, 79, 60, 12);
  doc.rect(130, 79, 70, 12);
  doc.setFontSize(7);
  doc.text("DATA DE NASCIMENTO", 12, 83);
  doc.text("IDADE", 72, 83);
  doc.text("ANIMAIS VINCULADOS NESTE CPF", 132, 83);
  doc.setFontSize(9);
  // {console.log(puxador?.sexo)}
  const dataNasc = puxador?.dataNascimento ? puxador.dataNascimento.split('-').reverse().join('/') : "---";
  doc.text(dataNasc, 12, 88);
  doc.text(`${calcularIdade(puxador?.dataNascimento)} anos - ${puxador?.genero?.toUpperCase() || "---"}`, 72, 88);
  doc.text(`${cavalosVinculados} animal(is)`, 132, 88);

  // Linha 3: CPF, Identidade e Telefone
  doc.rect(10, 91, 60, 12); 
  doc.rect(70, 91, 60, 12);
  doc.rect(130, 91, 70, 12);
  doc.setFontSize(7);
  doc.text("CPF", 12, 95); // [cite: 13]
  doc.text("IDENTIDADE (RG)", 72, 95); // [cite: 13]
  doc.text("TELEFONE", 132, 95); // [cite: 13]
  doc.setFontSize(9);
  doc.text(puxador?.cpf || "---", 12, 100);
  doc.text(puxador?.identidade?.toUpperCase() || "---", 72, 100);
  doc.text(puxador?.telefone || "---", 132, 100);

  // Linha 4: Filiação (Pai e Mãe)
  doc.rect(10, 103, 95, 12); 
  doc.rect(105, 103, 95, 12);
  doc.setFontSize(7);
  doc.text("NOME DO PAI", 12, 107);
  doc.text("NOME DA MÃE", 107, 107);
  doc.setFontSize(9);
  doc.text(puxador?.nomePai?.toUpperCase() || "---", 12, 112);
  doc.text(puxador?.nomeMae?.toUpperCase() || "---", 107, 112);

  // Linha 5: Endereço Completo
  doc.rect(10, 115, 100, 12);
  doc.rect(110, 115, 50, 12);
  doc.rect(160, 115, 40, 12);
  doc.setFontSize(7);
  doc.text("ENDEREÇO (LOGRADOURO, Nº, BAIRRO)", 12, 119); // [cite: 14]
  doc.text("CIDADE / COMUNIDADE", 112, 119); // [cite: 14]
  doc.text("TÍTULO DE ELEITOR", 162, 119); // [cite: 14]
  doc.setFontSize(8);
  const endereco = `${puxador?.logradouro}, ${puxador?.numero} - ${puxador?.bairro}`;
  doc.text(endereco.toUpperCase(), 12, 124);
  doc.text(`${puxador?.cidade} / ${puxador?.comunidade}`.toUpperCase(), 112, 124);
  doc.text(puxador?.tituloEleitor || "---", 162, 124);

  // --- DADOS DO ANIMAL ---
doc.setFillColor(240, 240, 240);
doc.rect(10, 132, 190, 7, 'F');
doc.setFontSize(10);
doc.text("DADOS DO ANIMAL (PUXADOR)", 12, 137); // [cite: 11, 15]

// Divisão da linha: Nome (90mm), Raça (50mm), Cor (50mm)
doc.rect(10, 139, 90, 12);  // Box Nome
doc.rect(100, 139, 50, 12); // Box Raça
doc.rect(150, 139, 50, 12); // Box Cor

doc.setFontSize(7);
doc.text("NOME DO ANIMAL", 12, 143); // 
doc.text("RAÇA", 102, 143);
doc.text("COR", 152, 143); // 

doc.setFontSize(9);
doc.text(animalP?.nome?.toUpperCase() || "---", 12, 148); // 
doc.text(animalP?.raca?.toUpperCase() || "---", 102, 148);
doc.text(animalP?.cor?.toUpperCase() || "---", 152, 148); //
  // --- RODAPÉ E ASSINATURAS ---
  doc.setFontSize(8);
  const declaracao = "DECLARO que todas as informações prestadas acima são verdadeiras e assumo total responsabilidade pelas mesmas."; // [cite: 16]
  doc.text(declaracao, 10, 165);

  const dataAtual = `Lagoa dos Patos/MG, ${new Date().toLocaleDateString('pt-BR')}.`; // [cite: 17]
  doc.text(dataAtual, 10, 175);

  doc.line(10, 195, 90, 195);
  doc.text(`ASSINATURA: ${puxador?.nomeCompleto?.toUpperCase() || "---"}`, 50, 200, { align: "center" }); // [cite: 18]

  doc.line(110, 195, 190, 195);
  doc.text("Resp. pelo recebimento de documentos", 150, 200, { align: "center" }); // [cite: 19]

  doc.setFontSize(7);
  doc.text("* Para validação da inscrição (pela comissão), deverá ser anexada junto a esta ficha, cópia legível de documento (com foto) do competidor, ", 10, 215); // [cite: 20]
  doc.text("comprovante de endereço e título de eleitor.", 10, 220); // [cite: 20]

  doc.save(`inscricao_${puxador?.nomeCompleto || senha.numero}.pdf`);
}
async function senhaJuizes(senha: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
  const animalP = data.animais.find(a => a.id === senha.animalPuxadorId);
  const esteira = data.vaqueiros.find(v => v.id === senha.esteiraId);

  const logoEsquerdo = await getBase64FromUrl("/brasao-lagoa.jpg").catch(()=>null); 
  const logoDireito = await getBase64FromUrl("/logo-administracao.jpg").catch(()=>null);
  // const imageVaqueiro = await getBase64FromUrl("/vaqueiro.jpg").catch(()=>null);
  // const imageVaqueira = await getBase64FromUrl("/vaqueira.jpg").catch(()=>null);

  function drawCard(yOff: number) {
    const cx = 105; // center X

    if (logoEsquerdo) {
      doc.addImage(logoEsquerdo, 'JPG', 10, yOff + 10, 20, 20); 
    }
    if (logoDireito) {
      doc.addImage(logoDireito, 'JPG', 180, yOff + 10, 25, 12);
    }

    // console.log(puxador?.genero)

    // if (puxador?.genero === "Masculino") {
    //   doc.addImage(imageVaqueiro, 'JPG', 10, yOff + 30, 5, 15);
    // } else {
    //   doc.addImage(imageVaqueira, 'JPG', 10, yOff + 30, 5, 12);
    // }

    // --- CABEÇALHO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("VAQUEJADA NACIONAL DE LAGOA DOS PATOS - 2026", cx, yOff + 14, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("07 a 10 de maio – Parque de Vaquejada Pedro Pereira Durães", cx, yOff + 19, { align: "center" });

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
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text("Nº DA SENHA", 169, yOff + 27, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(`${senha.numero}`, 169, yOff + 38, { align: "center" });

      //-- ANOTACOES --
  // 1. Desenha o Retângulo
// x=10, y=55, largura=190, altura=15
doc.rect(140, 105, 60, 30); 

// 2. Configura a fonte
doc.setFont("helvetica", "normal");
doc.setFontSize(12);

// 3. Alinhamento Perfeito
// X = 105 (Centro do retângulo: 10 + 190/2)
// Y = 64  (Aprox. o meio vertical do retângulo de altura 15)
doc.text("ANOTACOES", 166, 103, { align: "center"}); 

// Para a linha (___________________)
// doc.setFontSize(24);
// Se quiser centralizar a linha também:
// doc.text("___________________", 170, 105, { align: "center" });


  // --- DADOS DO COMPETIDOR ---
  // doc.setFillColor(240, 240, 240);
  // doc.rect(10, 60, 190, 7, 'F');
  // doc.setFontSize(10);
  // doc.text("DADOS DO COMPETIDOR (PUXADOR)", 12, 65); // [cite: 11]

    // --- TABELA VAQUEIRO / ANIMAL / ESTEIREIRO ---
    const tX = 10;       // table X start
    const tW = 190;      // table total width
    const labelW = 40;   // label column width
    const rowH = 7.5;      // row height
    let tY = yOff + 45;

    function addRow(label: string, value: string, bg = true) {
      if (bg) {
        doc.setFillColor(235, 235, 235);
        doc.rect(tX, tY, labelW, rowH, 'FD');
      } else {
        doc.rect(tX, tY, labelW, rowH);
      }
      doc.rect(tX + labelW, tY, tW - labelW, rowH);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(label.toUpperCase(), tX + 3, tY + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(value?.toUpperCase() || "---", tX + labelW + 4, tY + 5.5);
      tY += rowH;
    }

    // VAQUEIRO
    addRow(`${puxador?.genero === "Masculino" ? "Vaqueiro" : "Vaqueira"} (Puxador)`, `${puxador?.apelido || puxador?.nomeCompleto.split(' ')[0]} - ${puxador?.nomeCompleto || "---"} `);
    
    // FILIAÇÃO VAQUEIRO
    const filiacaoV = `Pai: ${puxador?.nomePai || "---"} | Mãe: ${puxador?.nomeMae || "---"}`;
    addRow("Filiação Vaqueiro", filiacaoV, false);

    // IDADE E LOCALIDADE
    const localidade = `Idade: ${calcularIdade(puxador?.dataNascimento)} anos | Comunidade: ${puxador?.comunidade || "---"} | Cidade: ${puxador?.cidade || "---"}`;
    addRow("Info Vaqueiro", localidade, false);

    // ANIMAL
    const animalInfo = `Sexo: ${animalP?.sexo || "---"} | Nome: ${animalP?.nome || "---"} | Cor: ${animalP?.cor || "---"} | Raça: ${animalP?.raca || "---"}`;
    addRow("Animal (Puxador)", animalInfo);

    // PEDIGREE ANIMAL
    const pedigreeA = `Pai: ${animalP?.pai || "---"} | Mãe: ${animalP?.mae || "---"}`;
    addRow("Pedigree Animal", pedigreeA, false);

    // ATRIBUTOS ANIMAL
    const idadeAnimal = animalP?.dataNascimento ? `${calcularIdade(animalP.dataNascimento)} anos` : "n/a";
    const pesoAnimal = animalP?.peso ? `${animalP.peso} kg` : "n/a";
    const valorAnimal = animalP?.valorReal ? `R$ ${animalP.valorReal.toLocaleString('pt-BR')}` : "n/a";
    const atributosA = `Idade: ${idadeAnimal} | Peso: ${pesoAnimal} | Valor: ${valorAnimal}`;
    addRow("Atributos Animal", atributosA, false);

    // ESTEIREIRO
    addRow("Esteireiro", esteira?.nomeCompleto || "---");

    // --- CLASSIFICAÇÃO ---
    const boxSize = 12;
    const boxGap = 5;
    const classLabelW = 35;
    const classY = tY + 8;

    doc.setFillColor(235, 235, 235);
    doc.rect(tX, classY, classLabelW, boxSize, 'FD');
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("CLASSIFICAÇÃO", tX + 2, classY + 7);

    for (let i = 0; i < 5; i++) {
      const bx = tX + classLabelW + 10 + i * (boxSize + boxGap);
      doc.rect(bx, classY, boxSize, boxSize);
    }

    // --- DISPUTA ---
    const dispY = classY + boxSize + 6;
    doc.setFillColor(235, 235, 235);
    doc.rect(tX, dispY, classLabelW, boxSize, 'FD');
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("DISPUTA", tX + 2, dispY + 7);

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
const verIdade = (dataNasc: string): number => {
  if (!dataNasc) return 0;
  const [year, month, day] = dataNasc.split('-').map(Number);
  const nasc = new Date(year, month - 1, day);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}
async function autorizacaoMenor(senha: any) {
  const puxador = data.vaqueiros.find(v => v.id === senha.puxadorId);
  if (!puxador) { alert('Puxador não encontrado.'); return; }
  if (!puxador.responsavelId) { alert('Este vaqueiro não possui um responsável vinculado. Cadastre o responsável na página de Vaqueiros.'); return; }

  const resp = data.vaqueiros.find(v => v.id === puxador.responsavelId);
  if (!resp) { alert('Responsável não encontrado no cadastro.'); return; }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = 210;
  const mx = 15;
  const cw = pw - 2 * mx;

  const logoEsquerdo = await getBase64FromUrl("/brasao-lagoa.jpg").catch(()=>null); 
  const logoDireito = await getBase64FromUrl("/logo-administracao.jpg").catch(()=>null);
  if (logoEsquerdo) {
    doc.addImage(logoEsquerdo, 'JPG', 10, 10, 25, 25); 
  }
  if (logoDireito) {
    doc.addImage(logoDireito, 'JPG', 160, 10, 40, 25);
  }

  // --- CABEÇALHO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PREFEITURA MUNICIPAL DE LAGOA DOS PATOS', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PRAÇA 31 DE MARÇO, 111 - CENTRO | TEL. (38) 3745-1239', 105, 20, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VAQUEJADA NACIONAL DE LAGOA DOS PATOS - 2026', pw / 2, 32, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('07 a 10 de maio - Parque de Vaquejada Pedro Pereira Durães', pw / 2, 37, { align: 'center' });

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
  doc.text('CATEGORIA MUNICIPAL DA VAQUEJA DE LAGOA DOS PATOS - 2026', pw / 2, 65, { align: 'center' });

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
  doc.text(resp.identidade.toUpperCase() || '---', mx + 128, y + 5.5);

  // --- TEXTO DE AUTORIZACAO ---
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const par1 = 'Pelo presente, autorizo a participacao do menor acima identificado como competidor (puxador) na VAQUEJADA NACIONAL DE LAGOA DOS PATOS, "CATEGORIA MUNICIPAL" que acontecera entre os dias 07 a 10 de maio de 2026, no Parque de Vaquejada Pedro Pereira Duraes.';
  const l1 = doc.splitTextToSize(par1, cw);
  doc.text(l1, mx, y);

  y += l1.length * 5 + 4;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(9);
  const par2 = `Eu, ${resp.nomeCompleto.toUpperCase()}, portador do CPF ${resp.cpf}, declaro que a participacao e efetuada por livre e espontanea vontade do menor ${puxador.nomeCompleto.toUpperCase()} e que este nao tem qualquer contraindicacao para a pratica da atividade (vaquejada) e que assumo, integralmente, a responsabilidade pelos riscos que envolvem a participacao do referido menor neste evento, bem como por sua integridade fisica e moral e pelo teor das informacoes acima descritas. Declaro, ainda, que estou ciente dos riscos envolvidos nesta modalidade, sendo assim, em hipotese alguma, responsabilizarei seus organizadores, nem outras instituicoes e pessoas, por acidentes, incidentes e possiveis consequencias que possam ocorrer em funcao da participacao do menor na Vaquejada Nacional de Lagoa dos Patos, categoria Municipal.`;
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
  doc.text('Responsável: ' + resp.nomeCompleto.toUpperCase() + ' - ' + resp.cpf, pw / 2, y + 5, { align: 'center' });

  y += 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('* Anexar copia de documento do responsavel', mx + 10, y);

  doc.save('autorizacao_menor_' + (puxador.nomeCompleto || senha.numero) + '.pdf');
}

async function imprimirMapaSenhas() {
  if (!selectedLote) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });
 
  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 10;
  const marginY = 10;
  const colCount = 5;
  const rowCount = 4;
  
  const colWidth = (pageWidth - 2 * marginX) / colCount;
  const rowHeight = (pageHeight - marginY - 45) / rowCount;

  const logoEsquerdo = await getBase64FromUrl("/brasao-lagoa.jpg").catch(()=>null); 
  const logoDireito = await getBase64FromUrl("/logo-administracao.jpg").catch(()=>null);
  
  let currentSenhaIndex = 0;
  
  while (currentSenhaIndex < filteredSenhas.length || currentSenhaIndex === 0) {
    if (currentSenhaIndex > 0) {
      doc.addPage();
    }

    if (logoEsquerdo) {
      doc.addImage(logoEsquerdo, 'JPG', 10, 5, 20, 20); 
    }
    if (logoDireito) {
      doc.addImage(logoDireito, 'JPG', pageWidth - 40, 5, 30, 20);
    }
    
    // Cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PREFEITURA MUNICIPAL DE LAGOA DOS PATOS", pageWidth / 2, 12, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PRAÇA 31 DE MARÇO, 111 - CENTRO | TEL. (38) 3426-0398", pageWidth / 2, 17, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(50, 20, pageWidth - 50, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("VAQUEJADA NACIONAL DE LAGOA DOS PATOS - 2026", pageWidth / 2, 26, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("07 a 10 de maio - Parque de Vaquejada Pedro Pereira Durães", pageWidth / 2, 31, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("MAPA DE SENHAS - CATEGORIA MUNICIPAL", pageWidth / 2, 37, { align: "center" });
    
    const startY = 42;
    
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const cellX = marginX + c * colWidth;
        const cellY = startY + r * rowHeight;
        const centerX = cellX + colWidth / 2;
        
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        
        if (currentSenhaIndex < filteredSenhas.length) {
            const senha = filteredSenhas[currentSenhaIndex];
            const puxador = data.vaqueiros.find((v: any) => v.id === senha.puxadorId);
            const animalP = data.animais.find((a: any) => a.id === senha.animalPuxadorId);
            
            doc.rect(cellX, cellY, colWidth, rowHeight);
            
            doc.setFontSize(28);
            doc.setFont("helvetica", "bold");
            doc.text(`${senha.numero}`, centerX, cellY + 13, { align: "center" });
            
            doc.line(cellX, cellY + 18, cellX + colWidth, cellY + 18);
            
            if (puxador) {
                let yOffset = cellY + 23;
                
                const words = (puxador.apelido || "").toUpperCase().split(" ");
                const shortName = words.length > 2 ? `${words[0]} ${words[words.length - 1]}` : words.join(" ");
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(shortName.substring(0, 25), centerX, yOffset, { align: "center" });
                yOffset += 4.5;
                
                doc.setFontSize(8);
                const line2 = puxador.nomeCompleto;
                if (line2) {
                    doc.text(line2, centerX, yOffset, { align: "center" });
                    yOffset += 4.5;
                }

                if (puxador.dataNascimento) {
                    doc.text(verIdade(puxador.dataNascimento) + " anos", centerX, yOffset, { align: "center" });
                    yOffset += 6;
                }
                
                if (animalP) {
                    doc.setFont("helvetica", "italic");
                    const animalNome = animalP.nome.toUpperCase().substring(0, 16);
                    doc.text(`${animalNome}`, centerX, yOffset, { align: "center" });
                }
            } else {
                doc.setFillColor(220, 220, 220);
                doc.rect(cellX, cellY + 18, colWidth, rowHeight - 18, 'F');
                doc.rect(cellX, cellY + 18, colWidth, rowHeight - 18);
            }
        } else {
            doc.setFillColor(240, 240, 240);
            doc.rect(cellX, cellY, colWidth, rowHeight, 'FD');
        }
        
        currentSenhaIndex++;
      }
    }
    
    if (currentSenhaIndex >= filteredSenhas.length) break;
  }
  
  doc.save(`mapa_senhas_${selectedLote?.inicio}_ate_${selectedLote?.fim}.pdf`);
}

async function imprimirSenhas() {
  if (!selectedLote) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
 
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoEsquerdo = await getBase64FromUrl("/brasao-lagoa.jpg").catch(()=>null); 
  const logoDireito = await getBase64FromUrl("/logo-administracao.jpg").catch(()=>null);
  
  const tableData = filteredSenhas.map(senha => {
    const puxador = data.vaqueiros.find((v: any) => v.id === senha.puxadorId);
    const animalP = data.animais.find((a: any) => a.id === senha.animalPuxadorId);
    
    return [
      `${senha.numero}.`,
      puxador?.nomeCompleto?.toUpperCase() || "",
      puxador?.apelido?.toUpperCase() || "",
      puxador?.dataNascimento ? `${verIdade(puxador.dataNascimento)}` : "",
      animalP?.nome?.toUpperCase() || "",
      animalP?.raca?.toUpperCase() || "",
      animalP?.cor?.toUpperCase() || ""
    ];
  });

  // @ts-ignore
  autoTable(doc, {
    startY: 55,
    head: [['SE.', 'NOME COMPLETO PUXADOR', 'APELIDO', 'ID', 'CAVALO', 'RAÇA', 'COR']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold', 
      halign: 'center',
      lineWidth: 0.2,
      lineColor: [0, 0, 0]
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 1.5, 
      valign: 'middle',
      font: 'helvetica',
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' }, // Nome Completo Puxador
      2: { cellWidth: 25 },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 15 }
    },
    margin: { top: 55, bottom: 20 },
    didDrawPage: (dataArg: any) => {
      // Header
      if (logoEsquerdo) {
        doc.addImage(logoEsquerdo, 'JPG', 10, 5, 20, 20); 
      }
      if (logoDireito) {
        doc.addImage(logoDireito, 'JPG', pageWidth - 40, 5, 35, 20);
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("PREFEITURA MUNICIPAL DE LAGOA DOS PATOS", pageWidth / 2, 12, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("PRAÇA 31 DE MARÇO, 111 – CENTRO | TEL. (38) 3745-1239", pageWidth / 2, 17, { align: "center" });
      
      doc.setLineWidth(0.5);
      doc.line(60, 22, pageWidth - 60, 22);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("VAQUEJADA NACIONAL DE LAGOA DOS PATOS - 2026", pageWidth / 2, 28, { align: "center" });
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("07 a 10 de maio – Parque de Vaquejada Pedro Pereira Durães", pageWidth / 2, 33, { align: "center" });
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("RELAÇÃO DE VAQUEIROS INSCRITOS", pageWidth / 2, 42, { align: "center" });
      
      doc.setFontSize(10);
      doc.text("CATEGORIA MUNICIPAL", pageWidth / 2, 47, { align: "center" });
      doc.line(pageWidth / 2 - 20, 48, pageWidth / 2 + 20, 48);

      // Footer
      const str = "* Para validação da inscrição (pela comissão), deverá ser anexada junto a esta ficha, cópia legível de documento (com foto) do competidor, ";
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(str, 15, doc.internal.pageSize.height - 10);
      doc.text('comprovante de endereço e título de eleitor.', 15, doc.internal.pageSize.height - 6);

    }
  });

  doc.save(`relatorio_senhas_${selectedLote.inicio}_ate_${selectedLote.fim}.pdf`);
}

async function gerarRelatorioSenhas() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoEsquerdo = await getBase64FromUrl("/brasao-lagoa.jpg").catch(()=>null); 
  const logoDireito = await getBase64FromUrl("/logo-administracao.jpg").catch(()=>null);

  const senhasVinculadas = data.senhas
    .filter(s => s.status === 'vinculado' && s.dataCadastro)
    .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());

  const totalHoje = senhasVinculadas.filter(s => {
    const d = new Date(s.dataCadastro);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === hoje.getTime();
  }).length;

  const totalSemana = senhasVinculadas.filter(s => new Date(s.dataCadastro) >= inicioSemana).length;
  const totalGeral = senhasVinculadas.length;

  // Header Function
  const drawHeader = () => {
    if (logoEsquerdo) doc.addImage(logoEsquerdo, 'JPG', 10, 5, 20, 20); 
    if (logoDireito) doc.addImage(logoDireito, 'JPG', pageWidth - 40, 5, 35, 20);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PREFEITURA MUNICIPAL DE LAGOA DOS PATOS", pageWidth / 2, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("RELATÓRIO DE CADASTROS POR DATA", pageWidth / 2, 18, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(60, 22, pageWidth - 60, 22);
  };

  drawHeader();

  // Summary Table
  // @ts-ignore
  autoTable(doc, {
    startY: 30,
    head: [['Período', 'Total de Vínculos']],
    body: [
      ['Hoje', totalHoje],
      ['Esta Semana', totalSemana],
      ['Total Geral', totalGeral]
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { halign: 'center' }
  });

  // Details Table
  const tableData = senhasVinculadas.map(s => {
    const puxador = data.vaqueiros.find(v => v.id === s.puxadorId);
    const animal = data.animais.find(a => a.id === s.animalPuxadorId);
    return [
      s.numero,
      puxador?.nomeCompleto?.toUpperCase() || '---',
      animal?.nome?.toUpperCase() || '---',
      new Date(s.dataCadastro).toLocaleString('pt-BR')
    ];
  });

  // @ts-ignore
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Nº', 'COMPETIDOR', 'ANIMAL', 'DATA/HORA VÍNCULO']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [31, 41, 55] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40 },
      3: { cellWidth: 45, halign: 'center' }
    }
  });

  doc.save(`relatorio_cadastros_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Derived: check if selected puxador is minor without responsible
let puxadorMenorSemResponsavel = $derived(() => {
  if (!puxadorId) return false;
  const pux = data.vaqueiros.find(v => v.id === puxadorId);
  if (!pux || !pux.dataNascimento) return false;
  const [year, month, day] = pux.dataNascimento.split('-').map(Number);
  const nasc = new Date(year, month - 1, day);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  if (idade >= 18) return false;
  return !pux.responsavelId;
});
let verLoad = $state(false)
let novasSenhas = $state(false)
</script>

<Loading show={verLoad} />

<div class="senhas-page">
  <div>
    <h1>Gestão de Senhas</h1>
    <p>Gere sequências de números e vincule-os aos competidores.</p>
     <button class="text-2xl cursor-pointer bg-green-900/50 backdrop-blur-md  p-2 rounded-full border border-white/10 shadow-2xl w-fit" onclick={() => novasSenhas = !novasSenhas}>✚</button>
  </div>
  <header class="page-header">
 

  {#if novasSenhas}
  
    <form 
  method="POST" 
  action="?/gerar" 
  use:enhance={() => {
    
      verLoad = true;

    return async ({ update }) => {
      // 2. Quando a resposta chegar do servidor, o update() atualiza os dados da página
      await update();
      window.location.reload();
      // 3. Desligamos o loading
      verLoad = false;
    };
    
  }}
  class="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl max-w-2xl"
>
  <div class="flex flex-col sm:flex-row items-end gap-4">
    
    <div class="flex-1 w-full">
      <label for="inicio" class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
        Início
      </label>
      <input 
        type="number" 
        id="inicio"
        maxlength="5"
        name="inicio" 
        placeholder="001" 
        class="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 
               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all
               placeholder:text-slate-600" 
        required 
      />
    </div>

    <div class="flex-1 w-full">
      <label for="fim" class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
        Fim
      </label>
      <input 
        type="number" 
        id="fim"
        maxlength="5"
        name="fim" 
        placeholder="100" 
        class="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 
               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all
               placeholder:text-slate-600" 
        required 
      />
    </div>

    <div class="flex-1 w-full">
      <label for="data" class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
        Data do Evento
      </label>
      <input 
        type="date" 
        id="data"
        name="data" 
        class="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 
               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all
               [color-scheme:dark]" 
        required 
      />
    </div>

    <button 
      type="submit" 
      class="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl
             shadow-lg shadow-indigo-900/20 transition-all duration-300 active:scale-95 whitespace-nowrap"
    >
      Gerar Sequência
    </button>

  </div>
</form>
{/if}
    <!-- <form method="POST" action="?/gerar" use:enhance = (update)=>{

      update()
    } >
    class="generator-form">
      <div class="input-row">
        <input type="number" name="inicio" placeholder="De" class="premium-input" required />
        <input type="number" name="fim" placeholder="Até" class="premium-input" required />
        <input type="date" name="data" class="premium-input" required />
      </div>
      <button type="submit" class="premium-button">Gerar Sequência</button>
    </form> -->
  </header>

  {#if !selectedLote}
    <div class="lotes-section">
      <h3>Sequências Geradas</h3>
      <div class="lotes-list">
        {#each data.lotes as lote}
          <div class="relative group">
            <button class="lote-link premium-card w-full" onclick={() => selectedLote = lote}>
              <div class="lote-info">
                <span class="lote-title">Sequência #{lote.inicio} ao #{lote.fim}</span>
                <span class="lote-date">Competição: {lote.dataCompeticao}</span>
              </div>
              <span class="lote-arrow mr-10">Ver Senhas →</span>
            </button>
            
            <form 
              method="POST" 
              action="?/removerLote" 
              use:enhance={() => {
                if (!confirm(`Tem certeza que deseja APAGAR toda a sequência #${lote.inicio}-${lote.fim}?\n\nIsso removerá todas as senhas geradas para este lote.`)) return;
                verLoad = true;
                return async ({ update }) => {
                  await update();
                  verLoad = false;
                };
              }}
              class="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            >
              <input type="hidden" name="loteId" value={lote.id} />
              <button 
                type="submit" 
                class="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                title="Apagar Sequência"
                onclick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            </form>
          </div>
        {:else}
          <div class="empty-state">Nenhuma sequência gerada ainda.</div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="batch-detail-header">
        <button class="premium-button secondary" onclick={() => selectedLote = null}>← Voltar</button>
        <h2>Sequência #{selectedLote.inicio} - #{selectedLote.fim} ({selectedLote.dataCompeticao})</h2>
        <div class="header-actions flex gap-5">
          <button class="premium-button secondary" onclick={imprimirMapaSenhas}>Mapa</button>
          <button class="premium-button terciary" onclick={imprimirSenhas}>Relatório</button>
          <button class="premium-button secondary" onclick={gerarRelatorioSenhas} title="Relatório de Cadastros por Data">
            📊 Cadastros
          </button>
        </div>
    </div>

    <div class="flex flex-wrap gap-6 p-6 bg-slate-950 min-h-screen justify-between">
  {#each filteredSenhas as senha}
    {@const puxador = data?.vaqueiros?.find(v => v.id === senha?.puxadorId)}
    {@const isMenor = () => {
      if(!puxador?.dataNascimento) return false;
      const [year, month, day] = puxador.dataNascimento.split('-').map(Number);
      const nasc = new Date(year, month - 1, day);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
      return idade < 18;
    }}

    <div class="group relative w-full sm:w-[300px]">
      <div
        class="w-full relative overflow-hidden transition-all duration-500 border rounded-2xl p-5
               {senha.status === 'vinculado' 
                ? 'border-emerald-500/30 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.3)] bg-gradient-to-br from-emerald-900 to-slate-900' 
                : 'border-slate-800 bg-white/5 backdrop-blur-sm border-dashed hover:border-emerald-500/50'}"
      >
        <div class="absolute top-4 right-4">
          <span class="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border
            {senha.status === 'vinculado' 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-slate-800 text-slate-400 border-slate-700'}">
            {senha.status === 'vinculado' ? 'Ocupada' : 'Livre'}
          </span>
        </div>

        <button 
          onclick={() => openLinkModal(senha)}
          class="w-full text-left mb-6 cursor-pointer "
        >
          <div class="flex items-center gap-4">
            <div class="flex flex-col items-center justify-center min-w-[65px] h-[65px] rounded-2xl 
              {senha.status === 'vinculado' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                : 'bg-slate-800 text-slate-500'} 
              group-hover:scale-110 transition-transform duration-300">
              <span class="text-[9px] uppercase font-black opacity-70">Senha</span>
              <span class="text-2xl font-black">{senha.numero}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-0.5">
                {puxador ? 'Competidor' : 'Status'}
              </p>
              <h3 class="text-xl font-bold text-white truncate leading-tight">
                {puxador?.apelido || 'Disponível'}
              </h3>
              {#if puxador}
                <p class="text-[11px] text-slate-400 truncate mt-1 font-medium italic">
                  {puxador.nomeCompleto.toUpperCase()}
                </p>
              {/if}
            </div>
          </div>
        </button>

        {#if senha.status === 'vinculado'}
          <div class="pt-4 border-t border-white/5 relative">
            <div class="flex justify-between items-center mb-3">
              <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0">Documentação</p>
              
              <form 
                method="POST" 
                action="?/desvincular" 
                 use:enhance={() => {
    
      verLoad = true;

    return async ({ update }) => {
      // 2. Quando a resposta chegar do servidor, o update() atualiza os dados da página
      await update();
      window.location.reload();
      // 3. Desligamos o loading
      verLoad = false;
    };
    
  }}
              >
                <input type="hidden" name="id" value={senha.id} />
                <button 
                  type="submit" 
                  title="Resetar e Limpar Senha"
                  class="flex items-center justify-center p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 rounded-lg transition-all duration-300 hover:text-white"
                  onclick={(e) => { e.stopPropagation(); if (!confirm('Tem certeza que deseja limpar esta senha e torná-la disponível novamente?')) e.preventDefault(); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              </form>
            </div>
            <div class="grid {isMenor() ? 'grid-cols-3' : 'grid-cols-2'} gap-3">
              
              <button 
                title="Ficha de Inscrição"
                class="flex items-center justify-center py-2.5 bg-white/5 hover:bg-indigo-600 rounded-xl transition-all duration-300 group/btn shadow-inner border border-white/5"
                onclick={(e) => { e.stopPropagation(); printVoucher(senha); }}>
                <span class="text-lg group-hover/btn:scale-125 transition-transform">📝</span>
              </button>

              <button 
                title="Senha para Juízes"
                class="flex items-center justify-center py-2.5 bg-white/5 hover:bg-amber-500 rounded-xl transition-all duration-300 group/btn shadow-inner border border-Fwhite/5"
                onclick={(e) => { e.stopPropagation(); senhaJuizes(senha); }}>
                <span class="text-lg group-hover/btn:scale-125 transition-transform">⚖️</span>
              </button>

              {#if isMenor()}
                <button 
                  title="Autorização de Menor"
                  class="flex items-center justify-center py-2.5 bg-white/5 hover:bg-emerald-500 rounded-xl transition-all duration-300 group/btn shadow-inner border border-white/5"
                  onclick={(e) => { e.stopPropagation(); autorizacaoMenor(senha); }}>
                  <span class="text-lg group-hover/btn:scale-125 transition-transform">📜</span>
                </button>
              {/if}

            </div>
          </div>
        {:else}
          <div class="mt-2 py-4 text-center border-t border-white/5">
             <span class="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">
               Aguardando Vínculo
             </span>
             <span class="text-[9px] text-slate-700 italic">liberação automática de docs</span>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

    <!-- <div class="flex flex-wrap gap-6 p-4">
  {#each filteredSenhas as senha}
    {@const puxador = data?.vaqueiros?.find(v => v.id === senha?.puxadorId)}
    {@const isMenor = () =>{
      if(!puxador?.dataNascimento) return false;
      const [year, month, day] = puxador.dataNascimento.split('-').map(Number);
      const nasc = new Date(year, month - 1, day);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
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
      {/each}-->
<!-- </div> -->
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
          verLoad = true;
          
          if (result.type === 'success') {
            await invalidateAll();
            // Find the updated senha in the new data
            const updated = data.senhas.find(s => s.id === selectedSenha.id);
            if (updated) {
              selectedSenha = updated;
              verLoad = false;
              // window.location.reload();
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
  .page-header {  justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 2px; border-radius: 1rem; border: 1px solid var(--border-glass); }
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
  .premium-button.terciary { background: rgba(7, 173, 48, 0.61); border: 1px solid rgba(255,255,255,0.2); }
  .premium-button.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
</style>
