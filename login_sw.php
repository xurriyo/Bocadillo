<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

session_start();
require 'Conexion.php';

login();

function login() {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if ($email && $password) {
        $db = DB::getInstance();
        $stmt = $db->prepare("SELECT * FROM usuario WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() === 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            // Verificación de contraseña con password_verify() para mayor seguridad
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_email'] = $user['email'];
                echo json_encode([
                    'success' => true,
                    'message' => "Login exitoso. Bienvenido"
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => "Contraseña incorrecta."
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => "Usuario incorrecto."
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => "Por favor, completa todos los campos."
        ]);
    }

    error_log(json_encode($data));

}
?>
