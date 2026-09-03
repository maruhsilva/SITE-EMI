<?php
session_start();

// Redireciona se já estiver logado
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: admin-dashboard');
    exit();
}

// Pega a mensagem de erro da sessão, se existir
$login_error = $_SESSION['login_error'] ?? null;
unset($_SESSION['login_error']); // Limpa a mensagem após exibir

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - Login</title>
    <link rel="stylesheet" href="admin.css"> </head>
<body class="login-page-wrapper"> <div class="login-card"> <div class="logo-container">
            <img src="Diana Psicóloga Logo (2).png" alt="Logo Fisio Emi"> </div>

        <h2>Área Administrativa</h2>

        <?php if ($login_error): ?>
            <div class="login-error"><?php echo htmlspecialchars($login_error); ?></div>
        <?php endif; ?>

      <form action="auth" method="POST">
    <div class="form-group">
        <label for="username">Usuário:</label>
        <input type="text" id="username" name="username" required>
    </div>
    
    <div class="form-group" style="position: relative;">
        <label for="password">Senha:</label>
        <input type="password" id="password" name="password" required>
        
        <div id="caps-warning" class="caps-tooltip">
            <i class="fa-solid fa-triangle-exclamation"></i> ⚠️ Caps Lock ativado
        </div>
    </div>
    
    <button type="submit" class="login-button">Entrar</button>
</form>

<script>
    const passwordInput = document.getElementById('password');
    const capsWarning = document.getElementById('caps-warning');

    function checkCaps(event) {
        if (event.getModifierState("CapsLock")) {
            capsWarning.classList.add('show'); // Usa classe para animar
        } else {
            capsWarning.classList.remove('show');
        }
    }

    passwordInput.addEventListener('keyup', checkCaps);
    passwordInput.addEventListener('click', checkCaps);
    passwordInput.addEventListener('focus', checkCaps); // Verifica ao entrar no campo
    passwordInput.addEventListener('blur', () => capsWarning.classList.remove('show')); // Esconde ao sair
</script>
</html>