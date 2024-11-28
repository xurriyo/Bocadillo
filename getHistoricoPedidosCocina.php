<?php
header('Content-Type: application/json');
require 'Conexion.php';

try {
    $db = DB::getInstance();
    $query = "
        SELECT 
            a.nombre AS alumno, 
            a.id_curso_alumno AS curso,
            b.nombre_bocadillo AS bocadillo, 
            b.tipo_bocadillo AS tipo,
            p.precio_pedido, 
            p.fecha, 
            p.fecha_recogida 
        FROM pedidos p
        JOIN alumno a ON p.id_alumno_bocadillo = a.nombre
        JOIN bocadillo b ON p.id_bocadillo_pedido = b.nombre_bocadillo
        ORDER BY p.fecha DESC";
    $stmt = $db->query($query);
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los pedidos: ' . $e->getMessage()
    ]);
}
?>
