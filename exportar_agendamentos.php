<?php
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

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="agendamentos.ics"');

// Começa o calendário
echo "BEGIN:VCALENDAR\r\n";
echo "VERSION:2.0\r\n";
echo "CALSCALE:GREGORIAN\r\n";
echo "METHOD:PUBLISH\r\n";

$sql = "SELECT nome, data, horario FROM agendamentos";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data = date("Ymd", strtotime($row['data']));
        $hora = date("Hi", strtotime($row['horario']));
        $horaFim = date("Hi", strtotime('+1 hour', strtotime($row['horario'])));
        $uid = uniqid();

        echo "BEGIN:VEVENT\r\n";
        echo "UID:{$uid}@seusite.com\r\n";
        echo "DTSTART;TZID=America/Sao_Paulo:{$data}T{$hora}00\r\n";
        echo "DTEND;TZID=America/Sao_Paulo:{$data}T{$horaFim}00\r\n";
        echo "SUMMARY:Agendamento com {$row['nome']}\r\n";
        echo "DESCRIPTION:Agendamento registrado no sistema\r\n";
        echo "LOCATION:Online\r\n";
        echo "END:VEVENT\r\n";
    }
}

echo "END:VCALENDAR\r\n";
$conn->close();
?>
