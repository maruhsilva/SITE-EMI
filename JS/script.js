// JS/script.js (Completo)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica do Header Transparente ---
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // Ponto de rolagem onde o header muda

    function handleScroll() {
        // Garante que o header exista antes de tentar adicionar/remover classes
        if (header) { 
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    // Adiciona o listener apenas se o header existir
    if (header) {
        handleScroll(); // Verifica o estado inicial (caso a página carregue já rolada)
        window.addEventListener('scroll', handleScroll);
    }
    // --- Fim da Lógica do Header Transparente ---


    // --- Lógica do Menu Hamburger ---
    const hamburger = document.querySelector('#main-header .hamburger');
    const menu = document.querySelector('.menu');
    const overlay = document.querySelector('.menu-overlay');
    const closeBtn = document.querySelector('.close-btn');
    // Seleciona TODOS os links dentro do menu
    const menuLinks = document.querySelectorAll('.menu a'); // <- Adicionado

    // Função para fechar o menu
    function closeMobileMenu() {
        if (menu) menu.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        if (hamburger) hamburger.classList.remove('active');
    }

    // Função para abrir o menu
    function openMobileMenu() {
        if (menu) menu.classList.add('show');
        if (overlay) overlay.classList.add('show');
        if (hamburger) hamburger.classList.add('active');
    }

    // Listener para o ícone hamburger (abre/fecha)
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            // Verifica se o menu já está visível
            if (menu && menu.classList.contains('show')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Listener para o botão 'X' (fecha)
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }

    // Listener para o fundo (overlay) (fecha)
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    // *** AQUI ESTÁ A NOVA FUNCIONALIDADE ***
    // Adiciona listener para CADA link dentro do menu
    if (menuLinks.length > 0) {
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Fecha o menu quando um link é clicado
                closeMobileMenu(); 
            });
        });
    }
    // --- Fim da Lógica do Menu Hamburger ---


    // --- Lógica do Botão WhatsApp (se estiver neste arquivo) ---
    // (O código abaixo já estava no seu index.html, mas é melhor centralizar no JS)
    const whatsappButton = document.querySelector(".whatsapp-button");
    const footer = document.querySelector("footer");
      
    function checkWppPosition() {
        if (!whatsappButton || !footer) return; // Se os elementos não existirem, não faz nada
        
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (footerRect.top <= windowHeight) {
            // Se o footer estiver visível, ajusta a posição do botão
            whatsappButton.style.position = 'absolute'; // Muda para absoluto
            whatsappButton.style.bottom = `${windowHeight - footerRect.top + 20}px`; // Ajusta dinamicamente
        } else {
            // Se o footer não estiver visível, volta ao normal
            whatsappButton.style.position = 'fixed'; // Padrão fixo
            whatsappButton.style.bottom = "20px"; // Padrão fixo
        }
    }
    
    // Verifica a posição ao carregar e ao rolar
    if (whatsappButton && footer) {
         window.addEventListener("scroll", checkWppPosition);
         checkWppPosition(); // Executa a verificação ao carregar
    }
    // --- Fim da Lógica do Botão WhatsApp ---


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