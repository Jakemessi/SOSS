const { jsPDF } = window.jspdf;

const PDF_LAYOUT = Object.freeze({
    margemEsquerda: 20,
    margemDireita: 190,
    larguraUtil: 170,
    limiteInferior: 268,
    alturaLinha: 6
});

const CHAVE_CONTADOR = 'soss.ultimoNumero';
const CHAVE_HISTORICO = 'soss.historico';
const CHAVE_RASCUNHO = 'soss.rascunho';

const CAMPOS_RASCUNHO = Object.freeze([
    'modelo',
    'codigo',
    'setor',
    'data',
    'acao',
    'desc'
]);

function obterCamposRascunho() {
    return CAMPOS_RASCUNHO
        .map((id) => document.getElementById(id))
        .filter((campo) => campo !== null);
}

function salvarRascunho() {
    const rascunho = {};

    obterCamposRascunho().forEach((campo) => {
        rascunho[campo.id] = campo.value;
    });

    const possuiConteudo = Object.values(rascunho).some(
        (valor) => valor.trim() !== ''
    );

    try {
        if (possuiConteudo) {
            localStorage.setItem(
                CHAVE_RASCUNHO,
                JSON.stringify(rascunho)
            );
        } else {
            localStorage.removeItem(CHAVE_RASCUNHO);
        }
    } catch (erro) {
        console.error('Não foi possível salvar o rascunho:', erro);
    }
}

function removerRascunho() {
    try {
        localStorage.removeItem(CHAVE_RASCUNHO);
    } catch (erro) {
        console.error('Não foi possível remover o rascunho:', erro);
    }
}

function restaurarRascunho() {
    let conteudo;

    try {
        conteudo = localStorage.getItem(CHAVE_RASCUNHO);
    } catch (erro) {
        console.error('Não foi possível acessar o rascunho:', erro);
        return;
    }

    if (conteudo === null) {
        return;
    }

    try {
        const rascunho = JSON.parse(conteudo);

        if (
            rascunho === null ||
            typeof rascunho !== 'object' ||
            Array.isArray(rascunho)
        ) {
            throw new Error('Formato de rascunho inválido.');
        }

        obterCamposRascunho().forEach((campo) => {
            const valorSalvo = rascunho[campo.id];

            if (typeof valorSalvo === 'string') {
                campo.value = valorSalvo;
            }
        });
    } catch (erro) {
        console.warn('O rascunho salvo era inválido e foi removido:', erro);
        removerRascunho();
    }
}

function limparCamposFormulario() {
    obterCamposRascunho().forEach((campo) => {
        campo.value = '';
    });

    removerRascunho();
}

function limparFormulario() {
    const campos = obterCamposRascunho();
    const possuiConteudo = campos.some(
        (campo) => campo.value.trim() !== ''
    );

    if (
        possuiConteudo &&
        !confirm(
            'Limpar todos os campos preenchidos?\n\n' +
            'A numeração e o histórico não serão alterados.'
        )
    ) {
        return;
    }

    limparCamposFormulario();

    document.getElementById('modelo')?.focus();
}

function inicializarRascunho() {
    restaurarRascunho();

    obterCamposRascunho().forEach((campo) => {
        campo.addEventListener('input', salvarRascunho);
    });
}

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

function validarRegistroOrdem(ordem) {
    const camposTexto = [
        'modelo',
        'codigo',
        'setor',
        'data',
        'resumo',
        'descricao',
        'geradaEm'
    ];

    return (
        ordem !== null &&
        typeof ordem === 'object' &&
        Number.isSafeInteger(ordem.numero) &&
        ordem.numero > 0 &&
        camposTexto.every((campo) => typeof ordem[campo] === 'string')
    );
}

function obterHistorico() {
    const conteudo = localStorage.getItem(CHAVE_HISTORICO);

    if (conteudo === null) {
        return [];
    }

    try {
        const historico = JSON.parse(conteudo);

        if (!Array.isArray(historico)) {
            throw new Error('O histórico salvo não é uma lista.');
        }

        return historico.filter(validarRegistroOrdem);
    } catch (erro) {
        console.error('Erro ao carregar histórico:', erro);
        return [];
    }
}

function salvarHistorico(historico) {
    localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify(historico)
    );
}

function numeroJaRegistrado(numero) {
    return obterHistorico().some(
        (ordem) => ordem.numero === numero
    );
}

function registrarOrdem(ordem) {
    const historico = obterHistorico();

    if (historico.some((item) => item.numero === ordem.numero)) {
        throw new Error(
            `A Ordem de Serviço Nº ${ordem.numero} já está registrada.`
        );
    }

    historico.unshift(ordem);
    salvarHistorico(historico);
}

function criarCelula(texto) {
    const celula = document.createElement('td');
    celula.textContent = texto;

    return celula;
}

function criarBotaoReemissao(ordem) {
    const botao = document.createElement('button');

    botao.type = 'button';
    botao.className = 'botao-secundario';
    botao.textContent = 'Baixar PDF';
    botao.title = `Baixar novamente a OS Nº ${ordem.numero}`;

    botao.addEventListener('click', () => {
        gerarPDF(ordem);
    });

    return botao;
}

function atualizarHistorico() {
    const historico = obterHistorico()
        .sort((ordemA, ordemB) => ordemB.numero - ordemA.numero);

    const totalOrdens = document.getElementById('total-ordens');
    const mensagemVazia = document.getElementById('historico-vazio');
    const tabela = document.getElementById('tabela-historico');
    const corpo = document.getElementById('corpo-historico');

    const quantidade = historico.length;

    totalOrdens.textContent =
        quantidade === 1
            ? '1 ordem registrada'
            : `${quantidade} ordens registradas`;

    mensagemVazia.hidden = quantidade > 0;
    tabela.hidden = quantidade === 0;

    corpo.replaceChildren();

    const linhas = document.createDocumentFragment();

    historico.forEach((ordem) => {
        const linha = document.createElement('tr');

        const celulaAcoes = document.createElement('td');
        celulaAcoes.appendChild(criarBotaoReemissao(ordem));

        linha.append(
            criarCelula(ordem.numero),
            criarCelula(formatarData(ordem.data)),
            criarCelula(ordem.modelo),
            criarCelula(ordem.codigo),
            criarCelula(ordem.setor),
            celulaAcoes
        );

        linhas.appendChild(linha);
    });

    corpo.appendChild(linhas);
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

function gerarPDF(ordemExistente = null) {
    const reemissao = ordemExistente !== null;

    let modelo;
    let codigo;
    let setor;
    let data;
    let acao;
    let desc;
    let id;

    if (reemissao) {
        if (!validarRegistroOrdem(ordemExistente)) {
            alert('Não foi possível gerar novamente esta Ordem de Serviço.');
            return;
        }

        modelo = ordemExistente.modelo;
        codigo = ordemExistente.codigo;
        setor = ordemExistente.setor;
        data = ordemExistente.data;
        acao = ordemExistente.resumo;
        desc = ordemExistente.descricao;
        id = ordemExistente.numero;
    } else {
        modelo = document.getElementById('modelo').value.trim();
        codigo = document.getElementById('codigo').value.trim();
        setor = document.getElementById('setor').value.trim();
        data = document.getElementById('data').value;
        acao = document.getElementById('acao').value.trim();
        desc = document.getElementById('desc').value.trim();

        if (!modelo || !codigo || !setor || !data || !acao || !desc) {
            alert('Preencha todos os campos!');
            return;
        }

        id = obterUltimoNumero() + 1;

        if (numeroJaRegistrado(id)) {
            alert(
                `A Ordem de Serviço Nº ${id} já existe no histórico.\n\n` +
                'Defina outro número antes de gerar o PDF.'
            );

            return;
        }
    }

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

    if (reemissao) {
        return;
    }

    salvarUltimoNumero(id);

    try {
        registrarOrdem({
            numero: id,
            modelo,
            codigo,
            setor,
            data,
            resumo: acao,
            descricao: desc,
            geradaEm: obterDataHoraLocalISO()
        });

        limparCamposFormulario();
    } catch (erro) {
        console.error('Erro ao registrar a OS no histórico:', erro);

        alert(
            `O PDF da OS Nº ${id} foi gerado, mas não foi possível ` +
            'registrá-lo no histórico local.'
        );
    }

    atualizarIndicadorProximaOS();
    atualizarHistorico();

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

    if (numeroJaRegistrado(numero)) {
        alert(
            `A Ordem de Serviço Nº ${numero} já existe no histórico.\n\n` +
            'Escolha outro número.'
        );

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

function completarComZero(valor) {
    return String(valor).padStart(2, '0');
}

function obterDataHoraLocalISO(data = new Date()) {
    const ano = data.getFullYear();
    const mes = completarComZero(data.getMonth() + 1);
    const dia = completarComZero(data.getDate());
    const hora = completarComZero(data.getHours());
    const minuto = completarComZero(data.getMinutes());
    const segundo = completarComZero(data.getSeconds());

    const deslocamentoTotal = -data.getTimezoneOffset();
    const sinalFuso = deslocamentoTotal >= 0 ? '+' : '-';
    const deslocamentoAbsoluto = Math.abs(deslocamentoTotal);
    const horasFuso = completarComZero(
        Math.floor(deslocamentoAbsoluto / 60)
    );
    const minutosFuso = completarComZero(
        deslocamentoAbsoluto % 60
    );

    return (
        `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}` +
        `${sinalFuso}${horasFuso}:${minutosFuso}`
    );
}

function criarNomeArquivoBackup() {
    const dataHora = obterDataHoraLocalISO()
        .slice(0, 19)
        .replace('T', '_')
        .replace(/:/g, '-');

    return `Backup SOSS - ${dataHora}.json`;
}

function exportarBackup() {
    const backup = {
        aplicacao: 'SOSS',
        versao: 2,
        exportadoEm: obterDataHoraLocalISO(),
        ultimoNumero: obterUltimoNumero(),
        historico: obterHistorico()
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
    const dadosBasicosValidos =
        backup !== null &&
        typeof backup === 'object' &&
        backup.aplicacao === 'SOSS' &&
        Number.isSafeInteger(backup.ultimoNumero) &&
        backup.ultimoNumero >= 0;

    if (!dadosBasicosValidos) {
        return false;
    }

    // Compatibilidade com os backups antigos,
    // que armazenavam somente a numeração.
    if (backup.versao === 1) {
        return true;
    }

    if (backup.versao !== 2 || !Array.isArray(backup.historico)) {
        return false;
    }

    return backup.historico.every(validarRegistroOrdem);
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
        const historicoAtual = obterHistorico();
        const possuiHistorico = backup.versao === 2;
        const proximoNumeroBackup = backup.ultimoNumero + 1;

        let mensagem =
            `O backup possui como última OS a Nº ${backup.ultimoNumero}.\n` +
            `Após a importação, a próxima será a Nº ${proximoNumeroBackup}.\n\n`;

        if (possuiHistorico) {
            const quantidadeBackup = backup.historico.length;
            const quantidadeAtual = historicoAtual.length;

            mensagem +=
                `O backup contém ${quantidadeBackup} ` +
                `${quantidadeBackup === 1 ? 'ordem' : 'ordens'} no histórico.\n`;

            mensagem +=
                `O histórico atual possui ${quantidadeAtual} ` +
                `${quantidadeAtual === 1 ? 'ordem' : 'ordens'} e será substituído.\n\n`;
        } else {
            mensagem +=
                'Este é um backup antigo sem histórico.\n' +
                'O histórico atual será mantido.\n\n';
        }

        if (backup.ultimoNumero < ultimoNumeroAtual) {
            mensagem +=
                `A numeração atual está na OS Nº ${ultimoNumeroAtual}.\n` +
                'Importar este backup pode provocar números repetidos.\n\n';
        }

        mensagem += 'Deseja importar este backup?';

        if (!confirm(mensagem)) {
            return;
        }

        const contadorAnterior = ultimoNumeroAtual;
        const historicoAnterior = historicoAtual;

        try {
            if (possuiHistorico) {
                salvarHistorico(backup.historico);
            }

            salvarUltimoNumero(backup.ultimoNumero);
        } catch (erroGravacao) {
            try {
                salvarUltimoNumero(contadorAnterior);

                if (possuiHistorico) {
                    salvarHistorico(historicoAnterior);
                }
            } catch (erroRestauracao) {
                console.error(
                    'Erro ao restaurar estado anterior:',
                    erroRestauracao
                );
            }

            throw erroGravacao;
        }

        atualizarIndicadorProximaOS();
        atualizarHistorico();

        const resultadoHistorico = possuiHistorico
            ? `${backup.historico.length} ` +
              `${backup.historico.length === 1 ? 'ordem restaurada' : 'ordens restauradas'}`
            : 'histórico atual mantido';

        alert(
            `Backup importado com sucesso!\n` +
            `${resultadoHistorico}.\n` +
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

inicializarRascunho();
atualizarIndicadorProximaOS();
atualizarHistorico();