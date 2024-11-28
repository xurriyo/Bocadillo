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

    if ($horaActual < $horaInicio || $horaActual > $horaFin) {
        echo json_encode([
            'success' => false,
            'message' => 'Los pedidos solo pueden realizarse entre las 9:00 y las 11:00.',
        ]);
        exit;
    }

    $db = DB::getInstance();

    // Verificar el saldo del alumno
    $querySaldo = "SELECT monedero FROM alumno WHERE nombre = :alumno";
    $stmtSaldo = $db->prepare($querySaldo);
    $stmtSaldo->bindParam(':alumno', $alumno);
    $stmtSaldo->execute();
    $saldo = $stmtSaldo->fetchColumn();

    if ($saldo === false) {
        echo json_encode([
            'success' => false,
            'message' => 'Alumno no encontrado.',
        ]);
        exit;
    }

    // Obtener el precio del bocadillo nuevo
    $queryPrecioNuevo = "SELECT precio_venta_publico FROM bocadillo WHERE nombre_bocadillo = :bocadillo";
    $stmtPrecioNuevo = $db->prepare($queryPrecioNuevo);
    $stmtPrecioNuevo->bindParam(':bocadillo', $bocadillo);
    $stmtPrecioNuevo->execute();
    $precioNuevo = $stmtPrecioNuevo->fetchColumn();

    if ($precioNuevo === false) {
        echo json_encode([
            'success' => false,
            'message' => 'Bocadillo no encontrado.',
        ]);
        exit;
    }

    // Verificar si el alumno ya tiene un pedido para hoy
    $queryCheck = "SELECT id_bocadillo_pedido FROM pedidos WHERE id_alumno_bocadillo = :alumno AND fecha = date(now())";
    $stmtCheck = $db->prepare($queryCheck);
    $stmtCheck->bindParam(':alumno', $alumno);
    $stmtCheck->execute();
    $pedidoExistente = $stmtCheck->fetchColumn();

    if ($pedidoExistente) {
        // Obtener el precio del bocadillo antiguo
        $queryPrecioAntiguo = "SELECT precio_venta_publico FROM bocadillo WHERE nombre_bocadillo = :bocadillo";
        $stmtPrecioAntiguo = $db->prepare($queryPrecioAntiguo);
        $stmtPrecioAntiguo->bindParam(':bocadillo', $pedidoExistente);
        $stmtPrecioAntiguo->execute();
        $precioAntiguo = $stmtPrecioAntiguo->fetchColumn();

        // Actualizar saldo (devolver precio antiguo y cobrar precio nuevo)
        $nuevoSaldo = $saldo + $precioAntiguo - $precioNuevo;
    } else {
        // Cobrar precio nuevo
        $nuevoSaldo = $saldo - $precioNuevo;
    }

    if ($nuevoSaldo < 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Saldo insuficiente en el monedero.',
        ]);
        exit;
    }

    // Actualizar el saldo del alumno
    $queryUpdateSaldo = "UPDATE alumno SET monedero = :nuevoSaldo WHERE nombre = :alumno";
    $stmtUpdateSaldo = $db->prepare($queryUpdateSaldo);
    $stmtUpdateSaldo->bindParam(':nuevoSaldo', $nuevoSaldo);
    $stmtUpdateSaldo->bindParam(':alumno', $alumno);
    $stmtUpdateSaldo->execute();

    if ($pedidoExistente) {
        // Actualizar el pedido existente
        $queryUpdatePedido = "
            UPDATE pedidos 
            SET id_bocadillo_pedido = :bocadillo, precio_pedido = :precioNuevo
            WHERE id_alumno_bocadillo = :alumno AND fecha = date(now())";
        $stmtUpdatePedido = $db->prepare($queryUpdatePedido);
        $stmtUpdatePedido->bindParam(':bocadillo', $bocadillo);
        $stmtUpdatePedido->bindParam(':precioNuevo', $precioNuevo);
        $stmtUpdatePedido->bindParam(':alumno', $alumno);
        $stmtUpdatePedido->execute();
    } else {
        // Insertar un nuevo pedido
        $queryInsertPedido = "
            INSERT INTO pedidos (id_alumno_bocadillo, id_bocadillo_pedido, precio_pedido, fecha) 
            VALUES (:alumno, :bocadillo, :precioNuevo, date(now()))";
        $stmtInsertPedido = $db->prepare($queryInsertPedido);
        $stmtInsertPedido->bindParam(':alumno', $alumno);
        $stmtInsertPedido->bindParam(':bocadillo', $bocadillo);
        $stmtInsertPedido->bindParam(':precioNuevo', $precioNuevo);
        $stmtInsertPedido->execute();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Pedido realizado y saldo actualizado con éxito.',
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage(),
    ]);
}
?>
