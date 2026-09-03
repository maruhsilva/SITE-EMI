<?php
// 1. Conexão e busca do último post
$conn = new mysqli("localhost", "root", "", "agendamentos");
$conn->set_charset("utf8mb4");

// Verifica se a tabela existe antes de consultar para evitar erros
$tabelaExiste = $conn->query("SHOW TABLES LIKE 'blog_posts'");
$latestPost = null;

if ($tabelaExiste && $tabelaExiste->num_rows > 0) {
    // Pega apenas 1 post, o mais recente
    $sql = "SELECT * FROM blog_posts ORDER BY data_criacao DESC LIMIT 1";
    $result = $conn->query($sql);
    if ($result) {
        $latestPost = $result->fetch_assoc();
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fisio Emi - Home</title>
    <script src="https://kit.fontawesome.com/43b36f20b7.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Belanosima:wght@400;600;700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fjalla+One&family=Gloock&family=Protest+Strike&family=Stack+Sans+Headline:wght@200..700&family=Tajawal:wght@200;300;400;500;700;800;900&family=Unna:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="CSS/index.css">
    <script defer src="JS/script.js"></script>
    <script defer src="JS/service-modal.js"></script>
    <script defer src="JS/scroll.js"></script>
</head>
<body>
    <header id="main-header"> 
        <div class="logo"><img src="Diana Psicóloga Logo (11).png" alt="logo" class="logo-inicial"><img src="Diana Psicóloga Logo (2).png" alt="Fisio Emi" class="logo-scrolada"></div>
        <nav>
          <a href="#inicio">Início</a>
          <a href="#servicos">Serviços</a>
          <a href="sobre">Sobre</a>
          <a href="blog.php">Blog</a>
          <a href="contato">Contato</a>
          <a href="http://localhost:5173/" target="_blank" style="color: #d4af37; font-weight: bold;">Cursos</a>
        </nav>
        <div class="hamburger">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <button class="agenda" onclick="window.location.href='agendamento'">
            <i class="fa-regular fa-calendar-days"></i> AGENDE AGORA
        </button>
    </header>
    
    <div class="menu-overlay"></div>

    <div class="menu">
      <button class="close-btn">&times;</button>
      <a href="index.php">Início</a>
      <a href="#servicos">Serviços</a>
      <a href="sobre">Sobre</a>
      <a href="blog.php">Blog</a>
      <a href="contato">Contato</a> 
      <a href="http://localhost:5173/" target="_blank" style="color: #d4af37; font-weight: bold;">Cursos da Fisio Emi</a>
      <a href="agendamento" class="agenda-mobile">
          <i class="fa-regular fa-calendar-days"></i> AGENDE AGORA
      </a>
    </div>
    
    <section id="inicio" class="hero">
      <video autoplay loop muted playsinline class="hero-video">
          <source src="0402(1).mp4" type="video/mp4">
          Seu navegador não suporta vídeos em HTML5.
      </video>
  
      <div class="hero-overlay"></div> 
  
      <div class="hero-content">
        <h1>
            Dedicação e excelência no 
            <span class="destaque-italico"> cuidado da Dor</span> e do <span class="destaque-italico">Movimento</span>
        </h1>
        
        <p class="hero-subtexto">
            Fisioterapia clínica especializada.
        </p>
      </div>
      <a href="#servicos" class="scroll-down"><i class="fa-solid fa-angles-down"></i></a>
    </section>
  
    <section id="servicos" class="servicos">
      <h2>Áreas de Atendimento</h2>
      <div class="servico-container">
          <div class="servico" data-service="reabilitacao">
              <i class="fa-solid fa-layer-group"></i>
              <h3>Fisioterapia em Coluna Vertebral</h3>
              <p>Tratamentos personalizados para recuperar movimentos e fortalecer o corpo.</p>
          </div>
          <div class="servico" data-service="esportiva">
              <i class="fa-solid fa-heartbeat"></i>
              <h3>Fisioterapia em Ortopedia e Traumatologia</h3>
              <p>Prevenção e recuperação de lesões para atletas e esportistas.</p>
          </div>
          <div class="servico" data-service="dor">
              <i class="fa-solid fa-heartbeat"></i>
              <h3>Terapia Manual e Recovery</h3>
              <p>Redução de dores musculares e articulares com técnicas especializadas.</p>
          </div>
          <div class="servico" data-service="pos-cirurgico">
              <i class="fa-solid fa-hand-holding-medical"></i>
              <h3>Pilates</h3>
              <p>Acelere sua recuperação com fisioterapia pós-operatória eficaz.</p>
          </div>
          <div class="servico" data-service="pos-cirurgico">
              <i class="fa-solid fa-hand-holding-medical"></i>
              <h3>Relaxamento e Bem-Estar</h3>
              <p>Acelere sua recuperação com fisioterapia pós-operatória eficaz.</p>
          </div>
      </div>
  </section>

  <div id="service-modal" class="modal-servico" style="display: none;">
      <div class="modal-servico-content">
          <span class="close-servico-btn">&times;</span>
          <h3 id="modal-servico-title">Título do Serviço</h3>
          <div id="modal-servico-video" class="video-placeholder">
              <p>Vídeo/Animação em breve!</p>
          </div>
          <p id="modal-servico-description">Descrição detalhada do serviço...</p>
      </div>
  </div>
  
  <section id="depoimentos" class="depoimentos">
        <h2>Relato de Pacientes</h2>
        <div class="depoimentos-container">

            <div class="depoimento-card">
                <div class="depoimento-img">
                    <i class="fa-solid fa-user-circle"></i> 
                    </div>
                <blockquote class="depoimento-texto">
                    "Depois de meses sofrendo com dor lombar, finalmente encontrei alívio com o tratamento da Dra. Emili. Profissional excelente e muito atenciosa. Recomendo demais!"
                </blockquote>
                <p class="patient-name">- Maria S.</p>
                <p class="patient-detail">(Dor Lombar Crônica)</p>
            </div>

            <div class="depoimento-card">
                 <div class="depoimento-img">
                     <i class="fa-solid fa-user-circle"></i> 
                 </div>
                <blockquote class="depoimento-texto">
                    "Tive uma lesão no joelho jogando futebol e achei que não voltaria a jogar. A fisioterapia esportiva foi fundamental na minha recuperação rápida e segura. Obrigado!"
                </blockquote>
                <p class="patient-name">- João P.</p>
                <p class="patient-detail">(Recuperação Pós-Lesão Esportiva)</p>
            </div>

            <div class="depoimento-card">
                 <div class="depoimento-img">
                     <i class="fa-solid fa-user-circle"></i> 
                 </div>
                <blockquote class="depoimento-texto">
                    "O atendimento domiciliar fez toda a diferença na recuperação da cirurgia do meu quadril. Muita competência e cuidado no conforto de casa."
                </blockquote>
                <p class="patient-name">- Carlos A.</p>
            </div>
            
        </div>
    </section>

    <?php if ($latestPost): ?>
    <section id="blog-home" class="blog-home-section">
        <div class="container-blog-home">
            <div class="blog-home-header">
                <span class="subtitulo">DICAS E SAÚDE</span>
                <h2>Últimas do Blog</h2>
            </div>

            <div class="blog-highlight-card">
                <div class="blog-highlight-img">
                    <?php if ($latestPost['imagem']): ?>
                        <img src="<?php echo htmlspecialchars($latestPost['imagem']); ?>" alt="Capa do Post">
                    <?php else: ?>
                        <div class="img-placeholder"><i class="fa-solid fa-image"></i></div>
                    <?php endif; ?>
                </div>
                
                <div class="blog-highlight-content">
                    <span class="date-badge">
                        <i class="fa-regular fa-calendar"></i> 
                        <?php echo date('d/m/Y', strtotime($latestPost['data_criacao'])); ?>
                    </span>
                    
                    <h3><?php echo htmlspecialchars($latestPost['titulo']); ?></h3>
                    
                    <p><?php echo substr(htmlspecialchars($latestPost['resumo']), 0, 150) . '...'; ?></p>
                    
                    <div class="blog-actions">
                        <a href="ver_post.php?id=<?php echo $latestPost['id']; ?>" class="btn-read-more">Ler Artigo Completo</a>
                        <a href="blog.php" class="link-all">Ver todos os posts <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <?php endif; ?>
    <a href="https://wa.me/55012981794612" target="_blank" class="whatsapp-button" title="Fale conosco no WhatsApp">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
      <div class="whatsapp-tooltip"></div>
  </a>

  <footer>
    <div class="footer-container" id="footer">
        <div class="footer-logo">
          <div class="logo"><img src="Diana Psicóloga Logo (11).png" alt="logo"></div>
            <p>Cuidando da sua saúde e bem-estar com dedicação.</p>
        </div>

        <div class="footer-links">
            <h3>Navegação</h3>
            <ul>
                <li><a href="index.php">Início</a></li> 
                <li><a href="index.php#sobre">Sobre</a></li>
                <li><a href="index.php#servicos">Serviços</a></li>
                <li><a href="agendamento">Agendamento</a></li>
                <li><a href="orcamentos">Orçamentos</a></li>
                <li><a href="contato">Contato</a></li> 
                <li><a href="http://localhost:5173/" target="_blank">Fisio Emi Academy (Cursos)</a></li>
                <li><a href="questionario_rmdq">Questionário</a></li>
                <li><a href="login" target="_blank">Área do ADM</a></li>
            </ul>
        </div>

        <div class="footer-social">
            <h3>Redes Sociais</h3>
            <div class="social-icons">
                <a href="https://www.instagram.com/emilimendes/" target="_blank"><i class="fa-brands fa-instagram"></i></a>
                <a href="" target="_blank"><i class="fa-brands fa-facebook"></i></a>
                <a href="https://wa.me/55012981794612" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
            <div class="footer-contact"><br><br>
            <h3>Contato</h3>
            <p><i class="fa-solid fa-phone"></i> (12) 98179-4612</p>
            <p><i class="fa-solid fa-envelope"></i> contato@fisioemili.com</p>
            <p><i class="fa-solid fa-location-dot"></i>São José dos Campos - SP</p>
        </div>
        </div>

        <div class="footer-payment">
            <h3>Pagamentos e Convênios</h3>
            <p class="payment-methods-title">Formas de Pagamento:</p>
            <div class="payment-icons">
                <span><i class="fa-brands fa-pix"></i> Pix</span>
                <span><i class="fa-regular fa-credit-card"></i> Cartão</span>
                <span><i class="fa-solid fa-money-bill-wave"></i> Dinheiro</span>
            </div>
            <p class="partnerships-title">Convênios Parceiros:</p>
            <div class="partnership-logos">
                 <span><strong>Wellhub</strong> (Gympass)</span>
                 <span><strong>Totalpass</strong></span>
            </div>
        </div>
    </div>

    <div class="footer-bottom">
        <p>&copy; 2025 Fisio Emi - Todos os direitos reservados. Desenvolvido por <a href="https://mswebwork.com.br" target="_blank" rel="noopener noreferrer" style="color: aliceblue;">MS WebWork</a></p>
    </div>
</footer>

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const whatsappButton = document.querySelector(".whatsapp-button");
        const footer = document.querySelector("footer");
      
        function checkPosition() {
            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (footerRect.top <= windowHeight) {
                whatsappButton.classList.add("fixed");
                whatsappButton.style.bottom = `${windowHeight - footerRect.top + 20}px`;
            } else {
                whatsappButton.classList.remove("fixed");
                whatsappButton.style.bottom = "20px";
            }
        }
      
        window.addEventListener("scroll", checkPosition);
        checkPosition(); 
      });
    </script>
</body>
</html>