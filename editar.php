<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit();
}

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "agendamentos";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Verifica se um ID foi passado
if (!isset($_GET['id']) || empty($_GET['id'])) {
    die("ID inválido.");
}

$id = $_GET['id'];
$sql = "SELECT * FROM agendamentos WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$agendamento = $result->fetch_assoc();

if (!$agendamento) {
    die("Agendamento não encontrado.");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['nome'];
    $whatsapp = $_POST['whatsapp'];
    $data = $_POST['data'];
    $horario = $_POST['horario'];

    $sql = "UPDATE agendamentos SET nome=?, whatsapp=?, data=?, horario=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $nome, $whatsapp, $data, $horario, $id);

    if ($stmt->execute()) {
        echo "<script>alert('Agendamento atualizado com sucesso!'); window.location='admin-dashboard.php';</script>";
    } else {
        echo "Erro ao atualizar.";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Agendamento</title>
    <link rel="stylesheet" href="edit.css">
</head>
<body>
    <div class="container">
        <h2>Editar Agendamento</h2><br>
        <form method="POST">
            <label>Nome:</label>
            <input type="text" name="nome" value="<?php echo $agendamento['nome']; ?>" required>

            <label>WhatsApp:</label>
            <input type="text" name="whatsapp" value="<?php echo $agendamento['whatsapp']; ?>" required>

            <label>Data:</label>
            <input type="date" name="data" value="<?php echo $agendamento['data']; ?>" required>

            <label>Horário:</label>
            <input type="time" name="horario" value="<?php echo $agendamento['horario']; ?>" required>

            <button type="submit">Salvar Alterações</button>
            <a href="admin-dashboard.php" class="btn cancel">Cancelar</a>
        </form>
    </div>
</body>
</html>

<?php
$conn->close();
?>
