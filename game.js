// =========================================================================
//                                1. CONFIGURACIÓN INICIAL
// =========================================================================

// Referencia al lienzo del juego y su contexto 2D
const lienzo = document.getElementById('lienzoJuego');
const ctx = lienzo.getContext('2d');

const ANCHO_LIENZO = 1200;
const ALTO_LIENZO = 400;

const ALTO_HUD = ALTO_LIENZO / 7;
const ALTO_JUEGO = ALTO_LIENZO - ALTO_HUD;
const Y_JUEGO = ALTO_HUD;

lienzo.width = ANCHO_LIENZO;
lienzo.height = ALTO_LIENZO;

// Colores de prototipo
const COLOR_JUGADOR = '#E0E3E8';
const COLOR_PLATAFORMA = '#4B5349';
const COLOR_SUELO = '#4B3621';
const COLOR_PLATAFORMA_MOVIL = '#2A6150';
const COLOR_BALA = '#E5D34C';
const COLOR_ENEMIGO = '#5D2F2F';
const COLOR_BALA_ENEMIGA = '#E5D34C';
const COLOR_BARRA_VIDA = '#3D9970';
const COLOR_MUNICION = '#FFD700';
const COLOR_VIDA = '#ffffff';
const COLOR_FONDO_HUD = '#333333';
const COLOR_BARRA_ESTATICA = '#666666';
const COLOR_DOCTORA = '#E5D34C';


// Constantes de física del juego
const GRAVEDAD = 0.2;
const FUERZA_SALTO = -6;
const VELOCIDAD_BALA = 7;
const TIEMPO_RECARGA_BALA = 20;
const VELOCIDAD_ENEMIGO = 1;
const TIEMPO_RECARGA_ENEMIGO = 60;

// Constantes del sistema de vida y munición
const VIDA_MAXIMA_JUGADOR = 5;
const VIDA_MAXIMA_ENEMIGO = 2;
const MUNICION_INICIAL = 10;
const RADIO_VISION = 150;
const VISION_ENEMIGO = 200;
const MUNICION_ENEMIGO_INICIAL = 15;

// --- CAMBIO: Variables para la transición ---
let estadoJuego = "menu";
let nivelActual = 1;
let fade = 0; // Opacidad del fundido
const VELOCIDAD_FADE = 0.02;
// --- FIN DEL CAMBIO ---


// =========================================================================
//                                2. OBJETOS Y CLASES
// =========================================================================

const jugador = {
    x: 50,
    y: Y_JUEGO + ALTO_JUEGO - 70,
    ancho: 20,
    alto: 30,
    velocidad: 3,
    velocidadY: 0,
    estaSaltando: false,
    direccion: 'derecha',
    tiempoRecargaDisparo: 0,
    vida: VIDA_MAXIMA_JUGADOR,
    municion: MUNICION_INICIAL
};

const niveles = {
    // --- CAMBIO: Cada nivel tiene su propio color de fondo ---
    nivel1: {
        colorFondo: '#1F261C',
        plataformas: [
            { x: 0, y: Y_JUEGO + ALTO_JUEGO - 40, ancho: ANCHO_LIENZO, alto: 40, color: COLOR_SUELO },
            { x: 100, y: Y_JUEGO + ALTO_JUEGO - 100, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 300, y: Y_JUEGO + ALTO_JUEGO - 150, ancho: 150, alto: 20, color: COLOR_PLATAFORMA },
            { x: 500, y: Y_JUEGO + ALTO_JUEGO - 100, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 700, y: Y_JUEGO + ALTO_JUEGO - 200, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 950, y: Y_JUEGO + ALTO_JUEGO - 150, ancho: 150, alto: 20, color: COLOR_PLATAFORMA }
        ],
        plataformasMoviles: [
            { x: 600, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 80, alto: 20, velocidadX: 1, limiteIzq: 550, limiteDer: 750, color: COLOR_PLATAFORMA_MOVIL }
        ],
        enemigos: [
            { x: 350, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'derecha', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 300, limiteDer: 400, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL },
            { x: 800, y: Y_JUEGO + ALTO_JUEGO - 230, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'izquierda', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 750, limiteDer: 850, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL },
            { x: 1000, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'derecha', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 950, limiteDer: 1100, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL }
        ],
        municion: [
            { x: 250, y: Y_JUEGO + ALTO_JUEGO - 120, ancho: 15, alto: 15, recolectado: false }
        ],
        vida: [
            { x: 850, y: Y_JUEGO + ALTO_JUEGO - 170, ancho: 15, alto: 15, recolectado: false }
        ],
        objetivo: null,
        mensaje: 'Nivel 1 - Infiltración en la jungla'
    },
    nivel2: {
        colorFondo: '#2A3326',
        plataformas: [
            { x: 0, y: Y_JUEGO + ALTO_JUEGO - 40, ancho: ANCHO_LIENZO, alto: 40, color: COLOR_SUELO },
            { x: 100, y: Y_JUEGO + ALTO_JUEGO - 100, ancho: 150, alto: 20, color: COLOR_PLATAFORMA },
            { x: 300, y: Y_JUEGO + ALTO_JUEGO - 150, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 500, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 750, y: Y_JUEGO + ALTO_JUEGO - 220, ancho: 150, alto: 20, color: COLOR_PLATAFORMA },
            { x: 950, y: Y_JUEGO + ALTO_JUEGO - 150, ancho: 150, alto: 20, color: COLOR_PLATAFORMA }
        ],
        plataformasMoviles: [
            { x: 650, y: Y_JUEGO + ALTO_JUEGO - 100, ancho: 80, alto: 20, velocidadX: 1.5, limiteIzq: 600, limiteDer: 800, color: COLOR_PLATAFORMA_MOVIL }
        ],
        enemigos: [
            { x: 200, y: Y_JUEGO + ALTO_JUEGO - 130, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'derecha', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 100, limiteDer: 250, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL },
            { x: 450, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'izquierda', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 300, limiteDer: 500, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL },
            { x: 800, y: Y_JUEGO + ALTO_JUEGO - 250, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'derecha', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 750, limiteDer: 900, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL },
            { x: 1000, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'izquierda', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 950, limiteDer: 1100, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL }
        ],
        municion: [
            { x: 350, y: Y_JUEGO + ALTO_JUEGO - 170, ancho: 15, alto: 15, recolectado: false }
        ],
        vida: [
            { x: 550, y: Y_JUEGO + ALTO_JUEGO - 200, ancho: 15, alto: 15, recolectado: false }
        ],
        objetivo: null,
        mensaje: 'Nivel 2 - ¡Aumenta el desafío!'
    },
    nivel3: {
        colorFondo: '#3A3A3A',
        plataformas: [
            { x: 0, y: Y_JUEGO + ALTO_JUEGO - 40, ancho: ANCHO_LIENZO, alto: 40, color: COLOR_SUELO },
            { x: 150, y: Y_JUEGO + ALTO_JUEGO - 120, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 300, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 80, alto: 20, color: COLOR_PLATAFORMA },
            { x: 500, y: Y_JUEGO + ALTO_JUEGO - 100, ancho: 100, alto: 20, color: COLOR_PLATAFORMA },
            { x: 750, y: Y_JUEGO + ALTO_JUEGO - 150, ancho: 150, alto: 20, color: COLOR_PLATAFORMA },
            { x: 1000, y: Y_JUEGO + ALTO_LIENZO - 200, ancho: 150, alto: 20, color: COLOR_PLATAFORMA }
        ],
        plataformasMoviles: [],
        enemigos: [
            { x: 200, y: Y_JUEGO + ALTO_JUEGO - 150, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'derecha', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 150, limiteDer: 250, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL },
            { x: 800, y: Y_JUEGO + ALTO_JUEGO - 180, ancho: 20, alto: 30, velocidad: VELOCIDAD_ENEMIGO, direccion: 'izquierda', tiempoRecargaDisparo: TIEMPO_RECARGA_ENEMIGO, limiteIzq: 750, limiteDer: 900, vida: VIDA_MAXIMA_ENEMIGO, municion: MUNICION_ENEMIGO_INICIAL }
        ],
        municion: [
            { x: 400, y: Y_JUEGO + ALTO_JUEGO - 100, ancho: 15, alto: 15, recolectado: false }
        ],
        vida: [
            { x: 700, y: Y_JUEGO + ALTO_JUEGO - 170, ancho: 15, alto: 15, recolectado: false }
        ],
        objetivo: { x: 1050, y: Y_JUEGO + ALTO_JUEGO - 230, ancho: 30, alto: 30, color: COLOR_DOCTORA },
        mensaje: 'Nivel 3 - ¡Rescata a la doctora!'
    }
    // --- FIN DEL CAMBIO ---
};

let plataformas = [];
let plataformasMoviles = [];
let enemigos = [];
let balasEnemigas = [];
let balas = [];
let municion = [];
let vida = [];
let objetivoFinal = null;
let mensajeNivel = '';

const teclas = {};

function cargarNivel() {
    let nivelData;
    if (nivelActual === 1) {
        nivelData = niveles.nivel1;
    } else if (nivelActual === 2) {
        nivelData = niveles.nivel2;
    } else if (nivelActual === 3) {
        nivelData = niveles.nivel3;
    }

    if (nivelData) {
        plataformas = nivelData.plataformas.map(p => ({ ...p }));
        plataformasMoviles = nivelData.plataformasMoviles.map(p => ({ ...p }));
        enemigos = nivelData.enemigos.map(e => ({ ...e, vida: VIDA_MAXIMA_ENEMIGO }));
        municion = nivelData.municion.map(m => ({ ...m, recolectado: false }));
        vida = nivelData.vida.map(v => ({ ...v, recolectado: false }));
        objetivoFinal = nivelData.objetivo ? { ...nivelData.objetivo } : null;
        mensajeNivel = nivelData.mensaje;

        balas = [];
        balasEnemigas = [];
        
        reiniciarJugador();
    }
}

function reiniciarJugador() {
    jugador.x = 50;
    jugador.y = Y_JUEGO + ALTO_JUEGO - 70;
    jugador.velocidadY = 0;
    jugador.estaSaltando = false;
    jugador.vida = VIDA_MAXIMA_JUGADOR;
    jugador.municion = MUNICION_INICIAL;
}


// =========================================================================
//                                3. FUNCIONES DE DIBUJO
// =========================================================================

function dibujarPanelHUD() {
    ctx.fillStyle = COLOR_FONDO_HUD;
    ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_HUD);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(mensajeNivel, ANCHO_LIENZO / 2, 30);
}

function dibujarJugador() {
    ctx.fillStyle = COLOR_JUGADOR;
    ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
}

function dibujarPlataformas() {
    plataformas.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.ancho, p.alto);
    });
}

function dibujarPlataformasMoviles() {
    plataformasMoviles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.ancho, p.alto);
    });
}

function dibujarEnemigos() {
    enemigos.forEach(e => {
        ctx.fillStyle = COLOR_ENEMIGO;
        ctx.fillRect(e.x, e.y, e.ancho, e.alto);
    });
}

function dibujarBalasEnemigas() {
    balasEnemigas.forEach(b => {
        ctx.fillStyle = COLOR_BALA_ENEMIGA;
        ctx.fillRect(b.x, b.y, b.ancho, b.alto);
    });
}

function dibujarBalas() {
    balas.forEach(b => {
        ctx.fillStyle = COLOR_BALA;
        ctx.fillRect(b.x, b.y, b.ancho, b.alto);
    });
}

function dibujarBarraDeVida() {
    const anchoBarra = 150;
    const altoBarra = 10;
    const x = 50;
    const y = 50;
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Vida', x, y - 5);
    
    ctx.fillStyle = COLOR_BARRA_ESTATICA;
    ctx.fillRect(x, y, anchoBarra, altoBarra);
    
    const anchoVidaActual = (jugador.vida / VIDA_MAXIMA_JUGADOR) * anchoBarra;
    ctx.fillStyle = COLOR_BARRA_VIDA;
    ctx.fillRect(x, y, anchoVidaActual, altoBarra);

    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, anchoBarra, altoBarra);
}

function dibujarColeccionables() {
    municion.forEach(m => {
        if (!m.recolectado) {
            ctx.fillStyle = COLOR_MUNICION;
            ctx.fillRect(m.x, m.y, m.ancho, m.alto);
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('M', m.x + m.ancho / 2, m.y + m.alto / 2 + 4);
        }
    });

    vida.forEach(v => {
        if (!v.recolectado) {
            ctx.fillStyle = COLOR_VIDA;
            ctx.fillRect(v.x, v.y, v.ancho, v.alto);
            ctx.fillStyle = 'red';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', v.x + v.ancho / 2, v.y + v.alto / 2 + 4);
        }
    });
}

function dibujarBarraDeMunicion() {
    const anchoBarra = 150;
    const altoBarra = 10;
    const x = 250;
    const y = 50;
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Munición', x, y - 5);
    
    ctx.fillStyle = COLOR_BARRA_ESTATICA;
    ctx.fillRect(x, y, anchoBarra, altoBarra);
    
    const anchoMunicionActual = (jugador.municion / MUNICION_INICIAL) * anchoBarra;
    ctx.fillStyle = COLOR_BALA;
    ctx.fillRect(x, y, anchoMunicionActual, altoBarra);

    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, anchoBarra, altoBarra);
}

function dibujarMenuInicio() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RESCATE', ANCHO_LIENZO / 2, ALTO_LIENZO / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText('Presiona ENTER para Jugar', ANCHO_LIENZO / 2, ALTO_LIENZO / 2);
}

function dibujarPantallaVictoria() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡Misión Cumplida!', ANCHO_LIENZO / 2, ALTO_LIENZO / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText('Presiona R para volver a Jugar', ANCHO_LIENZO / 2, ALTO_LIENZO / 2);
}

function dibujarPantallaGameOver() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', ANCHO_LIENZO / 2, ALTO_LIENZO / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText('Presiona R para volver a Jugar', ANCHO_LIENZO / 2, ALTO_LIENZO / 2);
}

// =========================================================================
//                                4. FUNCIONES DE LÓGICA
// =========================================================================

function reiniciarJuego() {
    jugador.x = 50;
    jugador.y = Y_JUEGO + ALTO_JUEGO - 70;
    jugador.velocidadY = 0;
    jugador.estaSaltando = false;
    jugador.vida = VIDA_MAXIMA_JUGADOR;
    jugador.municion = MUNICION_INICIAL;
}


function actualizarJugador() {
    let proximaX = jugador.x;
    if (teclas['ArrowLeft']) {
        proximaX -= jugador.velocidad;
        jugador.direccion = 'izquierda';
    }
    if (teclas['ArrowRight']) {
        proximaX += jugador.velocidad;
        jugador.direccion = 'derecha';
    }

    const limiteIzqJuego = 0;
    if (proximaX < limiteIzqJuego) proximaX = limiteIzqJuego;
    if (proximaX + jugador.ancho > ANCHO_LIENZO) proximaX = ANCHO_LIENZO - jugador.ancho;

    const todasLasPlataformas = [...plataformas, ...plataformasMoviles];
    let colisionHorizontal = false;
    todasLasPlataformas.forEach(p => {
        if (
            proximaX < p.x + p.ancho &&
            proximaX + jugador.ancho > p.x &&
            jugador.y < p.y + p.alto &&
            jugador.y + jugador.alto > p.y
        ) {
            colisionHorizontal = true;
        }
    });

    if (!colisionHorizontal) {
        jugador.x = proximaX;
    }

    if (teclas['ArrowUp'] && !jugador.estaSaltando) {
        jugador.velocidadY = FUERZA_SALTO;
        jugador.estaSaltando = true;
    }

    jugador.velocidadY += GRAVEDAD;
    jugador.y += jugador.velocidadY;

    todasLasPlataformas.forEach(p => {
        if (
            jugador.x < p.x + p.ancho &&
            jugador.x + jugador.ancho > p.x &&
            jugador.y < p.y + p.alto &&
            jugador.y + jugador.alto > p.y
        ) {
            if (jugador.velocidadY > 0) {
                jugador.y = p.y - jugador.alto;
                jugador.velocidadY = 0;
                jugador.estaSaltando = false;
                if (p.velocidadX) {
                    let proximaXEnMovil = jugador.x + p.velocidadX;
                    let colisionProxima = false;
                    todasLasPlataformas.forEach(p2 => {
                        if(p !== p2 && proximaXEnMovil < p2.x + p2.ancho && proximaXEnMovil + jugador.ancho > p2.x && jugador.y < p2.y + p2.alto && jugador.y + jugador.alto > p2.y) {
                            colisionProxima = true;
                        }
                    });
                    if (!colisionProxima) {
                        jugador.x += p.velocidadX;
                    }
                }
            } else if (jugador.velocidadY < 0) {
                jugador.y = p.y + p.alto;
                jugador.velocidadY = 0;
            }
        }
    });

    for (let i = balasEnemigas.length - 1; i >= 0; i--) {
        const b = balasEnemigas[i];
        if (jugador.x < b.x + b.ancho && jugador.x + jugador.ancho > b.x && jugador.y < b.y + b.alto && jugador.y + jugador.alto > b.y) {
            jugador.vida--;
            balasEnemigas.splice(i, 1);
            if (jugador.vida <= 0) {
                estadoJuego = 'gameover';
            }
        }
    }

    if (jugador.y > ALTO_LIENZO) {
        estadoJuego = 'gameover';
    }

    if (teclas[' '] && jugador.municion > 0) {
        if (jugador.tiempoRecargaDisparo <= 0) {
            let balaX = jugador.x;
            if (jugador.direccion === 'derecha') {
                balaX += jugador.ancho;
            } else {
                balaX -= 5;
            }
            balas.push({
                x: balaX,
                y: jugador.y + jugador.alto / 2 - 2,
                ancho: 5,
                alto: 5,
                direccion: jugador.direccion
            });
            jugador.tiempoRecargaDisparo = TIEMPO_RECARGA_BALA;
            jugador.municion--;
        }
    }

    if (jugador.tiempoRecargaDisparo > 0) {
        jugador.tiempoRecargaDisparo--;
    }

    municion.forEach(m => {
        if (!m.recolectado && jugador.x < m.x + m.ancho && jugador.x + jugador.ancho > m.x && jugador.y < m.y + m.alto && jugador.y + jugador.alto > m.y) {
            jugador.municion = MUNICION_INICIAL;
            m.recolectado = true;
        }
    });

    vida.forEach(v => {
        if (!v.recolectado && jugador.x < v.x + v.ancho && jugador.x + jugador.ancho > v.x && jugador.y < v.y + v.alto && jugador.y + jugador.alto > v.y) {
            jugador.vida = VIDA_MAXIMA_JUGADOR;
            v.recolectado = true;
        }
    });
    
    // --- CAMBIO: Condición para pasar de nivel ---
    if (enemigos.length === 0 && nivelActual < Object.keys(niveles).length) {
        estadoJuego = 'transicion'; // Nuevo estado para la transición
    } else if (objetivoFinal && jugador.x < objetivoFinal.x + objetivoFinal.ancho && jugador.x + jugador.ancho > objetivoFinal.x && jugador.y < objetivoFinal.y + objetivoFinal.alto && jugador.y + jugador.alto > objetivoFinal.y) {
        estadoJuego = 'victoria';
    }
    // --- FIN DEL CAMBIO ---
}

function actualizarBalas() {
    const todasLasPlataformas = [...plataformas, ...plataformasMoviles];

    for (let i = balas.length - 1; i >= 0; i--) {
        const b = balas[i];
        if (b.direccion === 'derecha') {
            b.x += VELOCIDAD_BALA;
        } else {
            b.x -= VELOCIDAD_BALA;
        }

        let balaTocoEnemigo = false;
        for(let j = enemigos.length - 1; j >= 0; j--) {
            const e = enemigos[j];
            if (b.x < e.x + b.ancho && b.x + b.ancho > e.x && b.y < e.y + e.alto && b.y + b.alto > e.y) {
                e.vida--;
                if (e.vida <= 0) {
                    enemigos.splice(j, 1);
                }
                balaTocoEnemigo = true;
                break;
            }
        }
        
        let colisionBala = false;
        todasLasPlataformas.forEach(p => {
            if (
                b.x < p.x + p.ancho &&
                b.x + b.ancho > p.x &&
                b.y < p.y + p.alto &&
                b.y + b.alto > p.y
            ) {
                colisionBala = true;
            }
        });

        if (colisionBala || balaTocoEnemigo || b.x < 0 || b.x > ANCHO_LIENZO) {
            balas.splice(i, 1);
        }
    }
}

function actualizarPlataformasMoviles() {
    plataformasMoviles.forEach(p => {
        p.x += p.velocidadX;
        if (p.x + p.ancho > p.limiteDer || p.x < p.limiteIzq) {
            p.velocidadX *= -1;
        }
    });
}

function actualizarEnemigos() {
    enemigos.forEach(e => {
        const dx = jugador.x - e.x;
        const dy = jugador.y - e.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < VISION_ENEMIGO) {
            e.direccion = dx > 0 ? 'derecha' : 'izquierda';

            if (e.tiempoRecargaDisparo <= 0 && e.municion > 0) {
                let balaX = e.x;
                if (e.direccion === 'derecha') {
                    balaX += e.ancho;
                } else {
                    balaX -= 5;
                }
                balasEnemigas.push({
                    x: balaX,
                    y: e.y + e.alto / 2 - 2,
                    ancho: 5,
                    alto: 5,
                    direccion: e.direccion
                });
                e.tiempoRecargaDisparo = TIEMPO_RECARGA_ENEMIGO;
                e.municion--;
            }
        } else {
            if (e.direccion === 'derecha') {
                e.x += e.velocidad;
                if (e.x + e.ancho > e.limiteDer) {
                    e.direccion = 'izquierda';
                }
            } else {
                e.x -= e.velocidad;
                if (e.x < e.limiteIzq) {
                    e.direccion = 'derecha';
                }
            }
            if (e.municion < MUNICION_ENEMIGO_INICIAL) {
                e.municion += 0.01;
            }
        }

        if (e.tiempoRecargaDisparo > 0) {
            e.tiempoRecargaDisparo--;
        }
    });
}

function actualizarBalasEnemigas() {
    const todasLasPlataformas = [...plataformas, ...plataformasMoviles];

    for (let i = balasEnemigas.length - 1; i >= 0; i--) {
        const b = balasEnemigas[i];
        if (b.direccion === 'derecha') {
            b.x += VELOCIDAD_BALA;
        } else {
            b.x -= VELOCIDAD_BALA;
        }
        
        let colisionBala = false;
        todasLasPlataformas.forEach(p => {
            if (b.x < p.x + p.ancho && b.x + b.ancho > p.x && b.y < p.y + p.alto && b.y + b.alto > p.y) {
                colisionBala = true;
            }
        });

        if (colisionBala || b.x < 0 || b.x > ANCHO_LIENZO) {
            balasEnemigas.splice(i, 1);
        }
    }
}


// =========================================================================
//                                5. BUCLE PRINCIPAL DEL JUEGO
// =========================================================================

function bucleDelJuego() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);

    if (estadoJuego === "menu") {
        dibujarMenuInicio();
    } else if (estadoJuego === "jugando") {
        ctx.fillStyle = COLOR_FONDO_HUD;
        ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_HUD);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, Y_JUEGO, ANCHO_LIENZO, ALTO_JUEGO);

        actualizarJugador();
        actualizarBalas();
        actualizarPlataformasMoviles();
        actualizarEnemigos();
        actualizarBalasEnemigas();

        ctx.save();
        ctx.beginPath();
        ctx.arc(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2, RADIO_VISION, 0, Math.PI * 2, true);
        ctx.clip();
        
        ctx.fillStyle = niveles['nivel' + nivelActual].colorFondo;
        ctx.fillRect(0, Y_JUEGO, ANCHO_LIENZO, ALTO_JUEGO);
        
        dibujarPlataformas();
        dibujarPlataformasMoviles();
        dibujarEnemigos();
        dibujarColeccionables();
        if (objetivoFinal) {
            ctx.fillStyle = objetivoFinal.color;
            ctx.fillRect(objetivoFinal.x, objetivoFinal.y, objetivoFinal.ancho, objetivoFinal.alto);
        }
        dibujarJugador();
        dibujarBalas();
        dibujarBalasEnemigas();

        ctx.restore();
        
        dibujarBarraDeVida();
        dibujarBarraDeMunicion();
    } else if (estadoJuego === "transicion") {
        // --- NUEVO: Lógica para la transición ---
        ctx.fillStyle = 'black';
        ctx.globalAlpha = fade;
        ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
        ctx.globalAlpha = 1;
        fade += VELOCIDAD_FADE;
        
        if (fade >= 1) {
            nivelActual++;
            if (nivelActual > Object.keys(niveles).length) {
                // Si no hay más niveles, el juego termina
                estadoJuego = 'victoria';
            } else {
                cargarNivel();
                fade = 1; // Para la transición de salida
                estadoJuego = 'cargando';
            }
        }
    } else if (estadoJuego === "cargando") {
        // --- NUEVO: Lógica para la transición de salida ---
        ctx.fillStyle = 'black';
        ctx.globalAlpha = fade;
        ctx.fillRect(0, 0, ANCHO_LIENZO, ALTO_LIENZO);
        ctx.globalAlpha = 1;
        fade -= VELOCIDAD_FADE;
        
        if (fade <= 0) {
            fade = 0;
            estadoJuego = 'jugando';
        }
    } else if (estadoJuego === "victoria") {
        dibujarPantallaVictoria();
    } else if (estadoJuego === "gameover") {
        dibujarPantallaGameOver();
    }

    requestAnimationFrame(bucleDelJuego);
}

// Escuchar eventos de teclado para actualizar el objeto de teclas
window.addEventListener('keydown', (e) => {
    teclas[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    teclas[e.key] = false;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && estadoJuego === 'menu') {
        estadoJuego = 'jugando';
        nivelActual = 1;
        cargarNivel();
    }
    if (e.key === 'r' && (estadoJuego === 'gameover' || estadoJuego === 'victoria')) {
        estadoJuego = 'menu';
        nivelActual = 1;
        cargarNivel();
    }
});

// Iniciar el juego
cargarNivel();
bucleDelJuego();