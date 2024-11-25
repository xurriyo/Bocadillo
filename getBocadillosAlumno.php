<?php
header('Content-Type: application/json');
require 'Conexion.php';

try {
    // Obtener el nombre del alumno desde la petición
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

    // Obtener los bocadillos del día
    $queryBocadillos = "
        SELECT nombre_bocadillo, ingredientes, tipo_bocadillo, precio_venta_publico, alergenos 
        FROM bocadillo 
        WHERE dia_semana = dayname(now())";
    $stmtBocadillos = $db->prepare($queryBocadillos);
    $stmtBocadillos->execute();
    $bocadillos = $stmtBocadillos->fetchAll(PDO::FETCH_ASSOC);

    // Verificar si el alumno tiene un pedido para hoy
    $queryPedido = "
        SELECT id_bocadillo_pedido 
        FROM pedidos 
        WHERE id_alumno_bocadillo = :alumno AND fecha = date(now())";
    $stmtPedido = $db->prepare($queryPedido);
    $stmtPedido->bindParam(':alumno', $alumno);
    $stmtPedido->execute();
    $pedido = $stmtPedido->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'bocadillos' => $bocadillos,
        'pedido_actual' => $pedido['id_bocadillo_pedido'] ?? null,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los bocadillos: ' . $e->getMessage(),
    ]);
}
?>
