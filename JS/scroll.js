document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica do Header Transparente ---
    const header = document.getElementById('main-header');
    // Define a partir de quantos pixels de rolagem o header muda
    // Pode ser um valor fixo (ex: 50) ou dinâmico (ex: altura do hero)
    const scrollThreshold = 50; // Mude este valor se necessário

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Adiciona o listener apenas se o header existir na página
    if (header) {
        // Verifica o estado inicial (caso a página carregue já rolada)
        handleScroll(); 
        // Adiciona o listener para o evento de scroll
        window.addEventListener('scroll', handleScroll);
    }
}); // Fim do DOMContentLoaded