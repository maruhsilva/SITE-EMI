// Adicionar ao JS/script.js ou criar JS/service-modal.js

document.addEventListener('DOMContentLoaded', () => {

    // Detalhes dos Serviços (Adapte as descrições conforme necessário)
    const serviceDetails = {
        'reabilitacao': {
            title: 'Reabilitação Física',
            description: 'Recupere sua mobilidade e força com um plano de tratamento individualizado. Focado em lesões ortopédicas, dores crônicas e recuperação funcional, utilizamos técnicas manuais, exercícios terapêuticos e equipamentos modernos para otimizar seus resultados e devolver sua independência nas atividades diárias.',
            videoPlaceholder: '<p>Vídeo sobre Reabilitação em breve!</p>' // Ou <img>, <video>, <iframe>
        },
        'esportiva': {
            title: 'Fisioterapia Esportiva',
            description: 'Seja você um atleta profissional ou amador, oferecemos suporte completo para prevenção de lesões, tratamento agudo e reabilitação pós-lesão. Nosso objetivo é acelerar seu retorno seguro ao esporte, otimizando performance e minimizando o risco de novas lesões através de avaliações biomecânicas e treinos específicos.',
            videoPlaceholder: '<p>Vídeo sobre Fisioterapia Esportiva em breve!</p>'
        },
        'dor': {
            title: 'Tratamento de Dor',
            description: 'Alívio eficaz para dores agudas e crônicas (musculares, articulares, neuropáticas). Utilizamos uma combinação de terapia manual, eletrotermofototerapia, exercícios específicos e educação em dor para controlar seus sintomas, melhorar sua função e ensinar estratégias de autogerenciamento da dor.',
            videoPlaceholder: '<p>Vídeo sobre Tratamento de Dor em breve!</p>'
        },
        'pos-cirurgico': {
            title: 'Pós-Cirúrgico',
            description: 'Recuperação otimizada após procedimentos cirúrgicos ortopédicos (joelho, quadril, ombro, coluna, etc.). Focamos na redução do inchaço e da dor, ganho de amplitude de movimento, fortalecimento muscular progressivo e retorno seguro às suas atividades, seguindo protocolos baseados em evidências e em comunicação com seu médico.',
            videoPlaceholder: '<p>Vídeo sobre Fisioterapia Pós-Cirúrgica em breve!</p>'
        }
    };

    // Elementos do Modal
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-servico-title');
    const modalVideo = document.getElementById('modal-servico-video');
    const modalDescription = document.getElementById('modal-servico-description');
    const closeModalBtn = document.querySelector('.close-servico-btn');

    // Seleciona todos os cards de serviço
    const serviceCards = document.querySelectorAll('.servico');

    // Função para abrir o modal
    function openServiceModal(serviceKey) {
        const details = serviceDetails[serviceKey];
        if (!details || !modal || !modalTitle || !modalVideo || !modalDescription) {
            console.error('Detalhes do serviço ou elementos do modal não encontrados para:', serviceKey);
            return;
        }

        modalTitle.textContent = details.title;
        modalDescription.textContent = details.description;
        modalVideo.innerHTML = details.videoPlaceholder; // Define o conteúdo do placeholder

        modal.style.display = 'flex'; // Mostra o modal
    }

    // Função para fechar o modal
    function closeServiceModal() {
        if (modal) {
            modal.style.display = 'none'; // Esconde o modal
        }
    }

    // Adiciona evento de clique a cada card de serviço
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceKey = card.getAttribute('data-service');
            if (serviceKey) {
                openServiceModal(serviceKey);
            }
        });
    });

    // Adiciona evento de clique ao botão de fechar
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeServiceModal);
    }

    // Adiciona evento de clique no overlay (fundo) para fechar
    if (modal) {
        modal.addEventListener('click', (event) => {
            // Se o clique foi no próprio overlay (fundo) e não no conteúdo
            if (event.target === modal) {
                closeServiceModal();
            }
        });
    }

    // Código existente do menu hamburger (se estiver no mesmo arquivo)
    // ... (seu código do hamburger, etc.) ...

}); // Fim do DOMContentLoaded