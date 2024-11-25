// verificar que el usuario es de alumno
function verificarAcceso() {
    const authKey = localStorage.getItem("auth_key");
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    // Verificar si el auth_key existe y si el tipoUsuario es alumno
    if (!authKey || tipoUsuario !== 'alumnado') {
        // Guardar el mensaje de error en localStorage
        localStorage.setItem("error_message", "No tienes permisos para acceder a esta página.");

        window.location.href = "index.html"; // Redirigir si no cumple los permisos
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('auth_key');
    localStorage.removeItem('tipo_usuario');
    localStorage.removeItem('nombre_alumno');
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    fetchBocadillos();
});

// funcion para traer los bocadillos del backend
function fetchBocadillos() {
    const nombreAlumno = localStorage.getItem("nombre_alumno");

    if (!nombreAlumno) {
        alert("No se ha encontrado el nombre del alumno.");
        console.error("Error: nombre_alumno no encontrado en localStorage.");
        return;
    }

    console.log("Enviando solicitud con nombreAlumno:", nombreAlumno);

    fetch("getBocadillosAlumno.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ alumno: nombreAlumno }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                displayBocadillos(data.bocadillos, data.pedido_actual);
            } else {
                alert("Error al cargar bocadillos: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al cargar bocadillos:", error);
            alert("Hubo un error al cargar los bocadillos.");
        });
}

function displayBocadillos(bocadillos, pedidoActual) {
    const container = document.querySelector("#bocadillos-container");
    container.innerHTML = "";

    bocadillos.forEach((bocadillo) => {
        const card = document.createElement("div");
        card.className = "bocadillo-card";

        const isSelected = bocadillo.nombre_bocadillo === pedidoActual;

        card.innerHTML = `
            <h3>${bocadillo.nombre_bocadillo}</h3>
            <p><strong>Ingredientes:</strong> ${bocadillo.ingredientes}</p>
            <p><strong>Tipo:</strong> ${bocadillo.tipo_bocadillo}</p>
            <p><strong>Alérgenos:</strong> ${bocadillo.alergenos}</p>
            <p><strong>Precio:</strong> ${parseFloat(bocadillo.precio_venta_publico).toFixed(2)}€</p>
            <button ${isSelected ? "disabled" : ""}>
                ${isSelected ? "Seleccionado" : "Elegir"}
            </button>
        `;

        const button = card.querySelector("button");
        button.addEventListener("click", () => seleccionarBocadillo(bocadillo.nombre_bocadillo));

        container.appendChild(card);
    });
}

// Enviar el pedido
function seleccionarBocadillo(nombreBocadillo) {
    const nombreAlumno = localStorage.getItem("nombre_alumno");

    if (!nombreAlumno) {
        alert("No se pudo identificar al alumno.");
        return;
    }

    fetch("hacerPedido.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ alumno: nombreAlumno, bocadillo: nombreBocadillo }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Pedido realizado con éxito.");
                window.location.href = "historicoPedidosAlumno.html"; // Redirigir o actualizar la página
            } else {
                alert("Error al realizar el pedido: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error al realizar el pedido:", error);
            alert("Hubo un error al realizar el pedido.");
        });
}