<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "agendamentos";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Falha na conexão com o banco de dados"]));
}

$data = json_decode(file_get_contents("php://input"), true);

$nome = $data['nome'];
$whatsapp = $data['whatsapp'];
$horario = $data['horario'];
$data_agendamento = $data['data'];

if (empty($nome) || empty($whatsapp) || empty($horario) || empty($data_agendamento)) {
    echo json_encode(["error" => "Preencha todos os campos"]);
    exit;
}

$sql = "INSERT INTO agendamentos (nome, whatsapp, horario, data) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $nome, $whatsapp, $horario, $data_agendamento);

if ($stmt->execute()) {
    echo json_encode(["success" => "Agendamento realizado com sucesso!"]);
} else {
    echo json_encode(["error" => "Erro ao salvar agendamento"]);
}

$conn->close();
?>
