<?php
$conn = new mysqli("localhost", "root", "", "agendamentos");
$conn->set_charset("utf8mb4");
$sql = "SELECT * FROM blog_posts ORDER BY data_criacao DESC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - Fisio Emi</title>
    <link rel="stylesheet" href="CSS/index.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <script src="https://kit.fontawesome.com/43b36f20b7.js" crossorigin="anonymous"></script>
    <script defer src="JS/script.js"></script>
</head>
<body>
    <header id="main-header"> 
        <div class="logo"><img src="Diana Psicóloga Logo (11).png" alt="logo"></div>
        <nav>
          <a href="index">Início</a>
          <a href="index#servicos">Serviços</a>
          <a href="sobre">Sobre</a>
          <a href="contato">Contato</a>
          <a href="blog">Blog</a>
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
      <a href="index">Início</a>
      <a href="index#servicos">Serviços</a>
      <a href="sobre">Sobre</a>
      <a href="blog">Blog</a>
      <a href="contato">Contato</a> <a href="agendamento" class="agenda-mobile">
          <i class="fa-regular fa-calendar-days"></i> AGENDE AGORA
      </a>
    </div>

    <div class="blog-header">
        <h1>Blog de Fisioterapia & Bem-Estar</h1>
        <p>Dicas, novidades e informações para cuidar da sua saúde.</p>
    </div>

    <main class="blog-container">
        <?php if ($result && $result->num_rows > 0): ?>
            <?php while ($post = $result->fetch_assoc()): ?>
            <div class="blog-card">
                <?php if ($post['imagem']): ?>
                    <img src="<?php echo htmlspecialchars($post['imagem']); ?>" alt="Capa" class="blog-img">
                <?php else: ?>
                    <div style="height:200px; background:#eee; display:flex; align-items:center; justify-content:center; color:#ccc;">Sem Imagem</div>
                <?php endif; ?>
                
                <div class="blog-content">
                    <span class="blog-date"><?php echo date('d/m/Y', strtotime($post['data_criacao'])); ?></span>
                    <h3 class="blog-title"><?php echo htmlspecialchars($post['titulo']); ?></h3>
                    <p class="blog-summary"><?php echo htmlspecialchars($post['resumo']); ?></p>
                    <a href="ver_post.php?id=<?php echo $post['id']; ?>" class="blog-btn">Ler Artigo</a>
                </div>
            </div>
            <?php endwhile; ?>
        <?php else: ?>
            <p style="text-align:center; width:100%;">Nenhum artigo publicado ainda.</p>
        <?php endif; ?>
    </main>

    </body>
</html>