// verificar que el usuario es de cocina
function verificarAcceso() {
    const authKey = localStorage.getItem("auth_key");
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    // Verificar si el auth_key existe y si el tipoUsuario es cocina
    if (!authKey || tipoUsuario !== 'cocina') {
        // Guardar el mensaje de error en localStorage
        localStorage.setItem("error_message", "No tienes permisos para acceder a esta página.");

        window.location.href = "index.html"; // Redirigir si no cumple los permisos
    }
}

// función para cerrar sesión
function logout() {
    // Elimina los datos del localStorage
    localStorage.removeItem('auth_key');
    localStorage.removeItem('tipo_usuario');
    localStorage.removeItem('nombre_alumno'); // Si existiera este dato

    // Redirige al index.html
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    fetchPedidos();

    const filterButton = document.getElementById("filter-button");
    const resetButton = document.getElementById("reset-button");

    filterButton.addEventListener("click", function (event) {
        event.preventDefault();
        const column = document.getElementById("filter-column").value; // Verifica el valor
        const filterValue = document.getElementById("filter-value").value.trim(); // Limpia espacios

        if (!column || filterValue === "") {
            mostrarError("Por favor, selecciona una columna válida e introduce un valor para filtrar.");
            return;
        }

        filtrarPorColumna(column, filterValue);
    });


    resetButton.addEventListener("click", function (event) {
        event.preventDefault(); // Evita que el formulario se envíe
        document.getElementById("filter-value").value = "";
        fetchPedidos(); // Restablecer la tabla con los datos originales
    });
});

function fetchPedidos() {
    ocultarError();
    fetch("sw_cocina.php?action=getPedidos")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Mostrar resumen de bocadillos
                generarResumenBocadillos(data.pedidos);

                // Llenar la tabla de pedidos
                rellenarTabla(data.pedidos);
            } else {
                mostrarError("Error al cargar pedidos: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al cargar pedidos:", error);
            mostrarError("Hubo un error al cargar los pedidos.");
        });
}

// Función para generar el resumen de bocadillos
function generarResumenBocadillos(pedidos) {
    const resumenContainer = document.getElementById("bocadillos-resumen");
    resumenContainer.innerHTML = ""; // Limpiar el resumen anterior

    // Crear un mapa para contar bocadillos
    const resumen = {};
    pedidos.forEach((pedido) => {
        if (resumen[pedido.bocadillo]) {
            resumen[pedido.bocadillo]++;
        } else {
            resumen[pedido.bocadillo] = 1;
        }
    });

    // Crear elementos dinámicos para mostrar el resumen
    for (const [bocadillo, cantidad] of Object.entries(resumen)) {
        const resumenItem = document.createElement("div");
        resumenItem.classList.add("resumen-item");
        resumenItem.textContent = `${bocadillo}: ${cantidad} pedidos`;
        resumenContainer.appendChild(resumenItem);
    }
}

function rellenarTabla(pedidos) {
    const tableBody = document.querySelector("#pedidos-table tbody");
    tableBody.innerHTML = ""; // Limpia las filas anteriores

    pedidos.forEach((pedido) => {
        const row = document.createElement("tr");

        // Crea celdas dinámicas
        const alumnoCell = document.createElement("td");
        alumnoCell.textContent = pedido.alumno;

        const bocadilloCell = document.createElement("td");
        bocadilloCell.textContent = pedido.bocadillo;

        const precioCell = document.createElement("td");
        // Verificar si precio_pedido es válido y convertirlo a número
        const precio = parseFloat(pedido.precio_pedido);
        precioCell.textContent = isNaN(precio) ? "N/A" : `${precio.toFixed(2)}€`;

        const fechaCell = document.createElement("td");
        fechaCell.textContent = pedido.fecha
            ? new Date(pedido.fecha).toLocaleDateString()
            : "Sin fecha";

        const fechaRecogidaCell = document.createElement("td");
        // Crear un checkbox para fecha de recogida
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        
        // Marcar el checkbox si fecha_recogida no es null
        if (pedido.fecha_recogida) {
            checkbox.checked = true;
            checkbox.disabled = true; // Deshabilitar si ya está marcado
        }

        // Agregar evento al checkbox
        checkbox.addEventListener("change", function () {
            if (this.checked) {
                marcarFechaRecogida(pedido.alumno, pedido.fecha); // Llamar a la función para actualizar
            }
        });

        fechaRecogidaCell.appendChild(checkbox);

        // Añade celdas a la fila
        row.appendChild(alumnoCell);
        row.appendChild(bocadilloCell);
        row.appendChild(precioCell);
        row.appendChild(fechaCell);
        row.appendChild(fechaRecogidaCell);

        // Añade fila a la tabla
        tableBody.appendChild(row);
    });
}

// Función para enviar el ID del pedido al backend
function marcarFechaRecogida(alumno, fecha) {
    ocultarError();
    console.log("Datos enviados al backend:", { alumno, fecha });

    fetch("sw_cocina.php?action=updateFechaRecogida", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ alumno: alumno, fecha: fecha }), // Enviar ambos datos
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {;
                fetchPedidos(); // Recargar los pedidos para reflejar cambios
            } else {
                mostrarError("Error al actualizar fecha de recogida: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al actualizar fecha de recogida:", error);
            mostrarError("Hubo un error al actualizar la fecha de recogida.");
        });
}

function filtrarPorColumna(column, filterValue) {
    ocultarError();
    fetch("sw_cocina.php?action=getPedidos")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Filtrar los pedidos según el valor ingresado
                const pedidosFiltrados = data.pedidos.filter((pedido) => {
                    const value = pedido[column]?.toString().toLowerCase(); // Convertir a string y minúsculas
                    return value && value.includes(filterValue.toLowerCase());
                });

                rellenarTabla(pedidosFiltrados);

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