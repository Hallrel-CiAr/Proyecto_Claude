// Comic-style cinematic panels for each mission
const STORY = {

  intro: [
    {
      bg: 'black',
      panels: [
        { text: 'Ciudad de Ginebra. Laboratorios Helios — Empresa farmacéutica internacional.', pos: 'top' },
        { text: 'La Dra. Elena Voss, investigadora de élite en biología sintética, es secuestrada por un grupo mercenario desconocido.', pos: 'bottom' },
      ]
    },
    {
      bg: 'dark',
      panels: [
        { text: '"Pagan lo suficiente como para no hacer preguntas."', speaker: 'Mercenario', pos: 'bottom' },
      ]
    },
    {
      bg: 'black',
      panels: [
        { text: 'Helios contrata a PHANTOM UNIT — un grupo paramilitar privado con una sola orden:', pos: 'top' },
        { text: '"RESCATEN A LA DOCTORA. CUESTE LO QUE CUESTE."', pos: 'center', style: 'title' },
      ]
    },
    {
      bg: 'dark',
      panels: [
        { text: 'Lo que Helios no sabe es que dentro del grupo mercenario opera el Dr. Karl Metzner...', pos: 'top' },
        { text: '...un científico obsesionado con crear la próxima evolución del soldado de combate.', pos: 'bottom' },
        { text: 'La Dra. Voss es la pieza que le falta.', pos: 'bottom', style: 'warning' },
      ]
    }
  ],

  mission1_intro: [
    {
      bg: 'jungle',
      panels: [
        { text: 'MISIÓN 01 — "PUNTO DE ENTRADA"', pos: 'top', style: 'title' },
        { text: 'Selva del Pacífico. 03:00 hs.', pos: 'top' },
        { text: 'El agente KANE infiltra el perímetro exterior del campamento mercenario.', pos: 'bottom' },
      ]
    },
    {
      bg: 'dark',
      panels: [
        { text: '"Kane, su objetivo es claro: avanzar, neutralizar y buscar inteligencia sobre el paradero de Voss."', speaker: 'Command', pos: 'bottom' },
        { text: '"No deje rastros."', speaker: 'Command', pos: 'bottom' },
      ]
    }
  ],

  mission1_outro: [
    {
      bg: 'dark',
      panels: [
        { text: 'Entre los documentos encontrados en el campamento...', pos: 'top' },
        { text: '...un logo repetido en todos los informes: una doble hélice modificada.', pos: 'bottom' },
        { text: '"¿Quiénes son estos tipos realmente?"', speaker: 'Kane', pos: 'bottom' },
      ]
    }
  ],

  mission2_intro: [
    {
      bg: 'base',
      panels: [
        { text: 'MISIÓN 02 — "ENTRE LAS SOMBRAS"', pos: 'top', style: 'title' },
        { text: 'Base de operaciones enemiga. Zona industrial, norte de Colombia.', pos: 'top' },
        { text: 'La inteligencia obtenida llevó a Phantom Unit a esta instalación.', pos: 'bottom' },
        { text: 'Señales de vida detectadas en el sector B. Podría ser la Doctora.', pos: 'bottom' },
      ]
    }
  ],

  mission3_intro: [
    {
      bg: 'facility',
      panels: [
        { text: 'MISIÓN 03 — "PROYECTO ARES"', pos: 'top', style: 'title' },
        { text: 'Instalación subterránea. Ubicación clasificada.', pos: 'top' },
        { text: 'Los informes hablan de experimentos. De sujetos modificados.', pos: 'bottom' },
        { text: 'Kane está a punto de descubrir hasta dónde llegó Metzner.', pos: 'bottom', style: 'warning' },
      ]
    }
  ],

  mission3_outro: [
    {
      bg: 'dark',
      panels: [
        { text: 'La Dra. Voss está viva. Pero lo que vio Kane en esos laboratorios...', pos: 'top' },
        { text: '...cambia todo.', pos: 'center', style: 'title' },
        { text: '"Metzner no actuaba solo. Hay alguien más detrás de esto."', speaker: 'Kane', pos: 'bottom' },
        { text: 'CONTINUARÁ...', pos: 'center', style: 'title' },
      ]
    }
  ]
};
