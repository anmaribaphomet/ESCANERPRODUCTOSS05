//-------------MATRIZ DE PRODUCTOS (CODIGO EN CLASE)
const productos = [
    ["0000000000017", "soda", "$ 10.99", "1.png"],
    ["0000000000024", "papas fritas", "$ 20.50", "2.png"],
    ["0000000000031", "agua", "$ 15.75", "3.png"],
    ["0000000000048", "hamburguesa", "$ 15.75", "4.png"],
    ["0000000000055", "dogo", "$ 15.75", "5.png"],
    ["0000000000062", "pan", "$ 15.75", "6.png"],
    ["0000000000079", "dulce", "$ 15.75", "7.png"],
    ["0000000000086", "galleta", "$ 15.75", "8.png"],
    ["0000000000093", "pay", "$ 15.75", "9.png"],
    ["0000000000109", "dona", "$ 15.75", "10.png"]
];

const TIEMPO_RESULTADO = 6000;
const MENSAJE_ESPERA = "Esperando producto...";
const $ = (id) => document.getElementById(id);
let codigo = "";
let enLector = false;
let temporizador = null;
let temporizadorBuffer = null;


// ------------------------------------
// NAVEGACIÓN
// ------------------------------------

function mostrarPantalla(id) {

    $("intro").hidden = id !== "intro";
    $("lector").hidden = id !== "lector";

    enLector = id === "lector";

    codigo = "";

    if (enLector) {
        reiniciarLector();
    }

    window.scrollTo(0, 0);
}


// ------------------------------------
// ACTUALIZAR DISPLAY DEL ESCÁNER
// ------------------------------------

function actualizarCodigo() {

    $("codigo-visual").textContent = codigo || "_";

    if (codigo.length > 0) {
        $("estado-lectura").textContent = "Leyendo...";
    } else {
        $("estado-lectura").textContent = "ESPERANDO ENTRADA";
    }
}


// ------------------------------------
// GENERAR CÓDIGO DE BARRAS
// ------------------------------------

function dibujarCodigo() {

    let semilla = 7;
    let x = 0;
    let barras = "";

    for (let i = 0; i < 62; i++) {

        semilla = (semilla * 31 + 11) % 97;

        const ancho = 1 + (semilla % 4);

        if (i % 2 === 0) {
            barras += `<rect x="${x}" y="0"
                width="${ancho}" height="100" fill="#111"/>`;
        }

        x += ancho;
    }

    // El código decorativo original ya no es necesario
    // dentro del producto: ahora tenemos un display real.
}


// ------------------------------------
// REINICIAR LECTOR
// ------------------------------------

function reiniciarLector() {

    clearTimeout(temporizador);
    clearTimeout(temporizadorBuffer);

    codigo = "";

    $("producto").hidden = true;
    $("placeholder").hidden = false;

    $("panel-producto")?.classList.remove("error");

    // El panel-producto se obtiene directamente
    document.querySelector(".panel-producto")
        .classList.remove("error");

    $("mensaje").textContent = MENSAJE_ESPERA;

    $("barra").classList.remove("activa");

    $("estado-lectura").textContent = "ESPERANDO ENTRADA";

    actualizarCodigo();
}


// ------------------------------------
// MOSTRAR RESULTADO
// ------------------------------------

function mostrarResultado(texto, imagen, mensaje, esError) {

    const panel = document.querySelector(".panel-producto");

    $("placeholder").hidden = true;

    $("imagen").src = imagen;

    $("imagen").alt = esError
        ? "Producto no encontrado"
        : texto;

    $("nombre_precio").textContent = texto;

    $("mensaje").textContent = mensaje;

    $("producto").hidden = false;

    panel.classList.toggle("error", esError);

    $("estado-lectura").textContent = esError
        ? "PRODUCTO NO ENCONTRADO"
        : "PRODUCTO DETECTADO";

    // Reiniciar animación de los 3 segundos

    $("barra").classList.remove("activa");

    void $("barra").offsetWidth;

    $("barra").classList.add("activa");

    clearTimeout(temporizador);

    temporizador = setTimeout(() => {

        reiniciarLector();

    }, TIEMPO_RESULTADO);
}


// ------------------------------------
// BUSCAR PRODUCTO
// ------------------------------------

function Buscar(codigoLeido) {

    const limpio = codigoLeido.trim();

    if (!limpio) return;

    codigo = limpio;

    actualizarCodigo();

    const producto = productos.find(
        (p) => p[0] === limpio
    );

    if (producto) {

        mostrarResultado(
            producto[1] + " " + producto[2],
            "./img/" + producto[3],
            "♡ Producto encontrado con éxito!",
            false
        );

    } else {

        mostrarResultado(
            "No se encuentra el producto.",
            "./img/error.png",
            "Try again! / エラー",
            true
        );
    }
}


// ------------------------------------
// LECTOR DE CÓDIGOS CON TECLADO
// ------------------------------------

window.addEventListener("keydown", (e) => {

    if (!enLector || e.ctrlKey || e.metaKey || e.altKey) {
        return;
    }

    // Evitar que el lector interfiera
    // con otros elementos interactivos.

    if (
        e.target instanceof HTMLElement &&
        e.target.matches("input, textarea, select")
    ) {
        return;
    }

    // ENTER = BUSCAR

    if (e.key === "Enter") {

        if (codigo.length > 0) {

            clearTimeout(temporizadorBuffer);

            Buscar(codigo);

        }

        return;
    }

    // CAPTURAR DÍGITOS

    if (/^[0-9]$/.test(e.key)) {

        // Evitar que se acumulen caracteres infinitos

        if (codigo.length >= 30) return;

        codigo += e.key;

        actualizarCodigo();

        // Si pasan 1.5 segundos sin recibir otro dígito,
        // se descarta la lectura incompleta.

        clearTimeout(temporizadorBuffer);

        temporizadorBuffer = setTimeout(() => {

            codigo = "";

            actualizarCodigo();

        }, 1500);
    }

}, true);


// ------------------------------------
// BOTONES DE PRUEBA
// ------------------------------------

function crearChips() {

    const contenedor = $("chips");

    contenedor.innerHTML = "";

    productos.forEach((p) => {

        const boton = document.createElement("button");

        boton.type = "button";

        boton.textContent = p[1];

        boton.addEventListener("click", () => {

            clearTimeout(temporizadorBuffer);

            Buscar(p[0]);

        });

        contenedor.appendChild(boton);

    });

    const malo = document.createElement("button");

    malo.type = "button";

    malo.textContent = "✕ Invalid code";

    malo.addEventListener("click", () => {

        clearTimeout(temporizadorBuffer);

        Buscar("9999999999999");

    });

    contenedor.appendChild(malo);
}


// ------------------------------------
// INICIALIZACIÓN
// ------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    dibujarCodigo();

    crearChips();

    $("btn-start").addEventListener("click", () => {

        mostrarPantalla("lector");

    });

    $("btn-inicio").addEventListener("click", () => {

        mostrarPantalla("intro");

    });

});
