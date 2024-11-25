<?php
header('Content-Type: application/json');
require 'Conexion.php';

try {
    // Obtener los datos enviados por POST (nombre del alumno)
    $data = json_decode(file_get_contents('php://input'), true);
    $alumno = $data['alumno'] ?? null;

    if (!$alumno) {
        echo json_encode([
            'success' => false,
            'message' => 'Faltan datos: alumno.',
        ]);
        exit;
    }

    $db = DB::getInstance();
    $query = "
        SELECT 
            a.nombre AS alumno, 
            b.nombre_bocadillo AS bocadillo, 
            p.precio_pedido, 
            p.fecha, 
            p.fecha_recogida 
        FROM pedidos p
        JOIN alumno a ON p.id_alumno_bocadillo = a.nombre
        JOIN bocadillo b ON p.id_bocadillo_pedido = b.nombre_bocadillo 
        WHERE a.nombre = :alumno
        ORDER BY p.fecha DESC
    ";

    // Preparar la consulta SQL
    $stmt = $db->prepare($query);

    // Vincular el parámetro al valor del nombre del alumno
    $stmt->bindParam(':alumno', $alumno, PDO::PARAM_STR);

    // Ejecutar la consulta
    $stmt->execute();

    // Obtener los resultados
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
