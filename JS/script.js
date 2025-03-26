const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');
const overlay = document.querySelector('.menu-overlay');
const closeBtn = document.querySelector('.close-btn');

hamburger.addEventListener('click', () => {
  menu.classList.add('show');
  overlay.classList.add('show');
  hamburger.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  menu.classList.remove('show');
  overlay.classList.remove('show');
  hamburger.classList.remove('active');
});

overlay.addEventListener('click', () => {
  menu.classList.remove('show');
  overlay.classList.remove('show');
  hamburger.classList.remove('active');
});

function abrirCalendario() {
  document.getElementById('calendario-container').style.display = 'block';
  gerarCalendario();
}

function gerarCalendario() {
  const calendario = document.getElementById('calendario');
  calendario.innerHTML = '';
  for (let dia = 1; dia <= 31; dia++) {
      let divDia = document.createElement('div');
      divDia.classList.add('dia');
      divDia.innerText = dia;
      divDia.onclick = function() { abrirModal(dia); };
      calendario.appendChild(divDia);
  }
}

function abrirModal(dia) {
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('diaSelecionado').innerText = dia;
  carregarHorarios();
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

function carregarHorarios() {
  const horarios = document.getElementById('horarios');
  horarios.innerHTML = '';
  fetch('horarios.json')
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
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;
  const horario = document.getElementById('horarios').value;
  alert(`Agendado para ${nome}, ${whatsapp}, horário: ${horario}`);
  fecharModal();
}