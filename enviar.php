<?php
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


// require 'vendor/autoload.php'; // Se estiver usando Composer

// Dados do formulário
$nome = $_POST['nome'];
$idade = $_POST['idade'];
$whatsapp = $_POST['whatsapp'];
$email = $_POST['email'];
$tipo = $_POST['tipo'];
$sessoes = $_POST['sessoes'];

// 1. Salva no banco de dados (opcional - já está funcionando em sua versão atual)
$host = "localhost";
$usuario = "root";       // ajuste conforme seu servidor
$senha = "";             // ajuste conforme seu servidor
$banco = "agendamentos";

$conn = new mysqli($host, $usuario, $senha, $banco);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$stmt = $conn->prepare("INSERT INTO orcamentos (nome, idade, whatsapp, email, tipo, sessoes) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sisssi", $nome, $idade, $whatsapp, $email, $tipo, $sessoes);
$stmt->execute();
$stmt->close();

// 2. Envio por email com PHPMailer
$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';


try {
    // Configurações do servidor SMTP (Gmail no exemplo)
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'marua.silva@gmail.com';
    $mail->Password   = 'xdak rouc pqup cehh'; // Gere aqui: https://myaccount.google.com/apppasswords
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->SMTPOptions = [
      'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true
      ]
];

    // Remetente e destinatário
    $mail->setFrom('marua.silva@gmail.com', 'Site Fisioterapia');
    $mail->addAddress('marua.desenvolvedor@gmail.com', 'Você'); // email de destino

    // Conteúdo do email
    $mail->isHTML(true);
    $mail->Subject = 'Novo pedido de orçamento de fisioterapia';
    $mail->Body    = "
      <h3>Novo orçamento recebido:</h3>
      <ul>
        <li><strong>Nome:</strong> $nome</li>
        <li><strong>Idade:</strong> $idade</li>
        <li><strong>WhatsApp:</strong> $whatsapp</li>
        <li><strong>Email:</strong> $email</li>
        <li><strong>Tipo de Consulta:</strong> $tipo</li>
        <li><strong>Quantidade de sessões:</strong> $sessoes</li>
      </ul>
    ";
    $mail->AltBody = "Nome: $nome\nIdade: $idade\nWhatsApp: $whatsapp\nEmail: $email\nTipo: $tipo\nSessões: $sessoes";

    $mail->send();

    echo "<script>alert('Orçamento enviado com sucesso!'); window.location.href='index.html';</script>";

} catch (Exception $e) {
    echo "<script>alert('Erro ao enviar o e-mail: {$mail->ErrorInfo}');</script>";
}

$conn->close();
?>
