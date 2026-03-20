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
    doc.text('DADOS DO SERVIÇO', 20, 40);

    doc.setFontSize(11);
    doc.text(`Modelo: ${modelo}`, 20, 50);
    doc.text(`Codigo: ${codigo}`, 20, 60);
    doc.text(`Setor: ${setor}`, 20, 70);

    // LINHA
    doc.line(20, 80, 190, 80);

    // TÍTULO
    doc.setFontSize(12);
    doc.text('DESCRIÇÃO', 20, 90);

    doc.line(20, 95, 190, 95);

    doc.setFontSize(11);

    // AÇÃO
    const yAcao = 105;
    doc.text(acao, 20, yAcao);

    // DESCRIÇÃO (multilinha)
    const yDescricao = 115;
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