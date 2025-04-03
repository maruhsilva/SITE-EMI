<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

date_default_timezone_set('America/Sao_Paulo'); // 🔹 Garantir fuso horário correto

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "agendamentos";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["erro" => "Erro na conexão com o banco: " . $conn->connect_error]);
    die();
}

if (!isset($_GET['data']) || empty($_GET['data'])) {
    echo json_encode(["erro" => "Data não informada"]);
    die();
}

$data = $_GET['data'];
$hoje = date("Y-m-d");

// 🔹 Garantir que `$data` está no formato correto
$dataFormatada = date("Y-m-d", strtotime($data));

// 🔹 Debug: Exibir valores antes da comparação
if ($dataFormatada < $hoje) {
    echo json_encode([
        "erro" => "Não é possível agendar para datas passadas",
        "debug" => [
            "data_recebida" => $data,
            "data_formatada" => $dataFormatada,
            "hoje" => $hoje,
            "fuso_horario" => date_default_timezone_get()
        ]
    ]);
    die();
}

// 🔹 Buscar horários disponíveis
$sql = "
    SELECT DISTINCT h.horario, 
           EXISTS (SELECT 1 FROM agendamentos a WHERE a.horario = h.horario AND a.data = ?) AS ocupado
    FROM horarios_disponiveis h
    WHERE h.dia_id = (SELECT id FROM dias_disponiveis WHERE data = ?)
    ORDER BY h.horario ASC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["erro" => "Erro na query SQL: " . $conn->error]);
    die();
}

$stmt->bind_param("ss", $dataFormatada, $dataFormatada);
$stmt->execute();
$result = $stmt->get_result();

$horarios = [];
$horaAtual = date("H:i");

while ($row = $result->fetch_assoc()) {
    $horarioFormatado = substr($row['horario'], 0, 5);
    $ocupado = (bool) $row['ocupado'];

    // 🔹 Se for hoje, bloquear horários que passaram da margem de 4 horas
    if ($dataFormatada === $hoje) {
        $horaLimite = date("H:i", strtotime("-2 hours", strtotime($row['horario'])));
        if ($horaAtual > $horaLimite) {
            $ocupado = true;
        }
    }

    $horarios[] = [
        "horario" => $horarioFormatado,
        "ocupado" => $ocupado
    ];
}

echo json_encode(["horarios" => $horarios]);

$conn->close();
die();
?>
