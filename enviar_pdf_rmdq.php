<?php
// Habilitar exibição de erros (APENAS PARA DEBUG, remova em produção)
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

header('Content-Type: application/json');
// Se o seu JavaScript estiver em um domínio diferente do PHP (ex: localhost vs 127.0.0.1)
// header('Access-Control-Allow-Origin: *'); // Mantenha ou ajuste conforme necessário
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Lidar com requisições OPTIONS (pré-verificação CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir PHPMailer
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Receber dados JSON do JavaScript
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE); // true para array associativo

// Validar dados recebidos
if (!$input || !isset($input['nome']) || !isset($input['email']) || !isset($input['score']) || !isset($input['interpretacao']) || !isset($input['pdfData'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => 'Dados incompletos recebidos.']);
    exit();
}

$nomePaciente = $input['nome'];
$emailPaciente = $input['email'];
$scoreRMDQ = $input['score'];
$interpretacaoRMDQ = $input['interpretacao'];
$base64PdfData = $input['pdfData'];

// Decodificar o PDF Base64
$pdfDecoded = base64_decode($base64PdfData);
if ($pdfDecoded === false) {
     http_response_code(400);
     echo json_encode(['success' => false, 'error' => 'Falha ao decodificar dados do PDF.']);
     exit();
}

// Configurar PHPMailer
$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';

try {
    // Configurações SMTP (COPIE AS MESMAS DO SEU enviar.php)
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'marua.silva@gmail.com'; // SEU EMAIL GMAIL
    $mail->Password   = 'xdak rouc pqup cehh'; // SUA SENHA DE APP GERADA
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]]; // Mantenha se necessário

    // Remetente e Destinatário
    $mail->setFrom('marua.silva@gmail.com', 'Questionário RMDQ'); // Pode personalizar o nome
    // ** DEFINA O EMAIL DA FISIOTERAPEUTA AQUI **
    $mail->addAddress('emilimendesfisioo@outlook.com', 'Fisioterapeuta Êmili'); // Email de destino 

    // Anexar o PDF gerado
    // addStringAttachment(string $string, string $filename, string $encoding = 'base64', string $type = '', string $disposition = 'attachment')
    $nomeArquivoPDF = "Resultado_RMDQ_" . preg_replace('/[^A-Za-z0-9_\-]/', '_', $nomePaciente) . ".pdf";
    $mail->addStringAttachment($pdfDecoded, $nomeArquivoPDF, 'base64', 'application/pdf');

    // Conteúdo do Email
    $mail->isHTML(true);
    $mail->Subject = 'Novo Resultado do Questionário RMDQ (Dor Lombar) - ' . $nomePaciente;
    $mail->Body    = "
      <h3>Novo resultado do Questionário Roland-Morris recebido:</h3>
      <p>Um paciente preencheu o questionário no site.</p>
      <ul>
        <li><strong>Nome do Paciente:</strong> {$nomePaciente}</li>
        <li><strong>Email do Paciente:</strong> {$emailPaciente}</li>
        <li><strong>Pontuação RMDQ:</strong> {$scoreRMDQ} / 24</li>
        <li><strong>Nível de Incapacidade:</strong> {$interpretacaoRMDQ}</li>
      </ul>
      <p>O PDF com as respostas detalhadas está anexado a este email.</p>
      <p>--<br>Email enviado automaticamente pelo site.</p>
    ";
    $mail->AltBody = "Novo resultado do Questionário RMDQ:\nNome: {$nomePaciente}\nEmail: {$emailPaciente}\nScore: {$scoreRMDQ}/24\nNível: {$interpretacaoRMDQ}\nO PDF com detalhes está anexado.";

    $mail->send();
    
    // Resposta de Sucesso para o JavaScript
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    // Enviar a mensagem de erro detalhada do PHPMailer (cuidado em produção)
    echo json_encode(['success' => false, 'error' => "Erro ao enviar o e-mail: {$mail->ErrorInfo}"]); 
}

?>