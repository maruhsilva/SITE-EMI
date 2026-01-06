// JS/agendamento.js (Versão 2.0 - Corrigido para CSS Unificado)

// Constantes e estado global
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let dataAtualJS = new Date(); // Usa a data real do computador
let mesAtual = dataAtualJS.getMonth();
let anoAtual = dataAtualJS.getFullYear();
let diaAtual = -1;
let mesAtualData = -1;
let anoAtualData = -1;

// Função para gerar o calendário
function gerarCalendario() {
    const calendario = document.getElementById('calendario');
    const mesNome = document.getElementById('mes-atual');
    
    if (!calendario || !mesNome) {
        console.error("Elementos do calendário (calendario, mes-atual) não encontrados.");
        return;
    }

    mesNome.innerText = `${meses[mesAtual]} de ${anoAtual}`;
    calendario.innerHTML = ''; // Limpa o calendário anterior

    // Obter a data atual
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera o horário para comparação
    diaAtual = hoje.getDate();
    mesAtualData = hoje.getMonth();
    anoAtualData = hoje.getFullYear();

    // Calcular o primeiro dia do mês e o número de dias
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaDaSemana = primeiroDia.getDay(); // Dia da semana em que o mês começa (0 = domingo)

    // Preencher os dias vazios do início do mês
    for (let i = 0; i < diaDaSemana; i++) {
        let divDiaVazio = document.createElement('div');
        divDiaVazio.classList.add('dia');
        divDiaVazio.style.pointerEvents = 'none'; 
        divDiaVazio.style.background = 'transparent'; 
        // Remover sombra se a classe .dia tiver
        divDiaVazio.style.boxShadow = 'none'; 
        calendario.appendChild(divDiaVazio);
    }

    // Preencher os dias do mês
    for (let i = 1; i <= diasNoMes; i++) {
        let divDia = document.createElement('div');
        divDia.classList.add('dia');
        
        const dataAtualIteracao = new Date(anoAtual, mesAtual, i);
        dataAtualIteracao.setHours(0, 0, 0, 0); // Zera horário para comparação

        // 1. Bloquear domingos
        if (dataAtualIteracao.getDay() === 0) {
            divDia.classList.add('domingo');
            divDia.style.pointerEvents = 'none';
        } 
        // 2. Bloquear dias passados
        else if (dataAtualIteracao < hoje) {
            divDia.classList.add('dia-passado');
            divDia.style.pointerEvents = 'none';
        } 
        // 3. Permitir clique nos dias válidos
        else {
            divDia.onclick = function() { 
                abrirModal(i); 
            };
        }

        divDia.innerText = i;

        // Marcar o dia atual
        if (i === diaAtual && mesAtual === mesAtualData && anoAtual === anoAtualData) {
            divDia.classList.add('ativo');
        }

        calendario.appendChild(divDia);
    }
}

function mudarMes(direcao) {
    mesAtual += direcao;
    // Lógica para virar o ano
    if (mesAtual > 11) { 
        mesAtual = 0; // Janeiro
        anoAtual++;   // Próximo ano
    } 
    if (mesAtual < 0) { 
        mesAtual = 11; // Dezembro
        anoAtual--;    // Ano anterior
    }
    
    gerarCalendario();
}

// --- FUNÇÕES DO MODAL (ATUALIZADAS PARA USAR .show) ---

function abrirModal(dia) {
    const modal = document.getElementById('modal');
    const diaSelecionadoSpan = document.getElementById('diaSelecionado');
    
    if (!modal || !diaSelecionadoSpan) {
        console.error("Elementos do modal (modal, diaSelecionado) não encontrados.");
        return;
    }
    
    diaSelecionadoSpan.innerText = `${dia} de ${meses[mesAtual]}`;
    
    document.getElementById('nome').value = '';
    document.getElementById('whatsapp').value = '';
    const selectHorarios = document.getElementById('horarios');
    if (selectHorarios) {
        selectHorarios.innerHTML = '<option value="">Carregando...</option>';
        selectHorarios.disabled = true; 
    }

    // **A LÓGICA CORRETA**
    modal.classList.add('show');
    
    const mesFormatado = (mesAtual + 1).toString().padStart(2, '0');
    const diaFormatado = dia.toString().padStart(2, '0');
    const dataSelecionada = `${anoAtual}-${mesFormatado}-${diaFormatado}`;
    
    carregarHorarios(dataSelecionada);
}

function fecharModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        // **A LÓGICA CORRETA**
        modal.classList.remove('show');
    }
}

function fecharModalAoClicarFora(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        fecharModal();
    }
}

// --- FIM FUNÇÕES DO MODAL ---

function carregarHorarios(data) {
    const select = document.getElementById("horarios");
    if (!select) return;

    // Use o caminho correto para o seu script PHP
    fetch(`obter_horarios.php?data=${data}`) 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.status} ${response.statusText}`);
            }
            return response.json(); 
        })
        .then(data => {
            select.innerHTML = ""; // Limpa o "Carregando..."
            select.disabled = false; 

            if (data.erro) {
                console.error("Erro retornado pelo PHP:", data.erro);
                select.innerHTML = `<option value="">${data.erro}</option>`;
                select.disabled = true;
                return;
            }

            if (data.horarios && data.horarios.length > 0) {
                let primeiroDisponivel = null;
                let algumHorarioDisponivel = false;

                data.horarios.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.horario;
                    option.textContent = item.horario;

                    if (item.ocupado) {
                        option.disabled = true;
                        option.textContent += " (Indisponível)";
                    } else {
                        algumHorarioDisponivel = true;
                        if (!primeiroDisponivel) {
                            primeiroDisponivel = option.value;
                        }
                    }
                    select.appendChild(option);
                });

                if (primeiroDisponivel) {
                    select.value = primeiroDisponivel;
                }
                
                if (!algumHorarioDisponivel) {
                    select.innerHTML = '<option value="">Nenhum horário disponível</option>';
                    select.disabled = true;
                }
            } else {
                 select.innerHTML = '<option value="">Nenhum horário cadastrado</option>';
                 select.disabled = true;
            }
        })
        .catch(error => {
            console.error("Erro no fetch ao buscar horários:", error);
            select.innerHTML = '<option value="">Erro ao carregar</option>';
            select.disabled = true;
        });
}

function salvarAgendamento() {
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const horario = document.getElementById('horarios').value;
    const diaSelecionado = document.getElementById('diaSelecionado').innerText.split(" de ")[0]; 
    const mesFormatado = (mesAtual + 1).toString().padStart(2, '0');
    const diaFormatado = diaSelecionado.toString().padStart(2, '0');
    const dataAgendamento = `${anoAtual}-${mesFormatado}-${diaFormatado}`;

    if (nome === '' || whatsapp === '' || horario === '') {
        alert('Por favor, preencha todos os campos antes de confirmar o agendamento.');
        return;
    }

    const btnConfirmar = document.querySelector(".modal-content button");
    if (btnConfirmar) btnConfirmar.disabled = true;

    // Use o caminho correto para o seu script PHP
    fetch('salvar_agendamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp, horario, data: dataAgendamento })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.success);
            fecharModal();
            // Atualiza os horários para o dia, mostrando que o selecionado agora está indisponível
            carregarHorarios(dataAgendamento);
        } else {
            alert(data.error || "Ocorreu um erro desconhecido.");
        }
    })
    .catch(error => {
        console.error('Erro ao salvar agendamento:', error);
        alert("Erro de conexão ao tentar salvar.");
    })
    .finally(() => {
         if (btnConfirmar) btnConfirmar.disabled = false;
    });
}

// Inicializar o calendário ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    // Garante que o script.js (menu, etc.) já tenha rodado se necessário
    // Chama o gerarCalendario
    gerarCalendario();
});