<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php"); exit();
}

$conn = new mysqli("localhost", "root", "", "agendamentos");
$conn->set_charset("utf8mb4");

$id = $_GET['id'] ?? null;
$titulo = ''; $resumo = ''; $conteudo = ''; $imagem = '';

// Se for edição, carrega dados
if ($id) {
    $stmt = $conn->prepare("SELECT * FROM blog_posts WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($post = $res->fetch_assoc()) {
        $titulo = $post['titulo'];
        $resumo = $post['resumo'];
        $conteudo = $post['conteudo'];
        $imagem = $post['imagem'];
    }
}

// Salvar Post
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = $_POST['titulo'];
    $resumo = $_POST['resumo'];
    $conteudo = $_POST['conteudo'];
    
    // Upload de Imagem
    if (!empty($_FILES['imagem']['name'])) {
        $target_dir = "uploads/";
        $nome_arquivo = time() . "_" . basename($_FILES["imagem"]["name"]);
        $target_file = $target_dir . $nome_arquivo;
        if (move_uploaded_file($_FILES["imagem"]["tmp_name"], $target_file)) {
            $imagem = $target_file;
        }
    }

    if ($id) {
        $sql = "UPDATE blog_posts SET titulo=?, resumo=?, conteudo=?, imagem=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssi", $titulo, $resumo, $conteudo, $imagem, $id);
    } else {
        $sql = "INSERT INTO blog_posts (titulo, resumo, conteudo, imagem) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $titulo, $resumo, $conteudo, $imagem);
    }

    if ($stmt->execute()) {
        header("Location: admin-blog.php");
        exit();
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editor de Post - Fisio Emi</title>
    <link rel="stylesheet" href="CSS/index.css">
</head>
<body style="background-color: #f4f4f4;">
    
    <div class="editor-container">
        <h2 style="color: #505f75; margin-bottom:20px;"><?php echo $id ? 'Editar Artigo' : 'Novo Artigo'; ?></h2>
        
        <form method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label>Título do Artigo</label>
                <input type="text" name="titulo" class="form-control" value="<?php echo htmlspecialchars($titulo); ?>" required>
            </div>

            <div class="form-group">
                <label>Resumo (aparece no card inicial)</label>
                <textarea name="resumo" class="form-control" style="min-height: 80px;" required><?php echo htmlspecialchars($resumo); ?></textarea>
            </div>

            <div class="form-group">
                <label>Imagem de Capa</label>
                <?php if($imagem): ?>
                    <img src="<?php echo $imagem; ?>" style="height: 100px; display:block; margin-bottom:10px;">
                <?php endif; ?>
                <input type="file" name="imagem" class="form-control" accept="image/*">
            </div>

            <div class="form-group">
                <label>Conteúdo Completo</label>
                <textarea name="conteudo" class="form-control" required><?php echo htmlspecialchars($conteudo); ?></textarea>
                <small style="color:#666;">Dica: Para pular linha, aperte Enter. O texto será formatado automaticamente.</small>
            </div>

            <div style="display:flex; gap:10px;">
                <button type="submit" class="btn-save">Salvar Publicação</button>
                <a href="admin-blog.php" style="padding: 12px 20px; text-decoration:none; color:#555;">Cancelar</a>
            </div>
        </form>
    </div>

</body>
</html>