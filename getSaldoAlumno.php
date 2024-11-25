<?php
header('Content-Type: application/json');
require 'Conexion.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $alumno = $data['alumno'] ?? null;

    if (!$alumno) {
        echo json_encode([
            'success' => false,
            'message' => 'Faltan datos necesarios: alumno.',
        ]);
        exit;
    }

    $db = DB::getInstance();

    $query = "SELECT monedero FROM alumno WHERE nombre = :alumno";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':alumno', $alumno);
    $stmt->execute();

    $saldo = $stmt->fetchColumn();

    if ($saldo === false) {
        echo json_encode([
            'success' => false,
            'message' => 'Alumno no encontrado.',
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'saldo' => $saldo,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage(),
    ]);
}
?>
