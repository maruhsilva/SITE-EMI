<?php
$conn = new mysqli("localhost", "root", "", "agendamentos");
$conn->set_charset("utf8mb4");
$id = $_GET['id'] ?? 0;
$stmt = $conn->prepare("SELECT * FROM blog_posts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$post = $stmt->get_result()->fetch_assoc();

if (!$post) die("Post não encontrado");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($post['titulo']); ?></title>
    <link rel="stylesheet" href="CSS/index.css">
    <script src="https://kit.fontawesome.com/43b36f20b7.js" crossorigin="anonymous"></script>
    <script defer src="JS/script.js"></script>
</head>
<body>
    <header id="main-header"> 
        <div class="logo"><img src="Diana Psicóloga Logo (11).png" alt="logo"></div>
        <nav>
          <a href="blog.php">Voltar ao Blog</a>
        </nav>
        <div class="hamburger">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <button class="agenda" onclick="window.location.href='agendamento.html'">
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

    <article class="post-single">
        <a href="blog.php" class="btn-voltar"><i class="fa-solid fa-arrow-left"></i> Voltar</a>
        
        <div class="post-meta">Publicado em <?php echo date('d/m/Y', strtotime($post['data_criacao'])); ?></div>
        
        <h1 style="font-size: 2.5rem; color: #505f75; margin-bottom: 20px;"><?php echo htmlspecialchars($post['titulo']); ?></h1>

        <?php if ($post['imagem']): ?>
            <img src="<?php echo htmlspecialchars($post['imagem']); ?>" alt="Capa">
        <?php endif; ?>

        <div class="post-content">
            <?php echo nl2br(htmlspecialchars($post['conteudo'])); ?>
        </div>
    </article>

</body>
</html>