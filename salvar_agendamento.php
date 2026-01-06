<?php
// Desativa exibição de erros no HTML (segurança)
ini_set('display_errors', 0); 
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST");

try {
    // 1. Conexão com o Banco
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "agendamentos"; 

    // Habilita exceções para erros de banco
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8mb4"); // Garante acentos corretos (João, Manhã, etc)

    // 2. Receber dados
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        throw new Exception("Erro no envio dos dados.");
    }

    $nome = $data['nome'] ?? '';
    $whatsapp = $data['whatsapp'] ?? '';
    $horario = $data['horario'] ?? '';
    $data_agendamento = $data['data'] ?? '';

    // 3. Validação Simples
    if (empty($nome) || empty($whatsapp) || empty($horario) || empty($data_agendamento)) {
        throw new Exception("Por favor, preencha todos os campos.");
    }

    // 4. Inserção Segura
    $sql = "INSERT INTO agendamentos (nome, whatsapp, horario, data) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Erro interno ao processar agendamento.");
    }

    $stmt->bind_param("ssss", $nome, $whatsapp, $horario, $data_agendamento);

    if ($stmt->execute()) {
        // Formata a data para exibir na mensagem de sucesso (Ex: 07/01/2026)
        $data_br = date('d/m/Y', strtotime($data_agendamento));
        echo json_encode(["success" => "Agendamento confirmado para dia $data_br às $horario!"]);
    } else {
        throw new Exception("Não foi possível salvar o agendamento.");
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // Retorna mensagem de erro limpa (JSON)
    http_response_code(400); // Bad Request
    echo json_encode(["error" => $e->getMessage()]);
}
?>