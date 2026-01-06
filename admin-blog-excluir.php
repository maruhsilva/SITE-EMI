<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) header("Location: login.php");
$conn = new mysqli("localhost", "root", "", "agendamentos");
if (isset($_GET['id'])) {
    $stmt = $conn->prepare("DELETE FROM blog_posts WHERE id = ?");
    $stmt->bind_param("i", $_GET['id']);
    $stmt->execute();
}
header("Location: admin-blog.php");
?>