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

function formatarNumeroWhatsapp($numero) {
    // Remove tudo que não for número
    $numero = preg_replace('/\D/', '', $numero);

    // Remove zero à esquerda se o número tiver DDD com 0 (ex: 0119...)
    if (preg_match('/^0\d+/', $numero)) {
        $numero = ltrim($numero, '0');
    }

    // Adiciona o código do país (Brasil = 55) se ainda não tiver
    if (strlen($numero) == 10 || strlen($numero) == 11) {
        $numero = '55' . $numero;
    }

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
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="container">
        <h2>Painel Administrativo</h2>
        <div class="btn-control" style="display: flex; align-itens: center; justify-content: center; gap: 1%;">
            <p><a href="index.html" target="_self" class="logout" style="background-color: #156402;">Home</a></p>
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
        $numeroLimpo = formatarNumeroWhatsapp($row['whatsapp']);
        $dataFormatada = date("d/m/Y", strtotime($row['data']));
        $horarioFormatado = date("H:i", strtotime($row['horario']));
        $mensagem = urlencode("Olá {$row['nome']}, estou entrando em contato para confirmar o agendamento no dia {$dataFormatada} às {$horarioFormatado} feito em nosso site.");
        $linkWhatsApp = "https://wa.me/{$numeroLimpo}?text={$mensagem}";

        echo "<tr>
                <td>{$row['id']}</td>
                <td>{$row['nome']}</td>
                <td>
                    <a href='{$linkWhatsApp}' target='_blank' class='whatsapp-link'>
                        <i class='fab fa-whatsapp'></i> {$row['whatsapp']}
                    </a>
                </td>

                <td>{$dataFormatada}</td>
                <td>{$horarioFormatado}</td>
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
