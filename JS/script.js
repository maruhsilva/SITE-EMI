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

