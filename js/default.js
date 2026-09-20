const { jsPDF } = window.jspdf;

const PDF_LAYOUT = Object.freeze({
    margemEsquerda: 20,
    margemDireita: 190,
    larguraUtil: 170,
    limiteInferior: 268,
    alturaLinha: 6
});

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function adicionarCabecalhoPrincipal(doc, id, data) {
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Ordem de Serviço Simplificada', PDF_LAYOUT.margemEsquerda, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nº: ${id}`, PDF_LAYOUT.margemDireita, 20, { align: 'right' });
    doc.text(
        `Data: ${formatarData(data)}`,
        PDF_LAYOUT.margemDireita,
        26,
        { align: 'right' }
    );

    doc.line(
        PDF_LAYOUT.margemEsquerda,
        30,
        PDF_LAYOUT.margemDireita,
        30
    );
}

function adicionarCabecalhoContinuacao(doc, id) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(
        `Ordem de Serviço Nº ${id} — continuação`,
        PDF_LAYOUT.margemEsquerda,
        20
    );

    doc.line(
        PDF_LAYOUT.margemEsquerda,
        26,
        PDF_LAYOUT.margemDireita,
        26
    );
}

function garantirEspaco(doc, y, alturaNecessaria, id) {
    if (y + alturaNecessaria <= PDF_LAYOUT.limiteInferior) {
        return y;
    }

    doc.addPage();
    adicionarCabecalhoContinuacao(doc, id);

    return 38;
}

function escreverCampo(doc, rotulo, valor, y, id) {
    const xRotulo = PDF_LAYOUT.margemEsquerda;
    const xValor = 43;
    const larguraValor = PDF_LAYOUT.margemDireita - xValor;
    const linhas = doc.splitTextToSize(valor, larguraValor);

    y = garantirEspaco(doc, y, PDF_LAYOUT.alturaLinha, id);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(rotulo, xRotulo, y);

    linhas.forEach((linha, indice) => {
        if (indice > 0) {
            y = garantirEspaco(
                doc,
                y,
                PDF_LAYOUT.alturaLinha,
                id
            );
        }

        doc.setFont(undefined, 'normal');
        doc.text(linha, xValor, y);
        y += PDF_LAYOUT.alturaLinha;
    });

    return y + 2;
}

function escreverLinhasPaginadas(doc, linhas, y, id, estilo = 'normal') {
    linhas.forEach((linha) => {
        y = garantirEspaco(
            doc,
            y,
            PDF_LAYOUT.alturaLinha,
            id
        );

        doc.setFontSize(11);
        doc.setFont(undefined, estilo);
        doc.text(linha || ' ', PDF_LAYOUT.margemEsquerda, y);

        y += PDF_LAYOUT.alturaLinha;
    });

    return y;
}

function adicionarRodapes(doc) {
    const totalPaginas = doc.getNumberOfPages();

    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        doc.setPage(pagina);

        doc.setDrawColor(150);
        doc.line(
            PDF_LAYOUT.margemEsquerda,
            276,
            PDF_LAYOUT.margemDireita,
            276
        );

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80);

        doc.text(
            'Documento gerado automaticamente pelo SOSS',
            PDF_LAYOUT.margemEsquerda,
            283
        );

        doc.text(
            `Página ${pagina} de ${totalPaginas}`,
            PDF_LAYOUT.margemDireita,
            283,
            { align: 'right' }
        );
    }

    doc.setTextColor(0);
}

function gerarPDF() {
    const modelo = document.getElementById('modelo').value.trim();
    const codigo = document.getElementById('codigo').value.trim();
    const setor = document.getElementById('setor').value.trim();
    const data = document.getElementById('data').value;
    const acao = document.getElementById('acao').value.trim();
    const desc = document.getElementById('desc').value.trim();

    if (!modelo || !codigo || !setor || !data || !acao || !desc) {
        alert('Preencha todos os campos!');
        return;
    }

    let id = localStorage.getItem('id');
    id = id ? parseInt(id, 10) + 1 : 1;
    localStorage.setItem('id', id);

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    doc.setProperties({
        title: `Ordem de Serviço ${id}`,
        subject: acao,
        author: 'SOSS',
        creator: 'SOSS'
    });

    adicionarCabecalhoPrincipal(doc, id, data);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(
        'DADOS DO SERVIÇO',
        PDF_LAYOUT.margemEsquerda,
        45
    );

    doc.line(
        PDF_LAYOUT.margemEsquerda,
        50,
        PDF_LAYOUT.margemDireita,
        50
    );

    let y = 62;

    y = escreverCampo(doc, 'Modelo:', modelo, y, id);
    y = escreverCampo(doc, 'Código:', codigo, y, id);
    y = escreverCampo(doc, 'Setor:', setor, y, id);

    y = garantirEspaco(doc, y, 22, id);

    doc.line(
        PDF_LAYOUT.margemEsquerda,
        y,
        PDF_LAYOUT.margemDireita,
        y
    );

    y += 15;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DESCRIÇÃO', PDF_LAYOUT.margemEsquerda, y);

    y += 5;

    doc.line(
        PDF_LAYOUT.margemEsquerda,
        y,
        PDF_LAYOUT.margemDireita,
        y
    );

    y += 12;

    const linhasAcao = doc.splitTextToSize(
        acao,
        PDF_LAYOUT.larguraUtil
    );

    y = escreverLinhasPaginadas(
        doc,
        linhasAcao,
        y,
        id,
        'bold'
    );

    y += 4;

    const linhasDescricao = doc.splitTextToSize(
        desc,
        PDF_LAYOUT.larguraUtil
    );

    escreverLinhasPaginadas(
        doc,
        linhasDescricao,
        y,
        id
    );

    adicionarRodapes(doc);

    doc.save(`Ordem de Serviço ${id} - ${data}.pdf`);
}

function resetarContador() {
    if (confirm('Tem certeza que deseja resetar o contador?')) {
        localStorage.removeItem('id');
        alert('Contador resetado!');
    }
}

function definirProximoId() {
    const novoId = prompt('Digite o número da próxima OS:');

    if (novoId === null) {
        return;
    }

    const numero = parseInt(novoId, 10);

    if (isNaN(numero) || numero <= 0) {
        alert('Digite um número válido!');
        return;
    }

    localStorage.setItem('id', numero - 1);
    alert(`O número da próxima OS será ${numero}.`);
}