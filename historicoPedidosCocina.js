function verificarAcceso() {
    const authKey = localStorage.getItem("auth_key");
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    if (!authKey || tipoUsuario !== 'cocina') {
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

    const filterButton = document.getElementById("filter-button");
    const resetButton = document.getElementById("reset-button");

    filterButton.addEventListener("click", function () {
        const column = document.getElementById("filter-column").value;
        const filterValue = document.getElementById("filter-value").value;

        if (filterValue.trim() === "") {
            mostrarError("Por favor, introduce un valor para filtrar.");
            return;
        }

        filtrarPorColumna(column, filterValue);
    });

    resetButton.addEventListener("click", function () {
        document.getElementById("filter-value").value = "";
        fetchHistorico(); // Restablecer la tabla con los datos originales
    });
});

function fetchHistorico() {
    ocultarError(); // Oculta errores previos
    fetch("sw_cocina.php?action=getHistoricoPedidosCocina") // Solicitar el histórico de pedidos
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                rellenarHistorico(data.pedidos); // Llenar la tabla
            } else {
                mostrarError("Error al cargar el histórico: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al cargar el histórico:", error);
            mostrarError("Hubo un error al cargar el histórico.");
        });
}

function rellenarHistorico(pedidos) {
    const tableBody = document.querySelector("#historico-table tbody");
    tableBody.innerHTML = ""; // Limpia las filas anteriores

    pedidos.forEach((pedido) => {
        const row = document.createElement("tr");

        // Crea celdas dinámicas
        const alumnoCell = document.createElement("td");
        alumnoCell.textContent = pedido.alumno;

        const cursoCell = document.createElement("td");
        cursoCell.textContent = pedido.curso;

        const bocadilloCell = document.createElement("td");
        bocadilloCell.textContent = pedido.bocadillo;

        const tipoCell = document.createElement("td");
        tipoCell.textContent = pedido.tipo;

        const precioCell = document.createElement("td");
        const precio = parseFloat(pedido.precio_pedido);
        precioCell.textContent = `${precio.toFixed(2)}€`;

        const fechaCell = document.createElement("td");
        fechaCell.textContent = pedido.fecha
            ? new Date(pedido.fecha).toLocaleDateString()
            : "Sin fecha";

        const fechaRecogidaCell = document.createElement("td");
        fechaRecogidaCell.textContent = pedido.fecha_recogida
            ? "Sí"
            : "No";

        // Añade celdas a la fila
        row.appendChild(alumnoCell);
        row.appendChild(cursoCell);
        row.appendChild(bocadilloCell);
        row.appendChild(tipoCell);
        row.appendChild(precioCell);
        row.appendChild(fechaCell);
        row.appendChild(fechaRecogidaCell);

        // Añade fila a la tabla
        tableBody.appendChild(row);
    });
}

function filtrarPorColumna(column, filterValue) {
    ocultarError();
    fetch("sw_cocina.php?action=getHistoricoPedidosCocina")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Filtrar los pedidos según el valor ingresado
                const pedidosFiltrados = data.pedidos.filter((pedido) => {
                    const value = pedido[column]?.toString().toLowerCase(); // Convertir a string y minúsculas
                    return value && value.includes(filterValue.toLowerCase());
                });

                rellenarHistorico(pedidosFiltrados);

                if (pedidosFiltrados.length === 0) {
                    mostrarError(`No se encontraron pedidos que coincidan con "${filterValue}".`);
                }
            } else {
                mostrarError("Error al cargar los pedidos: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al cargar los pedidos:", error);
            mostrarError("Hubo un error al filtrar los pedidos.");
        });
}

function mostrarError(mensaje) {
    const errorContainer = document.getElementById("error-message");
    errorContainer.textContent = mensaje; // Actualiza el texto del error
    errorContainer.classList.add("show"); // Muestra el contenedor
}

function ocultarError() {
    const errorContainer = document.getElementById("error-message");
    errorContainer.textContent = ""; // Limpia el mensaje
    errorContainer.classList.remove("show"); // Oculta el contenedor
}