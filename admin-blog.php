<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php"); exit();
}

$host = "localhost"; $user = "root"; $pass = ""; $dbname = "agendamentos";
$conn = new mysqli($host, $user, $pass, $dbname);
// Busca posts ordenados pelo mais recente
$sql = "SELECT * FROM blog_posts ORDER BY data_criacao DESC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Blog - Fisio Emi</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="admin.css"> <link rel="stylesheet" href="CSS/index.css"> </head>
<body>
    <header class="admin-header">
        <div class="logo-admin"><img src="Diana Psicóloga Logo (2).png" alt="Logo"></div>
        <div class="admin-title">Gerenciador do Blog</div>
        <nav class="admin-nav">
            <a href="admin-dashboard.php"><i class="fa-solid fa-arrow-left"></i> Voltar aos Agendamentos</a>
            <a href="logout.php"><i class="fa-solid fa-right-from-bracket"></i> Sair</a>
        </nav>
    </header>

    <main class="container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>Artigos Publicados</h2>
            <a href="admin-blog-editar.php" class="btn-save" style="background-color: #cba788; text-decoration:none;">
                <i class="fa-solid fa-plus"></i> Novo Artigo
            </a>
        </div>

        <div class="dashboard-table-container">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                <?php if ($result && $result->num_rows > 0): ?>
                    <?php while ($row = $result->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo $row['id']; ?></td>
                        <td><?php echo htmlspecialchars($row['titulo']); ?></td>
                        <td><?php echo date('d/m/Y', strtotime($row['data_criacao'])); ?></td>
                        <td>
                            <div class='action-buttons'>
                                <a href="admin-blog-editar.php?id=<?php echo $row['id']; ?>" class="action-btn btn-edit"><i class="fa-solid fa-pen"></i> Editar</a>
                                <a href="admin-blog-excluir.php?id=<?php echo $row['id']; ?>" class="action-btn btn-delete" onclick="return confirm('Tem certeza?')"><i class="fa-solid fa-trash"></i> Excluir</a>
                            </div>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                <?php else: ?>
                    <tr><td colspan="4">Nenhum post encontrado.</td></tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>