<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "config.php";

// Buscar dias e horários disponíveis
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT h.id, d.data, h.horario FROM horarios_disponiveis h
            JOIN dias_disponiveis d ON h.dia_id = d.id
            WHERE h.ocupado = 0 ORDER BY d.data, h.horario";

    $result = $conn->query($sql);
    $horarios = [];

    while ($row = $result->fetch_assoc()) {
        $horarios[] = $row;
    }

    

    echo json_encode(["horarios" => $horarios]);
}

// Registrar um agendamento
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_horario = $data["id_horario"];

    $sql = "UPDATE horarios_disponiveis SET ocupado = 1 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_horario);
    
    if ($stmt->execute()) {
        echo json_encode(["mensagem" => "Agendamento realizado com sucesso"]);
    } else {
        echo json_encode(["erro" => "Erro ao agendar"]);
    }
}

$conn->close();
?>
