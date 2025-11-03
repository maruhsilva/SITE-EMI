// chat-ia.js (Versão 2 - Conhecimento Dinâmico via API)

document.addEventListener('DOMContentLoaded', () => {
    // URLs da API Python
    const API_URL_BASE = "http://127.0.0.1:8000";
    const API_URL_PREVISAO = `${API_URL_BASE}/prever_condicao`;
    const API_URL_TRIAGENS = `${API_URL_BASE}/triagens`;
    const API_URL_CONHECIMENTO = `${API_URL_BASE}/conhecimento_completo`; // <- NOVA URL

    // --- VARIÁVEL PARA ARMAZENAR O CONHECIMENTO BUSCADO DA API ---
    let dynamicKnowledgeTree = {}; // Será preenchida pela API
    let knowledgeFetchError = false; // Flag para erro ao buscar conhecimento

    // Estado da conversa (sem alterações)
    let conversationState = 'inicio';
    let sintomasColetados = [];
    let areaPrincipalSelecionada = '';
    let subAreaSelecionada = '';
    let checklistIndex = 0;

    // --- FUNÇÕES DE CRIAÇÃO E CONTROLE DO WIDGET (sem grandes alterações) ---
    function criarChatWidget() {
        // Botão Flutuante
        const chatButton = document.createElement('button');
        chatButton.id = 'chat-ia-button';
        chatButton.innerHTML = '<i class="fa-solid fa-robot"></i>';
        chatButton.onclick = toggleChatWindow;
        document.body.appendChild(chatButton);

        // Janela do Chat
        const chatWindow = document.createElement('div');
        chatWindow.id = 'chat-ia-window';
        chatWindow.innerHTML = `
            <div class="chat-ia-header">
                <span>Assistente de Triagem IA</span>
                <button id="chat-ia-close-btn">&times;</button>
            </div>
            <div class="chat-ia-body"></div>
            <div class="chat-ia-input"></div>
        `;
        document.body.appendChild(chatWindow);

        // Adicionar evento ao botão de fechar
        document.getElementById('chat-ia-close-btn').onclick = toggleChatWindow;

        // Adicionar mensagem inicial APÓS buscar conhecimento
        // iniciarConversa(); // Será chamado após fetchKnowledgeTree
    }

    function toggleChatWindow() {
        const chatWindow = document.getElementById('chat-ia-window');
        chatWindow.classList.toggle('active');
        // Se estiver abrindo e o conhecimento ainda não foi carregado (ou deu erro), tenta carregar/mostrar erro
        if (chatWindow.classList.contains('active') && Object.keys(dynamicKnowledgeTree).length === 0) {
             if (knowledgeFetchError) {
                 mostrarErroConhecimento();
             } else {
                 // Inicia a conversa (que tentará buscar o conhecimento se ainda não tiver)
                 iniciarConversa();
             }
        }
    }

    function adicionarMensagem(texto, tipo, importante = false) {
        const chatBody = document.querySelector('.chat-ia-body');
        if (!chatBody) return; // Segurança
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', tipo === 'bot' ? 'bot-message' : 'user-message');
        if (importante) messageDiv.classList.add('important');

        // Substitui \n por <br> para quebras de linha no HTML
        messageDiv.innerHTML = texto.replace(/\n/g, '<br>');

        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    const adicionarMensagemBot = (texto, importante = false) => adicionarMensagem(texto, 'bot', importante);
    const adicionarMensagemUsuario = (texto) => adicionarMensagem(texto, 'user');

    function limparInputArea() {
        const inputArea = document.querySelector('.chat-ia-input');
        if (inputArea) inputArea.innerHTML = '';
    }

    function mostrarOpcoes(opcoes, callback) {
        limparInputArea();
        const inputArea = document.querySelector('.chat-ia-input');
        if (!inputArea) return;
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('chat-options');

        opcoes.forEach(opcao => {
            const button = document.createElement('button');
            button.textContent = opcao;
            button.onclick = () => {
                adicionarMensagemUsuario(opcao);
                desabilitarOpcoes();
                callback(opcao);
            };
            optionsContainer.appendChild(button);
        });
        inputArea.appendChild(optionsContainer);
    }

    function mostrarSimNao(callbackSim, callbackNao) {
        limparInputArea();
        const inputArea = document.querySelector('.chat-ia-input');
        if (!inputArea) return;
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('chat-options');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.gap = '10px';

        const btnSim = document.createElement('button');
        btnSim.textContent = 'Sim';
        btnSim.onclick = () => { adicionarMensagemUsuario('Sim'); desabilitarOpcoes(); callbackSim(); };

        const btnNao = document.createElement('button');
        btnNao.textContent = 'Não';
        btnNao.onclick = () => { adicionarMensagemUsuario('Não'); desabilitarOpcoes(); callbackNao(); };

        optionsContainer.appendChild(btnSim);
        optionsContainer.appendChild(btnNao);
        inputArea.appendChild(optionsContainer);
    }

    function desabilitarOpcoes() {
        const buttons = document.querySelectorAll('.chat-ia-input button');
        buttons.forEach(btn => btn.disabled = true);
    }

    function mostrarLoading(mostrar = true) {
        limparInputArea();
        if (mostrar) {
            const inputArea = document.querySelector('.chat-ia-input');
             if(inputArea) inputArea.innerHTML = `<div class="loading-indicator"><span></span><span></span><span></span></div>`;
        }
    }

    // --- LÓGICA DE BUSCA DO CONHECIMENTO ---
    async function fetchKnowledgeTree() {
        // Se já temos, não busca de novo
        if (Object.keys(dynamicKnowledgeTree).length > 0) {
            return true;
        }
        // Se já deu erro antes, não tenta de novo (evita loops)
        if (knowledgeFetchError) {
             mostrarErroConhecimento();
             return false;
        }

        console.log("Buscando base de conhecimento da API...");
        mostrarLoading(); // Mostra loading enquanto busca

        try {
            const response = await fetch(API_URL_CONHECIMENTO, { method: 'GET', headers: { 'Accept': 'application/json' }});
            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao buscar conhecimento.`);
            }
            dynamicKnowledgeTree = await response.json();
            console.log("Base de conhecimento carregada:", dynamicKnowledgeTree);
            knowledgeFetchError = false; // Reseta flag de erro
            mostrarLoading(false); // Esconde loading
            return true; // Sucesso
        } catch (error) {
            console.error("Falha ao buscar conhecimento da API:", error);
            knowledgeFetchError = true; // Marca que deu erro
            mostrarLoading(false); // Esconde loading
            mostrarErroConhecimento();
            return false; // Falha
        }
    }
    
    function mostrarErroConhecimento() {
         adicionarMensagemBot("Não foi possível carregar a base de conhecimento no momento. Por favor, tente novamente mais tarde.", true);
         limparInputArea(); // Limpa quaisquer botões
    }

    // --- LÓGICA DA CONVERSA (MODIFICADA PARA USAR dynamicKnowledgeTree) ---

    async function iniciarConversa() {
        // Garante que temos a base de conhecimento antes de começar
        const knowledgeLoaded = await fetchKnowledgeTree();
        if (!knowledgeLoaded) {
             // A função fetchKnowledgeTree já mostra o erro
             return; 
        }

        // Limpa estado para garantir reinício limpo
        resetConversationState();

        // Mensagens iniciais (somente se não houver erro)
        adicionarMensagemBot("Olá! Sou o assistente virtual. Posso ajudar a coletar informações iniciais.", false);
        adicionarMensagemBot("AVISO: Não substituo uma avaliação profissional. Em caso de emergência, procure um médico.", true);

        setTimeout(() => {
            adicionarMensagemBot("Para começar, em qual grande área do corpo você sente o principal desconforto?");
            // USA A BASE DINÂMICA
            const areasPrincipais = Object.keys(dynamicKnowledgeTree);
            if (areasPrincipais.length === 0) {
                 adicionarMensagemBot("Ainda não tenho conhecimento cadastrado. Por favor, contate o administrador.", true);
                 return;
            }
            mostrarOpcoes(areasPrincipais.sort(), processarAreaPrincipal); // Ordena para melhor UX
            conversationState = 'area_principal';
        }, 500); // Delay menor após carregar conhecimento
    }

    function processarAreaPrincipal(area) {
        areaPrincipalSelecionada = area;
        setTimeout(() => {
            adicionarMensagemBot(`Entendido (${area}). E qual a sub-região mais específica?`);
            // USA A BASE DINÂMICA
            const subAreas = Object.keys(dynamicKnowledgeTree[area]);
             if (subAreas.length === 0) {
                 adicionarMensagemBot("Não encontrei sub-áreas para esta seleção. Vamos tentar finalizar.", true);
                 finalizarColeta(); // Tenta finalizar mesmo sem subárea detalhada
                 return;
            }
            mostrarOpcoes(subAreas.sort(), processarSubArea);
            conversationState = 'sub_area';
        }, 500);
    }

    function processarSubArea(subArea) {
        subAreaSelecionada = subArea;
        // Lógica para sintoma principal (igual)
        let sintomaPrincipal = "";
        const mapa_sintomas = { "Mandíbula (ATM)": "Dor na mandíbula", "Cervical (pescoço)": "Dor cervical", "Torácica (meio das costas)": "Dor torácica (meio das costas)", "Lombar (parte de baixo)": "Dor lombar", "Ombro": "Dor no ombro", "Cotovelo": "Dor no cotovelo", "Punho e Mão": "Dor no punho ou mão", "Quadril": "Dor no quadril", "Joelho": "Dor no joelho", "Tornozelo e Pé": "Dor no tornozelo ou pé" };
        sintomaPrincipal = mapa_sintomas[subArea] || `Dor na região ${subArea.toLowerCase()}`;
        
        // Garante que não adiciona duplicado se já foi adicionado por erro anterior
        if (!sintomasColetados.includes(sintomaPrincipal)) {
             sintomasColetados.push(sintomaPrincipal);
        }

        setTimeout(() => {
            adicionarMensagemBot(`Ok, registramos: '${sintomaPrincipal}'. Agora, responda 'sim' ou 'não' para alguns sintomas comuns.`);
            checklistIndex = 0;
            fazerPerguntaChecklist();
            conversationState = 'checklist';
        }, 500);
    }

    function fazerPerguntaChecklist() {
        // USA A BASE DINÂMICA
        const checklist = dynamicKnowledgeTree[areaPrincipalSelecionada]?.[subAreaSelecionada] || [];
        
        if (checklistIndex < checklist.length) {
            const sintomaAtual = checklist[checklistIndex];
            setTimeout(() => {
                adicionarMensagemBot(`Você sente '${sintomaAtual}'?`);
                mostrarSimNao(
                    () => { // Sim
                        if (!sintomasColetados.includes(sintomaAtual)) { // Evita duplicatas
                             sintomasColetados.push(sintomaAtual);
                        }
                        checklistIndex++;
                        fazerPerguntaChecklist();
                    },
                    () => { // Não
                        checklistIndex++;
                        fazerPerguntaChecklist();
                    }
                );
            }, 500);
        } else {
            finalizarColeta();
        }
    }

    async function finalizarColeta() {
        conversationState = 'finalizado';
        if (sintomasColetados.length === 0) {
             adicionarMensagemBot("Não coletamos sintomas suficientes para análise. Gostaria de tentar novamente?", true);
             mostrarOpcoes(["Iniciar Nova Triagem"], reiniciarChat);
             return;
        }

        adicionarMensagemBot("Coleta finalizada. Analisando seus sintomas com a IA...");
        mostrarLoading();

        try {
            const response = await fetch(API_URL_PREVISAO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomes_sintomas: sintomasColetados })
            });

            mostrarLoading(false);

            if (!response.ok) {
                 if (response.status === 404) {
                    adicionarMensagemBot("Não encontramos condições diretamente relacionadas aos sintomas fornecidos no momento.", true);
                 } else {
                     const errorData = await response.json().catch(() => ({})); // Tenta pegar detalhe do erro
                     adicionarMensagemBot(`Ocorreu um erro na análise (Código: ${response.status} - ${errorData.detail || 'Detalhe indisponível'}). Tente novamente mais tarde.`, true);
                 }
                 reiniciarChatAposErro();
                 return;
            }

            const resultado = await response.json();
            
            adicionarMensagemBot("--- Resultado da Triagem Inicial ---");
            if (resultado.possiveis_condicoes && resultado.possiveis_condicoes.length > 0) {
                resultado.possiveis_condicoes.forEach(cond => {
                    adicionarMensagemBot(`Possível Condição: ${cond.nome_condicao} (Score: ${cond.score.toFixed(1)})\nDescrição: ${cond.descricao}`);
                });
            } else {
                adicionarMensagemBot("Não foi possível determinar condições prováveis com base nos sintomas.");
            }
             adicionarMensagemBot("Lembre-se: Este é um resultado preliminar e NÃO um diagnóstico. Consulte um profissional.", true);

            salvarTriagemAPI(sintomasColetados, resultado);

            setTimeout(() => {
                mostrarOpcoes(["Iniciar Nova Triagem"], reiniciarChat);
            }, 1000);

        } catch (error) {
            console.error("Erro ao chamar API de previsão:", error);
            mostrarLoading(false);
            adicionarMensagemBot("Erro de conexão ao tentar analisar os sintomas. Verifique se a API está online e tente novamente.", true);
            reiniciarChatAposErro();
        }
    }

    async function salvarTriagemAPI(sintomas, resultado) {
         // (Função salvarTriagemAPI continua a mesma)
         const previsoes = resultado?.possiveis_condicoes || [];
         if (previsoes.length === 0) return;
         const payload = { sintomas_relatados: sintomas, previsao_ia: previsoes };
         try {
             await fetch(API_URL_TRIAGENS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
             console.log("Triagem salva com sucesso.");
         } catch (error) { console.error("Erro ao salvar triagem:", error); }
    }
    
    // Função para limpar o estado da conversa
    function resetConversationState() {
        conversationState = 'inicio';
        sintomasColetados = [];
        areaPrincipalSelecionada = '';
        subAreaSelecionada = '';
        checklistIndex = 0;
    }

    function reiniciarChat() {
        // Limpa interface e estado
        document.querySelector('.chat-ia-body').innerHTML = '';
        limparInputArea();
        resetConversationState();
        // Reinicia a conversa (vai buscar o conhecimento se necessário)
        iniciarConversa();
    }
     
    function reiniciarChatAposErro() {
         resetConversationState(); // Limpa estado para não ficar preso
         setTimeout(() => {
                mostrarOpcoes(["Tentar Novamente"], reiniciarChat);
            }, 1000);
    }

    // --- INICIALIZAÇÃO ---
    criarChatWidget();
    // A conversa SÓ COMEÇA quando o usuário abre o chat ou se o conhecimento já estiver carregado
    // iniciarConversa(); // Removido daqui, chamado no toggle ou fetch

    // Adicione este bloco no seu JS/script.js, dentro do DOMContentLoaded

    // --- Lógica de Posição do Botão Chat IA (para acompanhar o footer) ---
    const chatIaButton = document.querySelector("#chat-ia-button");
    const footerElement = document.querySelector("footer"); // Podemos reutilizar a const 'footer' se ela já existir no escopo

    function checkChatIaPosition() {
        if (!chatIaButton || !footerElement) return; // Se os elementos não existirem, não faz nada
        
        const footerRect = footerElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (footerRect.top <= windowHeight) {
            // Se o footer estiver visível, ajusta a posição do botão
            chatIaButton.style.position = 'absolute'; // Muda para absoluto
            
            // Calcula o 'bottom' para ficar 90px acima do topo do footer visível
            // (O botão WhatsApp fica a 20px, este fica a 90px, mantendo a distância)
            chatIaButton.style.bottom = `${windowHeight - footerRect.top + 90}px`; 
        } else {
            // Se o footer não estiver visível, volta ao normal
            chatIaButton.style.position = 'fixed'; // Padrão fixo
            chatIaButton.style.bottom = "90px"; // Posição original do CSS
        }
    }
    
    // Verifica a posição ao carregar e ao rolar
    if (chatIaButton && footerElement) {
         window.addEventListener("scroll", checkChatIaPosition);
         checkChatIaPosition(); // Executa a verificação ao carregar
    }
    // --- Fim da Lógica do Botão Chat IA ---

}); // Certifique-se de que está dentro do fechamento do DOMContentLoaded