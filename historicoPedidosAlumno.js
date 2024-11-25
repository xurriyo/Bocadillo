// Reutiliza la verificación de acceso
function verificarAcceso() {
    const authKey = localStorage.getItem("auth_key");
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    if (!authKey || tipoUsuario !== 'alumnado') {
        localStorage.setItem("error_message", "No tienes permisos para acceder a esta página.");
        window.location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem('auth_key');
    localStorage.removeItem('tipo_usuario');
    localStorage.removeItem('nombre_alumno');
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    fetchHistorico();

    // Asignar evento de clic a los encabezados para filtrar
    const headers = document.querySelectorAll("#historico-table th");
    headers.forEach((header) => {
        header.addEventListener("click", function () {
            const column = header.getAttribute("data-column");
            if (column) {
                filtrarPorColumna(column);
            }
        });
    })
});

function fetchHistorico() {
    const nombreAlumno = localStorage.getItem("nombre_alumno");

    if (!nombreAlumno) {
        alert("No se ha encontrado el nombre del alumno.");
        return;
    }

    fetch("getHistoricoPedidosAlumno.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ alumno: nombreAlumno }) // Enviar el nombre del alumno al PHP
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                populateHistorico(data.pedidos); // Llenar la tabla con los pedidos
            } else {
                alert("Error al cargar el histórico: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al cargar el histórico:", error);
            alert("Hubo un error al cargar el histórico.");
        });
}

function populateHistorico(pedidos) {
    const tableBody = document.querySelector("#historico-table tbody");
    tableBody.innerHTML = ""; // Limpia las filas anteriores

    pedidos.forEach((pedido) => {
        const row = document.createElement("tr");

        const bocadilloCell = document.createElement("td");
        bocadilloCell.textContent = pedido.bocadillo;

        const precioCell = document.createElement("td");
        const precio = parseFloat(pedido.precio_pedido);
        precioCell.textContent = isNaN(precio) ? "N/A" : `${precio.toFixed(2)}€`;

        const fechaCell = document.createElement("td");
        fechaCell.textContent = pedido.fecha
            ? new Date(pedido.fecha).toLocaleDateString()
            : "Sin fecha";

        const fechaRecogidaCell = document.createElement("td");
        fechaRecogidaCell.textContent = pedido.fecha_recogida
            ? "Sí"
            : "No";

        // Añade celdas a la fila
        row.appendChild(bocadilloCell);
        row.appendChild(precioCell);
        row.appendChild(fechaCell);
        row.appendChild(fechaRecogidaCell);

        // Añade fila a la tabla
        tableBody.appendChild(row);
    });
}

function filtrarPorColumna(column) {
    const nombreAlumno = localStorage.getItem("nombre_alumno");

    if (!nombreAlumno) {
        alert("No se ha encontrado el nombre del alumno.");
        return;
    }

    fetch("getHistoricoPedidosAlumno.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ alumno: nombreAlumno }) // Enviar el nombre del alumno al PHP
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Pedir al usuario el valor por el que filtrar
                const filterValue = prompt(`Introduce un valor para filtrar por ${column}:`);
                if (!filterValue) {
                    populateHistorico(data.pedidos); // Mostrar todos los pedidos si no hay filtro
                    return;
                }

                // Filtrar los pedidos devueltos
                const pedidosFiltrados = data.pedidos.filter((pedido) => {
                    const value = pedido[column]?.toString().toLowerCase(); // Convertir a string y minúsculas
                    return value && value.includes(filterValue.toLowerCase());
                });

                // Actualizar la tabla con los pedidos filtrados
                populateHistorico(pedidosFiltrados);

                if (pedidosFiltrados.length === 0) {
                    alert(`No se encontraron pedidos que coincidan con "${filterValue}".`);
                }
            } else {
                alert("Error al cargar los pedidos: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al cargar los pedidos:", error);
            alert("Hubo un error al filtrar los pedidos.");
        });
}