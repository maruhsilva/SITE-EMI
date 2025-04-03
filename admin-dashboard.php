<?php
session_start();

// Verifica se o administrador está logado
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit();
}

// Conexão com o banco de dados
$host = "localhost";
$user = "root"; // Substitua pelo seu usuário do banco
$pass = ""; // Substitua pela senha do banco
$dbname = "agendamentos";

$conn = new mysqli($host, $user, $pass, $dbname);

// Verifica conexão
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Consulta os agendamentos
$sql = "SELECT id, nome, whatsapp, data, horario FROM agendamentos ORDER BY data DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="container">
        <h2>Painel Administrativo</h2>
        <div class="btn-control" style="display: flex; align-itens: center; justify-content: center; gap: 1%;">
            <p><a href="index.html" class="logout" style="background-color: #156402;">Home</a></p>
            <p><a href="logout.php" class="logout">Sair</a></p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>WhatsApp</th>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        echo "<tr>
                                <td>{$row['id']}</td>
                                <td>{$row['nome']}</td>
                                <td>{$row['whatsapp']}</td>
                                <td>" . date("d/m/Y", strtotime($row['data'])) . "</td>
                                <td>" . date("H:i", strtotime($row['horario'])) . "</td>
                                <td>
                                    <a href='editar.php?id={$row['id']}' class='btn edit'>Editar</a>
                                    <a href='excluir.php?id={$row['id']}' class='btn delete' onclick='return confirm(\"Tem certeza que deseja excluir este agendamento?\")'>Excluir</a>
                                </td>
                              </tr>";
                    }
                } else {
                    echo "<tr><td colspan='6'>Nenhum agendamento encontrado.</td></tr>";
                }
                ?>
            </tbody>
        </table>
    </div>
</body>
</html>

<?php
$conn->close();
?>
