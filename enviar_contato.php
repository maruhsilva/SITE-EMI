<?php
// Habilitar erros para debug (REMOVER EM PRODUÇÃO)
// ini_set('display_errors', 1); error_reporting(E_ALL);

require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Verifica se os dados foram enviados via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Obter e Validar Dados do Formulário
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $telefone = trim($_POST['telefone'] ?? ''); // Opcional
    $assunto = trim($_POST['assunto'] ?? '');
    $mensagem = trim($_POST['mensagem'] ?? '');

    // Validação básica (pode ser mais robusta)
    if (empty($nome) || empty($email) || empty($assunto) || empty($mensagem)) {
        echo "<script>alert('Erro: Por favor, preencha todos os campos obrigatórios.'); window.history.back();</script>";
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
         echo "<script>alert('Erro: Endereço de email inválido.'); window.history.back();</script>";
        exit;
    }

    // 2. Configurar e Enviar Email com PHPMailer
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
        $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];

        // Remetente e Destinatário
        $mail->setFrom('marua.silva@gmail.com', 'Site Fisio - Contato'); // Remetente (seu email)
        // ** DEFINA O EMAIL DA FISIOTERAPEUTA AQUI **
        $mail->addAddress('marua.desenvolvedor@gmail.com', 'Fisioterapeuta Emili'); // Destinatário
        $mail->addReplyTo($email, $nome); // Facilita responder diretamente ao remetente

        // Conteúdo do Email
        $mail->isHTML(true);
        $mail->Subject = 'Nova Mensagem de Contato do Site - ' . $assunto; // Assunto informativo
        
        // Corpo do email formatado
        $mail->Body    = "
          <h2>Nova mensagem recebida pelo formulário de contato:</h2>
          <hr>
          <p><strong>Nome:</strong> {$nome}</p>
          <p><strong>Email:</strong> {$email}</p>
          " . (!empty($telefone) ? "<p><strong>Telefone:</strong> {$telefone}</p>" : "") . " 
          <p><strong>Assunto:</strong> {$assunto}</p>
          <hr>
          <p><strong>Mensagem:</strong></p>
          <p>" . nl2br(htmlspecialchars($mensagem)) . "</p> 
          <hr>
          <p><small>Email enviado automaticamente pelo site.</small></p>
        ";
        
        // Corpo alternativo (texto puro)
        $mail->AltBody = "Nova mensagem de contato:\n\nNome: {$nome}\nEmail: {$email}\n" . (!empty($telefone) ? "Telefone: {$telefone}\n" : "") . "Assunto: {$assunto}\n\nMensagem:\n{$mensagem}\n\n--\nEnviado pelo site.";

        $mail->send();

        // Mensagem de sucesso e redirecionamento
        echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='index';</script>"; // Redireciona para Home

    } catch (Exception $e) {
        // Mensagem de erro
        echo "<script>alert('Erro ao enviar a mensagem. Tente novamente mais tarde. Detalhe: {$mail->ErrorInfo}'); window.history.back();</script>";
    }

} else {
    // Se não for POST, redireciona ou mostra erro
    // echo "<script>alert('Método de envio inválido.'); window.location.href='contato';</script>";
    header("Location: contato"); // Redireciona de volta para o formulário
    exit();
}
?>