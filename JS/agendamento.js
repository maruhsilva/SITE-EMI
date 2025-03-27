const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let mesAtual = new Date().getMonth(); // Mês atual
const anoAtual = 2025;

// Obter a data atual
const hoje = new Date();
const diaAtual = hoje.getDate();
const mesAtualData = hoje.getMonth();
const anoAtualData = hoje.getFullYear();

// Função para gerar o calendário
function gerarCalendario() {
    const calendario = document.getElementById('calendario');
    const mesNome = document.getElementById('mes-atual');
    mesNome.innerText = `${meses[mesAtual]} de ${anoAtual}`;
    calendario.innerHTML = '';

    // Calcular o primeiro dia do mês e o número de dias
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaDaSemana = primeiroDia.getDay(); // Dia da semana em que o mês começa (0 = domingo)

    // Preencher os dias da semana
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let diaSemana of diasDaSemana) {
        let divDiaSemana = document.createElement('div');
        divDiaSemana.classList.add('dia');
        divDiaSemana.innerText = diaSemana;
        calendario.appendChild(divDiaSemana);
    }

    // Preencher os dias do mês com o alinhamento correto
    for (let i = 0; i < diaDaSemana; i++) {
        let divDiaVazio = document.createElement('div');
        divDiaVazio.classList.add('dia');
        calendario.appendChild(divDiaVazio);
    }

    let diaMarcado = -1; // Variável para marcar o dia atual
    let elementosDias = [];

    for (let i = 1; i <= diasNoMes; i++) {
        let divDia = document.createElement('div');
        divDia.classList.add('dia');
        const dataAtual = new Date(anoAtual, mesAtual, i);

        // Verificar se é domingo e bloquear o clique
        if (dataAtual.getDay() === 0) {
            divDia.classList.add('domingo');
            divDia.style.pointerEvents = 'none'; // Bloquear clique
        } else {
            divDia.onclick = function() { abrirModal(i); };
        }

        divDia.innerText = i;

        // Marcar o dia atual com uma cor diferente
        if (i === diaAtual && mesAtual === mesAtualData && anoAtual === anoAtualData) {
            divDia.classList.add('ativo');
            diaMarcado = i;
        }

        calendario.appendChild(divDia);
        elementosDias.push(divDia);
    }

    // Rolar para o dia atual automaticamente após o calendário ser gerado
    if (diaMarcado !== -1) {
        setTimeout(() => {
            // Encontrar o dia atual no calendário
            const indiceDiaMarcado = diaMarcado + diaDaSemana;
            if (elementosDias[indiceDiaMarcado]) {
                elementosDias[indiceDiaMarcado].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100); // Espera um pequeno tempo para garantir que o calendário tenha sido gerado
    }
}

function mudarMes(direcao) {
    mesAtual += direcao;
    if (mesAtual > 11) mesAtual = 0; // Se passar de Dezembro, volta para Janeiro
    if (mesAtual < 0) mesAtual = 11; // Se passar de Janeiro, vai para Dezembro
    gerarCalendario();
}

function abrirModal(dia) {
    document.getElementById('modal').style.display = 'flex';

    // Exibir o dia e o mês na modal
    document.getElementById('diaSelecionado').innerText = `${dia} de ${meses[mesAtual]}`;

    carregarHorarios();
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function carregarHorarios() {
    const horarios = document.getElementById('horarios');
    horarios.innerHTML = '<option value="">Selecione um horário</option>'; // Garante que a opção inicial esteja visível

    fetch('horarios.json') // Substitua essa URL pela sua API de horários
        .then(response => response.json())
        .then(data => {
            data.horarios.forEach(horario => {
                let option = document.createElement('option');
                option.value = horario;
                option.innerText = horario;
                horarios.appendChild(option);
            });
        });
}

function salvarAgendamento() {
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const horario = document.getElementById('horarios').value;

    if (nome === '' || whatsapp === '' || horario === '') {
        alert('Por favor, preencha todos os campos antes de confirmar o agendamento.');
        return;
    }

    alert(`Agendado para ${nome}, WhatsApp: ${whatsapp}, Data: ${document.getElementById('diaSelecionado').innerText}, Horário: ${horario}`);
    fecharModal();
}

// Inicializar o calendário ao carregar a página
window.onload = function() {
    gerarCalendario();
};
