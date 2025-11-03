<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login");
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

// 1. Busca os dados do agendamento específico
$sql = "SELECT * FROM agendamentos WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$agendamento = $result->fetch_assoc();
$stmt->close();

if (!$agendamento) {
    die("Agendamento não encontrado.");
}

// --- NOVA LÓGICA PARA BUSCAR HORÁRIOS ---
$data_do_agendamento = $agendamento['data'];
$horario_salvo_formatado = date("H:i", strtotime($agendamento['horario']));

// 2. Busca todos os horários VÁLIDOS para o dia do agendamento
// (Baseado na lógica do obter_horarios.php, mas buscando todos)
$sql_horarios = "
    SELECT DISTINCT h.horario 
    FROM horarios_disponiveis h
    JOIN dias_disponiveis d ON h.dia_id = d.id
    WHERE d.data = ?
    ORDER BY h.horario ASC
";

$stmt_horarios = $conn->prepare($sql_horarios);
$stmt_horarios->bind_param("s", $data_do_agendamento);
$stmt_horarios->execute();
$result_horarios = $stmt_horarios->get_result();

$lista_de_horarios_para_dropdown = [];
while ($row = $result_horarios->fetch_assoc()) {
    $lista_de_horarios_para_dropdown[] = date("H:i", strtotime($row['horario']));
}
$stmt_horarios->close();

// 3. Garantir que o horário já salvo esteja na lista
// (Caso o horário tenha sido removido dos "disponíveis" mas ainda exista no agendamento)
if (!in_array($horario_salvo_formatado, $lista_de_horarios_para_dropdown)) {
    $lista_de_horarios_para_dropdown[] = $horario_salvo_formatado;
    sort($lista_de_horarios_para_dropdown); // Reordena a lista
}
// --- FIM DA NOVA LÓGICA ---


// 4. Processa o formulário de atualização (POST)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['nome'];
    $whatsapp = $_POST['whatsapp'];
    $data = $_POST['data'];
    $horario = $_POST['horario']; // Agora virá do <select> no formato "HH:mm"

    // O formato "HH:mm" é aceito pelo tipo TIME/DATETIME do MySQL
    $sql = "UPDATE agendamentos SET nome=?, whatsapp=?, data=?, horario=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $nome, $whatsapp, $data, $horario, $id);

    if ($stmt->execute()) {
        echo "<script>alert('Agendamento atualizado com sucesso!'); window.location='admin-dashboard';</script>";
    } else {
        echo "Erro ao atualizar.";
    }
    $stmt->close();
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Agendamento</title>
    <link rel="stylesheet" href="admin.css"> 
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

    <header class="admin-header">
        <div class="logo-admin">
             <img src="Diana Psicóloga Logo (2).png" alt="Logo Fisio Emi">
        </div>
        <div class="admin-title">
             Painel Administrativo
        </div>
        <nav class="admin-nav">
            <a href="index" target="_blank"><i class="fa-solid fa-home"></i> Ver Site</a>
            <a href="logout" class="logout-link"><i class="fa-solid fa-right-from-bracket"></i> Sair</a>
        </nav>
    </header>

    <main class="container">
        <h2>Editar Agendamento (ID: <?php echo $id; ?>)</h2>
        
        <form class="edit-form" method="POST">
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($agendamento['nome']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="whatsapp">WhatsApp:</label>
                <input type="text" id="whatsapp" name="whatsapp" value="<?php echo htmlspecialchars($agendamento['whatsapp']); ?>" required>
            </div>

            <div class="form-group">
                <label for="data">Data:</label>
                <input type="date" id="data" name="data" value="<?php echo htmlspecialchars($agendamento['data']); ?>" required>
            </div>

            <div class="form-group">
                <label for="horario">Horário:</label>
                <select id="horario" name="horario" required>
                    <?php
                    if (empty($lista_de_horarios_para_dropdown)) {
                        // Caso de fallback se nenhum horário for encontrado
                        echo "<option value='{$horario_salvo_formatado}' selected>{$horario_salvo_formatado} (Salvo)</option>";
                    } else {
                        foreach ($lista_de_horarios_para_dropdown as $horario_opcao) {
                            // $horario_opcao já está em "HH:mm"
                            $selecionado = ($horario_opcao == $horario_salvo_formatado) ? 'selected' : '';
                            echo "<option value='{$horario_opcao}' {$selecionado}>{$horario_opcao}</option>";
                        }
                    }
                    ?>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-save"><i class="fa-solid fa-check"></i> Salvar Alterações</button>
                <a href="admin-dashboard" class="btn-cancel"><i class="fa-solid fa-times"></i> Cancelar</a>
            </div>
        </form>
    </main>

</body>
</html>