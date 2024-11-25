<?php
header('Content-Type: application/json');
require 'Conexion.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $alumno = $data['alumno'] ?? null;
    $bocadillo = $data['bocadillo'] ?? null;

    if (!$alumno || !$bocadillo) {
        echo json_encode([
            'success' => false,
            'message' => 'Faltan datos necesarios: alumno y/o bocadillo.',
        ]);
        exit;
    }

    // Obtener la hora actual
    $horaActual = new DateTime('now', new DateTimeZone('Europe/Madrid'));
    $horaInicio = new DateTime('09:00', new DateTimeZone('Europe/Madrid'));
    $horaFin = new DateTime('11:00', new DateTimeZone('Europe/Madrid'));

    // Verificar si la hora actual está fuera del rango permitido
    if ($horaActual < $horaInicio || $horaActual > $horaFin) {
        echo json_encode([
            'success' => false,
            'message' => 'Los pedidos solo pueden realizarse entre las 9:00 AM y las 11:00 AM.',
        ]);
        exit;
    }

    $db = DB::getInstance();

    // Verificar si el alumno ya tiene un pedido para hoy
    $queryCheck = "SELECT id_bocadillo_pedido FROM pedidos WHERE id_alumno_bocadillo = :alumno AND fecha = date(now())";
    $stmtCheck = $db->prepare($queryCheck);
    $stmtCheck->bindParam(':alumno', $alumno);
    $stmtCheck->execute();

    if ($stmtCheck->rowCount() > 0) {
        // Realizar un UPDATE si ya existe un pedido
        $queryUpdate = "
            UPDATE pedidos 
            SET id_bocadillo_pedido = :bocadillo, precio_pedido = (
                SELECT precio_venta_publico FROM bocadillo WHERE nombre_bocadillo = :bocadillo
            )
            WHERE id_alumno_bocadillo = :alumno AND fecha = date(now())";
        $stmtUpdate = $db->prepare($queryUpdate);
        $stmtUpdate->bindParam(':alumno', $alumno);
        $stmtUpdate->bindParam(':bocadillo', $bocadillo);
        $stmtUpdate->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Pedido actualizado con éxito.',
        ]);
    } else {
        // Realizar un INSERT si no existe un pedido
        $queryInsert = "
            INSERT INTO pedidos (id_alumno_bocadillo, id_bocadillo_pedido, precio_pedido, fecha) 
            VALUES (:alumno, :bocadillo, (
                SELECT precio_venta_publico FROM bocadillo WHERE nombre_bocadillo = :bocadillo
            ), date(now()))";
        $stmtInsert = $db->prepare($queryInsert);
        $stmtInsert->bindParam(':alumno', $alumno);
        $stmtInsert->bindParam(':bocadillo', $bocadillo);
        $stmtInsert->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Pedido registrado con éxito.',
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage(),
    ]);
}
?>
