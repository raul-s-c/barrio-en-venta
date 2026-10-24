import { CARD_LIMIT, CLIENT_LIMIT, DEFAULTS } from './catalog';
export const RULES = [
  [
    'El objetivo',
    'Eres agente inmobiliario. Cierras ventas para ganar prestigio: no compras para ti ni hay dinero que pagar. Gana quien tenga más puntos al terminar.',
  ],
  [
    'Reparto inicial, turno 0',
    '5 clientes privados, 2 cartas de juego y una especialidad pública por sorteo. Solo está descubierto el Ayuntamiento. Tu primera intervención usa ese reparto; desde tu segundo turno robas 1 carta de juego automáticamente.',
  ],
  [
    'Dos acciones en cualquier orden',
    'Puedes explorar, vender, buscar un cliente, reservar/disputar, completar tu mano de cartas (hasta 3) o hacer un trámite. Puedes repetir: explorar + explorar, vender + vender, vender + explorar. Las cartas se pueden jugar antes, entre o después de las acciones, sin gastar acciones. Terminar turno cede la vez al rival; nunca hay dos turnos seguidos del mismo jugador.',
  ],
  [
    'Explorar y prioridades',
    'Explora una loseta oculta vecina de otra abierta. Si es vivienda y te queda una de tus 4 fichas, tienes prioridad gratis hasta el final de tu próximo turno. No debes venderla inmediatamente. Reserva +1 turno añade otro turno tuyo. Una vivienda libre puede venderse sin reservar; una prioridad rival debe caducar o eliminarse antes. Disputar una prioridad rival cuesta 1 acción y cuenta como tu carta del turno: descartas una carta, robas reemplazo y el rival roba 1.',
  ],
  [
    'Los clientes se gastan',
    'Solo vendes a un cliente de tu mano y lo descartas al cerrar. No hay clientes públicos ni reposición automática. Buscar cliente cuesta 1 acción y roba 1 al azar. Por eso el comprador que más paga ahora puede convenirte más para otra casa. La mano muestra alternativas conocidas, no las losetas ocultas.',
  ],
  [
    'Dificultad y puntos',
    'Basta con que el cliente acepte la categoría. No hay encaje mínimo: sus preferencias solo modifican los puntos, nunca impiden vender. Solo 4 de los 24 clientes aceptan Lujosa. Las lujosas tienen base 10–11, medias 6–7 y baratas 3–4. Se suman progreso de línea, preferencias, barrio, especialidad y el bonus de próxima venta si está activo. Siguen aplicándose la prioridad rival y el bloqueo de Litigio.',
  ],
  [
    'Cartas de juego',
    `Solo hay 5 efectos, con 6 copias de cada uno: Quitar prioridad libera una reserva rival; Explorar gratis descubre una loseta conectada; Robar 1 cliente añade uno al azar; Próxima venta +3 deja un bonus hasta que vendas (no acumulable); Reserva +1 turno alarga una reserva propia un turno tuyo. Puedes jugar como máximo 1 por turno, antes, entre o después de tus 2 acciones; no gasta acción y al jugarla robas 1 reemplazo. No hay reacciones ni cartas que debas adjuntar al vender. Límite: ${CLIENT_LIMIT} clientes y ${CARD_LIMIT} cartas de juego; si lo superas, eliges qué descartar sin gastar acción. El robo automático y los efectos respetan el máximo de ${CARD_LIMIT} cartas. Los mazos se reciclan cuando se agotan.`,
  ],
  [
    'Barrio y Ayuntamiento',
    'Cada servicio vecino da +1 punto, máximo +3. Obras resta 2; Ruido, Mala conexión e Impuestos restan 1 por loseta. Litigio bloquea las ventas vecinas. Abrir expediente elimina ese bloqueo para una vivienda y cuesta 1 acción. Consultar un plano permite mirar una loseta en secreto, pero no la explora. Recuperar prioridades libera todas tus reservas.',
  ],
  [
    'Especialidad y cierre',
    `Tu ficha pública da +2 en cada venta de su categoría; ya está incluido en la oferta. No hay objetivos secretos. Vender ${DEFAULTS.closeAt} de una categoría activa el cierre: acabas tu turno y el rival dispone de un último turno completo. Cierre +${DEFAULTS.closeBonus}; igualar el cierre en la respuesta +2. Remontada: si empiezas tu turno con ${DEFAULTS.comebackGap} puntos de ventas o más por detrás, robas 1 cliente gratis. Para compensar la iniciativa, quien empieza solo tiene ${DEFAULTS.openingActions} acción en su primer turno. Mayorías: lujo +4, media +3, barata +2; cada trío de categorías +${DEFAULTS.diversity}. Sin cierre, termina la ronda ${DEFAULTS.maxRounds}. Cerrar primero no garantiza ganar.`,
  ],
  [
    'Edición 0.2.3',
    'Cierre con 4 ventas de una categoría (+6), regla de remontada y primer turno de 1 acción para quien empieza. 37 losetas: Ayuntamiento, 25 viviendas (8 lujosas, 8 medias y 9 baratas), 6 servicios y 5 incidencias. 24 clientes, 30 cartas de juego (5 efectos) y 3 especialidades públicas. Las partidas anteriores quedan archivadas por el cambio de mazo. Validada con pruebas automatizadas de reglas, partidas completas, modo online, laboratorio y tamaños móvil/escritorio.',
  ],
] as const;
