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

    // Obter a data de hoje sem horário para comparação
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

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
        dataAtual.setHours(0, 0, 0, 0); // Remove horário para comparação

        // Bloquear domingos
        if (dataAtual.getDay() === 0) {
            divDia.classList.add('domingo');
            divDia.style.pointerEvents = 'none';
        } 
        // Bloquear dias passados
        else if (dataAtual < hoje) {
            divDia.classList.add('dia-passado');
            divDia.style.pointerEvents = 'none';
        } 
        // Permitir clique nos dias válidos
        else {
            divDia.onclick = function() { abrirModal(i); };
        }

        divDia.innerText = i;

        // Marcar o dia atual
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
        }, 100);
    }
}


function mudarMes(direcao) {
    mesAtual += direcao;
    if (mesAtual > 11) mesAtual = 0; // Se passar de Dezembro, volta para Janeiro
    if (mesAtual < 0) mesAtual = 11; // Se passar de Janeiro, vai para Dezembro
    gerarCalendario();
}

function abrirModal(dia) {
    const mes = mesAtual + 1; // Como o JS começa os meses em 0, precisamos somar 1
    const dataSelecionada = `${anoAtual}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('diaSelecionado').innerText = `${dia} de ${meses[mesAtual]}`;
    
    carregarHorarios(dataSelecionada);
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function carregarHorarios(data) {
    fetch(`obter_horarios.php?data=${data}`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("horarios");
            select.innerHTML = ""; // Limpa a lista antes de adicionar os novos horários

            if (data.erro) {
                console.error("Erro ao buscar horários:", data.erro);
                return;
            }

            let primeiroDisponivel = null;

            data.horarios.forEach(item => {
                const option = document.createElement("option");
                option.value = item.horario;
                option.textContent = item.horario;

                // 🔹 Se o horário já foi reservado ou passou do tempo permitido, ele fica desabilitado
                if (item.ocupado) {
                    option.disabled = true;
                    option.textContent += " (Indisponível)";
                } else if (!primeiroDisponivel) {
                    primeiroDisponivel = option.value; // Guarda o primeiro horário disponível
                }

                select.appendChild(option);
            });

            // 🔹 Se houver um horário disponível, definir como padrão
            if (primeiroDisponivel) {
                select.value = primeiroDisponivel;
            }
        })
        .catch(error => console.error("Erro ao buscar horários:", error));
}


function salvarAgendamento() {
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const horario = document.getElementById('horarios').value;
    const diaSelecionado = document.getElementById('diaSelecionado').innerText.split(" de ")[0]; 
    const mes = mesAtual + 1;
    const dataAgendamento = `${anoAtual}-${mes.toString().padStart(2, '0')}-${diaSelecionado.padStart(2, '0')}`;

    if (nome === '' || whatsapp === '' || horario === '') {
        alert('Por favor, preencha todos os campos antes de confirmar o agendamento.');
        return;
    }

    fetch('salvar_agendamento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp, horario, data: dataAgendamento })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.success);
            fecharModal();
            carregarHorarios(dataAgendamento);
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error('Erro ao salvar agendamento:', error));
}


// Inicializar o calendário ao carregar a página
window.onload = function() {
    gerarCalendario();
};

document.addEventListener("DOMContentLoaded", function () {
    let hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Define a data de hoje sem horário

    document.querySelectorAll(".dia").forEach(dia => {
        let dataString = dia.getAttribute("data-data"); // Pega a data do atributo

        if (dataString) {
            let [ano, mes, diaNumero] = dataString.split('-').map(Number);
            let dataDia = new Date(ano, mes - 1, diaNumero);
            dataDia.setHours(0, 0, 0, 0);

            if (dataDia < hoje) {
                dia.classList.add("dia-passado"); // Aplica estilo visual
                dia.onclick = null; // Remove evento de clique
                dia.style.pointerEvents = "none"; // Garante que não pode ser clicado
            }
        }
    });
});
