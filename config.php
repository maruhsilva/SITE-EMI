<?php
$host = "localhost";
$user = "root";  // Altere conforme seu ambiente
$password = "";
$dbname = "agendamentos";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
