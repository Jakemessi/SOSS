const { jsPDF } = window.jspdf;

const PDF_LAYOUT = Object.freeze({
    margemEsquerda: 20,
    margemDireita: 190,
    larguraUtil: 170,
    limiteInferior: 268,
    alturaLinha: 6
});

const CHAVE_CONTADOR = 'soss.ultimoNumero';

function obterUltimoNumero() {
    const valorAtual = localStorage.getItem(CHAVE_CONTADOR);
    const valorAntigo = localStorage.getItem('id');
    const valorSalvo = valorAtual ?? valorAntigo;

    if (valorSalvo === null) {
        return 0;
    }

    const numero = Number(valorSalvo);

    if (!Number.isSafeInteger(numero) || numero < 0) {
        return 0;
    }

    // Migra automaticamente o contador antigo para a nova chave.
    if (valorAtual === null) {
        localStorage.setItem(CHAVE_CONTADOR, String(numero));
        localStorage.removeItem('id');
    }

    return numero;
}

function salvarUltimoNumero(numero) {
    localStorage.setItem(CHAVE_CONTADOR, String(numero));
}

function atualizarIndicadorProximaOS() {
    const indicador = document.getElementById('proxima-os');

    if (indicador) {
        indicador.textContent =
            `Próxima Ordem de Serviço: Nº ${obterUltimoNumero() + 1}`;
    }
}

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

    const id = obterUltimoNumero() + 1;

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

    salvarUltimoNumero(id);
    atualizarIndicadorProximaOS();
}

function definirProximoId() {
    const ultimoNumero = obterUltimoNumero();
    const proximoAtual = ultimoNumero + 1;

    const novoId = prompt(
        'Digite o número da próxima Ordem de Serviço:',
        proximoAtual
    );

    if (novoId === null) {
        return;
    }

    const texto = novoId.trim();

    if (!/^\d+$/.test(texto)) {
        alert('Digite um número inteiro válido!');
        return;
    }

    const numero = Number(texto);

    if (!Number.isSafeInteger(numero) || numero <= 0) {
        alert('Digite um número inteiro maior que zero!');
        return;
    }

    if (numero <= ultimoNumero) {
        const confirmado = confirm(
            `A última OS registrada foi a Nº ${ultimoNumero}.\n\n` +
            `Definir a próxima como Nº ${numero} pode gerar números repetidos.\n\n` +
            'Deseja continuar mesmo assim?'
        );

        if (!confirmado) {
            return;
        }
    }

    salvarUltimoNumero(numero - 1);
    atualizarIndicadorProximaOS();

    alert(`A próxima Ordem de Serviço será a Nº ${numero}.`);
}

function criarNomeArquivoBackup() {
    const dataHora = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', '_')
        .replace(/:/g, '-');

    return `Backup SOSS - ${dataHora}.json`;
}

function exportarBackup() {
    const backup = {
        aplicacao: 'SOSS',
        versao: 1,
        exportadoEm: new Date().toISOString(),
        ultimoNumero: obterUltimoNumero()
    };

    const conteudo = JSON.stringify(backup, null, 4);

    const arquivo = new Blob(
        [conteudo],
        { type: 'application/json;charset=utf-8' }
    );

    const enderecoTemporario = URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    link.href = enderecoTemporario;
    link.download = criarNomeArquivoBackup();

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(enderecoTemporario);
    }, 1000);
}

function selecionarBackup() {
    const seletor = document.getElementById('arquivo-backup');

    seletor.value = '';
    seletor.click();
}

function validarBackup(backup) {
    return (
        backup !== null &&
        typeof backup === 'object' &&
        backup.aplicacao === 'SOSS' &&
        backup.versao === 1 &&
        Number.isSafeInteger(backup.ultimoNumero) &&
        backup.ultimoNumero >= 0
    );
}

async function importarBackup(evento) {
    const arquivo = evento.target.files[0];

    if (!arquivo) {
        return;
    }

    try {
        const conteudo = await arquivo.text();
        const backup = JSON.parse(conteudo);

        if (!validarBackup(backup)) {
            throw new Error('Estrutura de backup inválida.');
        }

        const ultimoNumeroAtual = obterUltimoNumero();
        const proximoNumeroBackup = backup.ultimoNumero + 1;

        let mensagem =
            `O backup possui como última OS a Nº ${backup.ultimoNumero}.\n` +
            `Após a importação, a próxima será a Nº ${proximoNumeroBackup}.\n\n`;

        if (backup.ultimoNumero < ultimoNumeroAtual) {
            mensagem +=
                `A numeração atual está na OS Nº ${ultimoNumeroAtual}.\n` +
                'Importar este backup pode provocar números repetidos.\n\n';
        }

        mensagem += 'Deseja importar este backup?';

        if (!confirm(mensagem)) {
            return;
        }

        salvarUltimoNumero(backup.ultimoNumero);
        atualizarIndicadorProximaOS();

        alert(
            `Backup importado com sucesso!\n` +
            `A próxima Ordem de Serviço será a Nº ${proximoNumeroBackup}.`
        );
    } catch (erro) {
        console.error('Erro ao importar backup:', erro);

        alert(
            'Não foi possível importar o backup. ' +
            'Verifique se o arquivo pertence ao SOSS e não foi alterado.'
        );
    } finally {
        evento.target.value = '';
    }
}

document
    .getElementById('arquivo-backup')
    .addEventListener('change', importarBackup);

atualizarIndicadorProximaOS();