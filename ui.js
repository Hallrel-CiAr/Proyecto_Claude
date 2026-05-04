// ui.js
// Contiene todas las funciones para dibujar la interfaz de usuario (HUD)

// Referencia al contexto de dibujo y a las constantes del juego
let ctx;
let jugador;
let VIDA_MAXIMA_JUGADOR;
let MUNICION_INICIAL;
let COLOR_BARRA_VIDA;
let COLOR_BALA;
let ANCHO_PANEL_HUD;
let COLOR_FONDO_HUD;

// Inicializa las variables necesarias para el UI
export function inicializarUI(contexto, jugadorObj, constantes) {
    ctx = contexto;
    jugador = jugadorObj;
    VIDA_MAXIMA_JUGADOR = constantes.VIDA_MAXIMA_JUGADOR;
    MUNICION_INICIAL = constantes.MUNICION_INICIAL;
    COLOR_BARRA_VIDA = constantes.COLOR_BARRA_VIDA;
    COLOR_BALA = constantes.COLOR_BALA;
    ANCHO_PANEL_HUD = constantes.ANCHO_PANEL_HUD;
    COLOR_FONDO_HUD = constantes.COLOR_FONDO_HUD;
}

// Dibuja el panel de información de la UI.
export function dibujarPanelHUD() {
    // Fondo del panel
    ctx.fillStyle = COLOR_FONDO_HUD;
    ctx.fillRect(0, 0, ANCHO_PANEL_HUD, ctx.canvas.height);
    
    // Título en el panel
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STATUS', ANCHO_PANEL_HUD / 2, 50);
}

// Dibuja la barra de vida del jugador.
export function dibujarBarraDeVida() {
    const anchoBarra = 150;
    const altoBarra = 10;
    const x = 25;
    const y = 80;
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Vida', x, y - 5);
    
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, anchoBarra, altoBarra);
    
    const anchoVidaActual = (jugador.vida / VIDA_MAXIMA_JUGADOR) * anchoBarra;
    ctx.fillStyle = COLOR_BARRA_VIDA;
    ctx.fillRect(x, y, anchoVidaActual, altoBarra);

    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, anchoBarra, altoBarra);
}

// Dibuja la barra de munición del jugador.
export function dibujarBarraDeMunicion() {
    const anchoBarra = 150;
    const altoBarra = 10;
    const x = 25;
    const y = 140;
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Munición', x, y - 5);
    
    ctx.fillStyle = '#666';
    ctx.fillRect(x, y, anchoBarra, altoBarra);
    
    const anchoMunicionActual = (jugador.municion / MUNICION_INICIAL) * anchoBarra;
    ctx.fillStyle = COLOR_BALA;
    ctx.fillRect(x, y, anchoMunicionActual, altoBarra);

    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, anchoBarra, altoBarra);
}