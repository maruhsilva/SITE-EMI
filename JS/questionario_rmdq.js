// JS/questionario_rmdq.js (Versão 1.8 - Envio Email Automático + WhatsApp)

document.addEventListener("DOMContentLoaded", () => {
    // Garantir que jsPDF está carregado
    if (typeof window.jspdf === 'undefined') {
        console.error("Biblioteca jsPDF não carregada.");
        document.getElementById('download-pdf-button')?.setAttribute('disabled', 'true');
        document.getElementById('open-patient-info-modal-button')?.setAttribute('disabled', 'true'); // Desabilita o botão principal
    }
    const { jsPDF } = window.jspdf; 

    // Referências aos elementos HTML
    const instructionsDiv = document.getElementById('rmdq-instructions');
    const quizDiv = document.getElementById('rmdq-quiz');
    const resultDiv = document.getElementById('rmdq-result');
    const startButton = document.getElementById('start-button');
    const progressText = document.getElementById('rmdq-progress');
    const questionText = document.getElementById('rmdq-question');
    const optionsDiv = document.getElementById('rmdq-options');
    const scoreSpan = document.getElementById('rmdq-score');
    const interpretationSpan = document.getElementById('rmdq-interpretation');
    const downloadPdfButton = document.getElementById('download-pdf-button'); 
    const openPatientInfoModalButton = document.getElementById('open-patient-info-modal-button'); 
    const statusMessage = document.getElementById('status-message'); // Status geral
    
    // Modais
    const referenceModal = document.getElementById('reference-modal');
    const referenceLink = document.getElementById('ref-link');
    const closeRefButton = document.querySelector('.close-ref-btn');
    const patientInfoModal = document.getElementById('patient-info-modal');
    const patientNameInput = document.getElementById('patient-name');
    const patientEmailInput = document.getElementById('patient-email');
    const patientInfoError = document.getElementById('patient-info-error');
    const confirmShareButton = document.getElementById('confirm-share-button'); // ID ATUALIZADO NO HTML
    const closePatientInfoButton = document.querySelector('.close-patient-info-btn');

    // Perguntas e Estado
    const questions = [
        "Fico em casa a maior parte do tempo por causa de minhas costas.", "Mudo de posição freqüentemente tentando deixar minhas costas confortáveis.", "Ando mais devagar que o habitual por causa de minhas costas.", "Por causa de minhas costas eu não estou fazendo nenhum dos meus trabalhos que geralmente faço em casa.", "Por causa de minhas costas, eu uso o corrimão para subir escadas.", "Por causa de minhas costas, eu me deito para descansar mais freqüentemente.", "Por causa de minhas costas, eu tenho que me apoiar em alguma coisa para me levantar de uma cadeira normal.", "Por causa de minhas costas, tento conseguir com que outras pessoas façam as coisas por mim.", "Eu me visto mais lentamente que o habitual por causa de minhas costas.", "Eu somente fico em pé por períodos curtos de tempo por causa de minhas costas.", "Por causa de minhas costas evito me abaixar ou ajoelhar.", "Encontro dificuldades em me levantar de uma cadeira por causa de minhas costas.", "As minhas costas doem quase que todo o tempo.", "Tenho dificuldade em me virar na cama por causa das minhas costas.", "Meu apetite não é muito bom por causa das dores em minhas costas.", "Tenho problemas para colocar minhas meias (ou meia-calça) por causa das dores em minhas costas.", "Caminho apenas curta distância por causa de minhas dores nas costas.", "Não durmo tão bem por causa de minhas costas.", "Por causa de minhas dores nas costas, eu me visto com ajuda de outras pessoas.", "Fico sentado a maior parte do dia por causa de minhas costas.", "Evito trabalhos pesados em casa por causa de minhas costas.", "Por causa das dores em minhas costas, fico mais irritado e mal humorado com as pessoas do que o habitual.", "Por causa de minhas costas, eu subo escadas mais vagarosamente do que o habitual.", "Fico na cama a maior parte do tempo por causa de minhas costas."
    ];
    let currentQuestionIndex = 0;
    let finalScore = 0; 
    let finalInterpretation = ""; 
    let answers = []; 

    // --- FUNÇÕES DO QUESTIONÁRIO (sem alterações) ---
    function startQuestionnaire() { instructionsDiv.style.display = 'none'; resultDiv.style.display = 'none'; quizDiv.style.display = 'block'; currentQuestionIndex = 0; finalScore = 0; finalInterpretation = ""; answers = []; displayQuestion(); }
    function displayQuestion() { if (currentQuestionIndex < questions.length) { progressText.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`; questionText.textContent = questions[currentQuestionIndex]; renderOptions(); } else { showResult(); } }
    function renderOptions() { optionsDiv.innerHTML = ''; const y = document.createElement('button'); y.textContent='Sim'; y.classList.add('yes-button'); y.onclick=()=>handleAnswer(true); const n = document.createElement('button'); n.textContent='Não'; n.classList.add('no-button'); n.onclick=()=>handleAnswer(false); optionsDiv.appendChild(y); optionsDiv.appendChild(n); }
    function handleAnswer(agrees) { answers[currentQuestionIndex] = agrees; if (agrees) { finalScore++; } currentQuestionIndex++; displayQuestion(); }
    function showResult() { quizDiv.style.display = 'none'; let l=''; if(finalScore<=4){finalInterpretation="Mínima"; l="level-minima";} else if(finalScore<=10){finalInterpretation="Leve"; l="level-leve";} else if(finalScore<=16){finalInterpretation="Moderada"; l="level-moderada";} else{finalInterpretation="Severa"; l="level-severa";} if(interpretationSpan){interpretationSpan.textContent=finalInterpretation; interpretationSpan.className='interpretation-level'; interpretationSpan.classList.add(l);} if(scoreSpan){scoreSpan.textContent=finalScore;} resultDiv.style.display='block'; }

    // --- FUNÇÃO GERAR PDF (Retorna Base64 - sem alterações) ---
    function generatePDFData() {
        if (typeof jsPDF === 'undefined') { console.error("jsPDF não carregado."); return null; }
        const doc = new jsPDF();
        const patientName = patientNameInput ? patientNameInput.value.trim() : 'Não informado'; 
        const patientEmail = patientEmailInput ? patientEmailInput.value.trim() : 'Não informado'; 
        doc.setFontSize(18); doc.text("Resultado - Questionário Roland-Morris (Dor Lombar)", 105, 15, null, null, "center");
        doc.setFontSize(12); doc.text(`Nome: ${patientName}`, 15, 30); doc.text(`Email: ${patientEmail}`, 15, 37); doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, 44);
        doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(`Pontuação Final: ${finalScore} de 24`, 15, 54); doc.text(`Nível de Incapacidade: ${finalInterpretation}`, 15, 61); doc.setFont(undefined, 'normal');
        doc.setLineWidth(0.5); doc.line(15, 65, 195, 65);
        doc.setFontSize(12); doc.text("Respostas Detalhadas:", 15, 75);
        let yPos = 82; const lineHeight = 7; const pageHeight = doc.internal.pageSize.height; const marginBottom = 20;
        doc.setFontSize(10);
        questions.forEach((question, index) => {
            if (yPos > pageHeight - marginBottom) { doc.addPage(); yPos = 20; doc.setFontSize(10); }
            const answerText = answers[index] ? "Sim" : "Não";
            const splitQuestion = doc.splitTextToSize(`${index + 1}. ${question}`, 160); 
            doc.text(splitQuestion, 15, yPos);
            const textHeight = splitQuestion.length * (lineHeight * 0.7); yPos += textHeight; 
            doc.setFont(undefined, 'bold'); doc.text(`Resposta: ${answerText}`, 175, yPos - (textHeight > lineHeight * 0.7 ? 0 : lineHeight * 0.7) , null, null, "right"); doc.setFont(undefined, 'normal');
            yPos += lineHeight; 
        });
        if (yPos > pageHeight - marginBottom - 20) { doc.addPage(); yPos = 20; } 
        doc.setFontSize(8); doc.setTextColor(100); doc.text("Referência: Monteiro J, et al. Acta Med Port 2010; 23: 761-766.", 15, yPos + 10);
        return doc.output('datauristring'); 
    }

     // --- FUNÇÃO PARA FAZER O DOWNLOAD DO PDF (sem alterações) ---
    function downloadPDF() {
        const pdfDataUri = generatePDFData(); if(!pdfDataUri) return; 
        const link = document.createElement('a'); link.href = pdfDataUri;
        const patientName = patientNameInput ? patientNameInput.value.trim().replace(/\s+/g, '_') : 'Paciente';
        link.download = `Resultado_RMDQ_${patientName || 'Paciente'}.pdf`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

    // --- FUNÇÕES DO MODAL DE REFERÊNCIA (sem alterações) ---
    function openRefModal() { if (referenceModal) referenceModal.style.display = 'flex'; }
    function closeRefModal() { if (referenceModal) referenceModal.style.display = 'none'; }
    if (referenceLink) referenceLink.addEventListener('click', (e) => { e.preventDefault(); openRefModal(); });
    if (closeRefButton) closeRefButton.addEventListener('click', closeRefModal);
    window.addEventListener('click', (event) => { if (event.target == referenceModal) closeRefModal(); });

    // --- FUNÇÕES DO MODAL DE INFO PACIENTE ---
    function openPatientInfoModal() {
        if (patientNameInput) patientNameInput.value = '';
        if (patientEmailInput) patientEmailInput.value = '';
        if (patientInfoError) patientInfoError.style.display = 'none';
        // Limpa mensagem de status anterior
         if(statusMessage) { statusMessage.textContent = ''; statusMessage.className = ''; } 
        if (patientInfoModal) patientInfoModal.style.display = 'flex'; 
        else console.error("Modal 'patient-info-modal' não encontrado.");
    }
    function closePatientInfoModal() { if (patientInfoModal) patientInfoModal.style.display = 'none'; }

    // --- FUNÇÃO PRINCIPAL DE COMPARTILHAMENTO (ATUALIZADA) ---
    async function handleShareResults() { // Renomeada de handleSendEmail
        const patientName = patientNameInput ? patientNameInput.value.trim() : '';
        const patientEmail = patientEmailInput ? patientEmailInput.value.trim() : '';

        // Validação
        if (!patientName || !patientEmail) {
            if (patientInfoError) patientInfoError.style.display = 'block';
            return;
        }
        if (patientInfoError) patientInfoError.style.display = 'none';

        // Desabilita botão e mostra status
        if(confirmShareButton) confirmShareButton.disabled = true;
        if(statusMessage) {
            statusMessage.textContent = "Compartilhando resultados...";
            statusMessage.className = ''; 
        }
        closePatientInfoModal(); // Fecha o modal imediatamente

        // 1. Tenta enviar o email com o PDF em segundo plano
        let emailSent = false;
        const pdfDataUri = generatePDFData();
        if (pdfDataUri) {
            const base64Pdf = pdfDataUri.split(',')[1]; 
            try {
                const response = await fetch('enviar_pdf_rmdq.php', { // Garanta que o caminho está correto
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: patientName, email: patientEmail, score: finalScore,
                        interpretacao: finalInterpretation, pdfData: base64Pdf
                    })
                });
                const result = await response.json();
                if (result.success) {
                    console.log("Email com PDF enviado com sucesso.");
                    emailSent = true;
                } else {
                    throw new Error(result.error || 'Erro no servidor PHP ao enviar email.');
                }
            } catch (error) {
                console.error("Erro ao tentar enviar email:", error);
                // Não mostra erro crítico para o usuário, apenas log
            }
        } else {
             console.error("Falha ao gerar dados do PDF para o email.");
        }

        // 2. Abrir o WhatsApp (acontece independentemente do sucesso do email)
        const numeroFisio = "55012981794612"; // Verifique o número
        const mensagemWhats = `Olá! Meu nome é ${patientName}.\n\nRespondi o Questionário RMDQ:\n*Score:* ${finalScore}/24 (${finalInterpretation}).\n\n(O resultado detalhado foi enviado por email).\n\nGostaria de agendar uma avaliação.`;
        const mensagemCodificada = encodeURIComponent(mensagemWhats);
        const whatsappLink = `https://wa.me/${numeroFisio}?text=${mensagemCodificada}`;
        window.open(whatsappLink, '_blank');

        // 3. Atualizar mensagem de status final
        if(statusMessage) {
            if(emailSent) {
                 statusMessage.textContent = "Resumo enviado via WhatsApp e email enviado!";
                 statusMessage.className = 'success';
            } else {
                 statusMessage.textContent = "Resumo enviado via WhatsApp (falha ao enviar email).";
                 statusMessage.className = 'error'; // Ou uma classe de aviso
            }
        }
        
        // Reabilita o botão após um tempo (se o usuário voltar para a página)
        setTimeout(() => {
             if(confirmShareButton) confirmShareButton.disabled = false;
        }, 2000); // Reabilita após 2 segundos
    }

    // --- Event Listeners ---
    if (referenceLink) referenceLink.addEventListener('click', (e) => { e.preventDefault(); openRefModal(); });
    if (closeRefButton) closeRefButton.addEventListener('click', closeRefModal);
    window.addEventListener('click', (event) => { if (event.target == referenceModal) closeRefModal(); });

    // Botão "Compartilhar Resultado" abre o modal de info
    if (openPatientInfoModalButton) openPatientInfoModalButton.addEventListener('click', openPatientInfoModal); 
    else console.error("Botão 'open-patient-info-modal-button' não encontrado.");

    // Botão de confirmação DENTRO do modal de info agora chama handleShareResults
    if (confirmShareButton) { // ID ATUALIZADO NO HTML
        confirmShareButton.addEventListener('click', handleShareResults);
    } else {
        console.error("Botão 'confirm-share-button' não encontrado.");
    }
    
    // Listeners do modal de info paciente
    if (closePatientInfoButton) closePatientInfoButton.addEventListener('click', closePatientInfoModal);
    else console.error("Botão de fechar modal '.close-patient-info-btn' não encontrado.");
    window.addEventListener('click', (event) => { if (event.target == patientInfoModal) closePatientInfoModal(); });

    // Listener do botão de download PDF
    if (downloadPdfButton) downloadPdfButton.addEventListener('click', downloadPDF);
    else console.error("Botão 'download-pdf-button' não encontrado.");

    // Listener do botão de iniciar
    if (startButton) { startButton.addEventListener('click', startQuestionnaire); } 
    else { console.error("Botão 'start-button' não encontrado."); }

}); // Fim do DOMContentLoaded