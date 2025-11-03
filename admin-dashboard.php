<?php
session_start();

// Verifica se o administrador está logado
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit();
}

// Conexão com o banco de dados
$host = "localhost";
$user = "root"; 
$pass = ""; 
$dbname = "agendamentos";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) { die("Erro na conexão: " . $conn->connect_error); }

// Consulta os agendamentos (ordenar por data e horário)
$sql = "SELECT id, nome, whatsapp, data, horario FROM agendamentos ORDER BY data ASC, horario ASC"; // Ordena ASC para ver próximos primeiro
$result = $conn->query($sql);

function formatarNumeroWhatsapp($numero) {
    $numero = preg_replace('/\D/', '', $numero);
    if (preg_match('/^0\d+/', $numero)) { $numero = ltrim($numero, '0'); }
    if (strlen($numero) == 10 || strlen($numero) == 11) { $numero = '55' . $numero; }
    return $numero;
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fisio Emi - Painel Administrativo</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="admin.css"> </head>
<body>

    <header class="admin-header">
        <div class="logo-admin">
             <img src="Diana Psicóloga Logo (2).png" alt="Logo Fisio Emi"> </div>
        <div class="admin-title">
             Painel Administrativo
        </div>
        <nav class="admin-nav">
            <a href="index.html" target="_blank"><i class="fa-solid fa-home"></i> Ver Site</a>
            <a href="logout.php"><i class="fa-solid fa-right-from-bracket"></i> Sair</a>
        </nav>
    </header>

    <main class="container"> <h2>Agendamentos Recebidos</h2>
        
        <div class="dashboard-table-container"> <table class="dashboard-table"> <thead>
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
                if ($result && $result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $numeroLimpo = formatarNumeroWhatsapp($row['whatsapp']);
                        $dataObj = DateTime::createFromFormat('Y-m-d', $row['data']);
                        $dataFormatada = $dataObj ? $dataObj->format('d/m/Y') : 'Data inválida';
                        $horarioObj = DateTime::createFromFormat('H:i:s', $row['horario']);
                        $horarioFormatado = $horarioObj ? $horarioObj->format('H:i') : 'Horário inválido';
                    
                        $mensagem = urlencode("Olá {$row['nome']}, confirmo seu agendamento para {$dataFormatada} às {$horarioFormatado}. Att, Fisio Emili.");
                        $linkWhatsApp = "https://wa.me/{$numeroLimpo}?text={$mensagem}";
                    
                        // Adicionado "data-label" em cada <td> para responsividade
                        echo "<tr>
                                <td data-label='ID'>{$row['id']}</td>
                                <td data-label='Nome'>" . htmlspecialchars($row['nome']) . "</td> 
                                <td data-label='WhatsApp'>
                                    <a href='{$linkWhatsApp}' target='_blank' class='whatsapp-link' title='Confirmar via WhatsApp'>
                                        <i class='fab fa-whatsapp'></i> " . htmlspecialchars($row['whatsapp']) . "
                                    </a>
                                </td>
                                <td data-label='Data'>{$dataFormatada}</td>
                                <td data-label='Horário'>{$horarioFormatado}</td>
                                <td data-label='Ações'>
                                    <div class='action-buttons'>
                                        <a href='editar.php?id={$row['id']}' class='action-btn btn-edit' title='Editar Agendamento'><i class='fa-solid fa-pen-to-square'></i> Editar</a>
                                        <a href='excluir.php?id={$row['id']}' class='action-btn btn-delete' title='Excluir Agendamento' onclick='return confirm(\"Tem certeza que deseja excluir este agendamento?\")'><i class='fa-solid fa-trash-can'></i> Excluir</a>
                                    </div>
                                </td>
                              </tr>";
                    }
                } else {
                    echo "<tr><td colspan='6' style='text-align: center; padding: 20px;'>Nenhum agendamento encontrado.</td></tr>";
                }
                ?>
                </tbody>
            </table>
        </div> </main> </body>
</html>

<?php
if ($conn) { $conn->close(); }
?>