<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Conectar a la base de datos
require 'Conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

// Log para verificar los datos recibidos
error_log("Datos recibidos en el backend: " . print_r($data, true));

// Validar los datos recibidos
$alumno = $data['alumno'] ?? null;
$fecha = $data['fecha'] ?? null;

if (!$alumno || !$fecha) {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos necesarios: alumno y/o fecha.',
    ]);
    exit;
}

try {
    $db = DB::getInstance();

    // Actualizar la fecha_recogida a la fecha actual para el pedido correspondiente
    $stmt = $db->prepare("UPDATE pedidos SET fecha_recogida = date(NOW()) WHERE id_alumno_bocadillo = :alumno AND fecha = :fecha");
    $stmt->bindParam(':alumno', $alumno);
    $stmt->bindParam(':fecha', $fecha);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Fecha de recogida actualizada.',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar la fecha de recogida.',
        ]);
    }
} catch (Exception $e) {
    error_log("Error en el backend: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor. Por favor, intenta más tarde.',
    ]);
}
