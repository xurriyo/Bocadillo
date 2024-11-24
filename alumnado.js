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
