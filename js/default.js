const { jsPDF } = window.jspdf;

function gerarPDF() {
    const modelo = document.getElementById('modelo').value;
    const codigo = document.getElementById('codigo').value;
    const setor = document.getElementById('setor').value;
    const data = document.getElementById('data').value;
    const acao = document.getElementById('acao').value;
    const desc = document.getElementById('desc').value;

    if (!modelo || !codigo || !setor || !data || !acao || !desc) {
        alert('Preencha todos os campos!');
        return;
    }

    let id = localStorage.getItem('id');
    id = id ? parseInt(id) + 1 : 1;
    localStorage.setItem('id', id);

    const doc = new jsPDF();

    // CABEÇALHO
    doc.setFontSize(18);
    doc.text('Ordem de Serviço Simplificada', 20, 20);

    doc.setFontSize(10);
    doc.text(`Nº: ${id}`, 160, 20);
    doc.text(`Data: ${data}`, 160, 26);

    doc.line(20, 30, 190, 30);

    // SERVIÇO
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DADOS DO SERVIÇO', 20, 45);

    doc.line(20, 50, 190, 50);

    doc.setFontSize(11);

    //Posições
    const xRotulo = 20;
    const xValor = 40;
    doc.setFont(undefined, 'bold');
    doc.text('Modelo:', xRotulo, 60);
    doc.setFont(undefined, 'normal');
    doc.text(modelo, xValor, 60);

    doc.setFont(undefined, 'bold');
    doc.text('Codigo:', xRotulo, 70);
    doc.setFont(undefined, 'normal');
    doc.text(codigo, xValor, 70);

    doc.setFont(undefined, 'bold');
    doc.text('Setor:', xRotulo, 80);
    doc.setFont(undefined, 'normal');
    doc.text(setor, xValor, 80);

    // LINHA
    doc.line(20, 90, 190, 90);

    // TÍTULO
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DESCRIÇÃO', 20, 105);

    doc.line(20, 110, 190, 110);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    // AÇÃO
    doc.setFont(undefined, 'bold');
    const yAcao = 120;
    doc.text(acao, 20, yAcao);
    doc.setFont(undefined, 'normal');

    // DESCRIÇÃO (multilinha)
    const yDescricao = 130;
    const linhasDesc = doc.splitTextToSize(desc, 120);
    doc.text(linhasDesc, 20, yDescricao);

    // Pega a altura do texto escrito
    const alturaReal = doc.getTextDimensions(linhasDesc).h;

    // Espaçamento para linha depois da descrição, favor não mexer muito volátil
    const espacamento = 2;

    // Posição final da linha depois da descrição
    const yFinal = yDescricao + alturaReal + espacamento;

    // Insere a linha depois da descrição
    doc.line(20, yFinal, 190, yFinal);

    // RODAPÉ
    doc.setFontSize(9);
    doc.text('Documento gerado automaticamente', 20, 280);

    // SALVAR
    doc.save(`Ordem de Serviço ${id} - ${data}.pdf`);
}

function resetarContador() {
    if (confirm('Tem certeza que deseja resetar o contador?')) {
        localStorage.removeItem('id');
        alert('Contador resetado!');
    }
}

function definirProximoId() {
    const novoId = prompt('Digite o próximo ID desejado:');

    if (novoId === null) return;

    const numero = parseInt(novoId);

    if (isNaN(numero) || numero <= 0) {
        alert('Digite um número válido!');
        return;
    }

    localStorage.setItem('id', numero - 1);
    alert(`Próximo ID será ${numero}`);
}