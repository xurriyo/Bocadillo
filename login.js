function loginUser() {
    // Obtiene los valores del formulario de login
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validación de campos (opcional)
    if (!email || !password) {
        alert("Por favor, completa ambos campos.");
        return; // Si falta algún campo, no continuar
    }

    // URL del servicio web de login
    const url = "login_sw.php";
   
    const data = {
        email: email,
        password: password
    };

    // Realiza la solicitud con fetch
    fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => response.json())  // Asegúrate de que la respuesta es JSON
    .then(function (json) {
        console.log(json); // Verifica qué respuesta se recibe en la consola

        // Verifica si el login fue exitoso
        if (json.success) {
            // Redirige a la página principal en caso de login exitoso
            window.location.href = "pedirBocadillo.html";
        } else {
            // Mostrar mensaje de error
            alert(json.message);
        }
    })
    .catch((error) => {
        console.error("Error al realizar la solicitud:", error);
        alert("Hubo un error al procesar la solicitud.");
    });
}