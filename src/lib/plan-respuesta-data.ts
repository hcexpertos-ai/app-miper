// Plan de Respuesta ante Emergencias en Centros de Trabajo
// Basado en: Formato Tipo ACHS – DS 44 / Ley 16.744
// SENAPRED – Metodología ACCEDER

export interface Emergencia {
  id: string
  nombre: string
  icono: string
  color: string        // Tailwind bg color class
  info_contexto?: string[]
  procedimiento_lrc: string[]
  procedimiento_ede: string[]
  procedimiento_pg: string[]
}

export interface EdeItem {
  titular: string
  suplente: string
  area: string
  zona_seguridad: string
  n_personas: string
}

export interface PersonaDiscapacidad {
  nombre: string
  tipo_discapacidad: string
  tipo_ayuda: string
  encargado: string
  suplente: string
}

export interface Turno {
  nombre: string
  n_trabajadores: string
  hora_inicio: string
  hora_termino: string
  observaciones: string
}

export interface ConfigPlan {
  // Portada / Identificación del documento
  codigo: string
  revision: string
  version: string
  vigencia: string
  elaborado_por: string
  cargo_elaborado: string
  fecha_elaboracion: string
  revisado_por: string
  cargo_revisado: string
  fecha_revision: string
  aprobado_por: string
  cargo_aprobado: string
  fecha_aprobacion: string

  // Instalaciones (algunos se auto-rellenan desde el store)
  nombre_centro: string
  tipo_centro: string
  direccion: string
  numero: string
  comuna: string
  region: string
  descripcion_entorno: string
  cobertura_celular: boolean
  acceso_internet: string

  // Carga ocupacional
  n_propios: string
  n_contratistas: string
  n_proveedores: string
  n_externos: string
  n_visitas: string
  n_no_espanol: string
  n_menores: string
  n_discapacidad: string
  n_gestantes: string

  // Turnos
  turnos: Turno[]

  // ACCEDER – Alerta y Alarma
  encargado_alerta: string
  validacion_alerta: string
  acciones_alerta: string
  encargado_alarma: string
  tipo_alarma: string
  como_alarma: string

  // ACCEDER – Comunicación
  encargado_com_interna: string
  encargado_com_externa: string

  // ACCEDER – Coordinación
  lrc_titular: string
  lrc_suplente: string
  zona_seguridad_interna: string
  zona_seguridad_externa: string
  ede: EdeItem[]
  personas_discapacidad: PersonaDiscapacidad[]

  // Emergencias
  emergencias_activas: Record<string, boolean>
  emergencias_notas: Record<string, string>
}

export const CONFIG_PLAN_DEFAULT: ConfigPlan = {
  codigo: 'ANEXO_01',
  revision: '00',
  version: '02',
  vigencia: '',
  elaborado_por: '',
  cargo_elaborado: '',
  fecha_elaboracion: '',
  revisado_por: '',
  cargo_revisado: '',
  fecha_revision: '',
  aprobado_por: '',
  cargo_aprobado: '',
  fecha_aprobacion: '',
  nombre_centro: '',
  tipo_centro: 'casa_matriz',
  direccion: '',
  numero: '',
  comuna: '',
  region: '',
  descripcion_entorno: '',
  cobertura_celular: true,
  acceso_internet: '4G',
  n_propios: '',
  n_contratistas: '',
  n_proveedores: '',
  n_externos: '',
  n_visitas: '',
  n_no_espanol: '',
  n_menores: '',
  n_discapacidad: '',
  n_gestantes: '',
  turnos: [
    { nombre: 'Diurno', n_trabajadores: '', hora_inicio: '08:00', hora_termino: '18:00', observaciones: '' }
  ],
  encargado_alerta: '',
  validacion_alerta: '',
  acciones_alerta: '',
  encargado_alarma: '',
  tipo_alarma: '',
  como_alarma: '',
  encargado_com_interna: '',
  encargado_com_externa: '',
  lrc_titular: '',
  lrc_suplente: '',
  zona_seguridad_interna: '',
  zona_seguridad_externa: '',
  ede: [
    { titular: '', suplente: '', area: '', zona_seguridad: '', n_personas: '' }
  ],
  personas_discapacidad: [],
  emergencias_activas: {
    sismos: true,
    incendio_estructural: true,
    corte_agua: true,
    corte_electrico: true,
    asalto_robo: true,
    accidentes_graves: true,
    orden_publico: false,
    artefactos_explosivos: false,
    sustancias_peligrosas: false,
    tsunamis: false,
    nevadas: false,
    marejadas: false,
    inundacion_crecidas: false,
    inundacion_aguas_lluvias: false,
    aluviones: false,
    incendio_forestal: false,
    erupciones_volcanicas: false,
    amenazas_biologicas: false,
    fugas_gas: true,
    balacera: false,
    altas_temperaturas: true,
  },
  emergencias_notas: {},
}

export const EMERGENCIAS: Emergencia[] = [
  {
    id: 'sismos',
    nombre: 'Sismos',
    icono: '🌍',
    color: 'bg-orange-100 border-orange-300',
    info_contexto: [
      'La Escala de Mercalli establece XII niveles de intensidad.',
      'Entre intensidades I y IV: no se activa el plan; continuar labores normales.',
      'Desde intensidad V en adelante (líquidos oscilan, percibido en exterior): ACTIVAR el plan.',
    ],
    procedimiento_lrc: [
      'Evaluar la intensidad del sismo según Escala de Mercalli. Activar plan desde intensidad V.',
      'Activar la alarma de evacuación total externa.',
      'Coordinar el corte de suministros que puedan generar emergencias secundarias (gas, electricidad, agua) asegurando que el corte no perjudique la evacuación.',
      'Activar planes específicos si hay personas lesionadas o emergencias secundarias (incendios, fugas de gas, derrames).',
      'Activar equipo interno de intervención y coordinar apoyo de organismos externos.',
    ],
    procedimiento_ede: [
      'Asegurar que las vías de evacuación estén seguras y expeditas (sin vidrios, fuego, obstáculos).',
      'Verificar que personas con problemas de desplazamiento sean apoyadas por los responsables asignados.',
      'Verificar en zona de seguridad la presencia total de personas y sus condiciones de salud.',
      'Comunicar el estado de personas y condiciones de la estructura al Líder de respuesta.',
    ],
    procedimiento_pg: [
      'Mantener la calma. Ubicarse en lugares de protección sísmica, alejados de ventanas y elementos que puedan caerse.',
      'Si está en silla de ruedas: solicitar ayuda, frenar la silla y cubrir cabeza y cuello con los brazos.',
      'Si está en calle o patio: alejarse de edificios, postes y cables eléctricos.',
      'Seguir instrucciones de los responsables de evacuación.',
      'Evacuar siguiendo indicaciones del Encargado. Dirigirse a la zona de seguridad externa más cercana.',
      'Comunicar cualquier problema de salud al Encargado de evacuación.',
      'Permanecer en zona de seguridad hasta que se indique lo contrario.',
    ],
  },
  {
    id: 'incendio_estructural',
    nombre: 'Incendio Estructural',
    icono: '🔥',
    color: 'bg-red-100 border-red-300',
    procedimiento_lrc: [
      'Confirmar el motivo de la alerta: humo, fuego incipiente (amago) o incendio declarado. Determinar área afectada.',
      'Si fuego incipiente: activar evacuación parcial externa. Si incendio declarado: activar evacuación total externa.',
      'Activar equipo interno de intervención y respuesta ante incendios.',
      'Coordinar asistencia de bomberos (132). Al llegar, entregar: personal evacuado, área siniestrada, intervención en curso, sustancias peligrosas presentes.',
      'Solicitar a EDE el resultado de la evacuación: personas evacuadas, lesionados y atrapados. Comunicar a bomberos si hay atrapados.',
      'Verificar al término que los lugares estén aptos para su uso antes de autorizar el retorno.',
    ],
    procedimiento_ede: [
      'Interrumpir inmediatamente el trabajo al detectar fuego, humo o calor anormal.',
      'Alertar al Líder de respuesta o activar sistemas de alerta automática (pulsadores) si existen.',
      'Emplear técnicas de extinción solo si está capacitado y entrenado para usar extintores o redes contra incendio.',
      'Evacuar al activarse la alarma siguiendo instrucciones. Si hay humo en las vías: desplazarse pegado al piso (gateo) protegiendo las vías respiratorias.',
      'Retornar al puesto de trabajo solo si el Encargado de evacuación lo indica.',
    ],
    procedimiento_pg: [
      'Interrumpir inmediatamente el trabajo al detectar fuego, humo o calor anormal.',
      'Alertar al Líder de respuesta o activar pulsadores de incendio y esperar instrucciones en lugar seguro.',
      'Emplear extintor solo si está capacitado para ello.',
      'Evacuar siguiendo instrucciones del Encargado. Si hay humo: desplazarse pegado al piso protegiendo vías respiratorias.',
      'Retornar al puesto solo si el Encargado de evacuación lo indica.',
    ],
  },
  {
    id: 'corte_agua',
    nombre: 'Corte de Agua',
    icono: '💧',
    color: 'bg-blue-100 border-blue-300',
    info_contexto: [
      'Corte parcial: afecta solo algunas áreas.',
      'Corte general con respaldo: afecta todo el CT pero hay sistemas alternativos.',
      'Corte general sin respaldo: afecta todo el CT y no hay alternativa.',
    ],
    procedimiento_lrc: [
      'Evaluar el grado del corte: parcial o general.',
      'Comunicar al encargado de servicios generales para activar sistemas de respaldo (estanques, bombas).',
      'Informar al supervisor del área afectada, priorizando procesos que dependen del agua.',
      'Coordinar con EDE la evacuación total operativa si el corte prolongado compromete continuidad por aspectos técnicos o sanitarios.',
    ],
    procedimiento_ede: [
      'Indicar al personal que paralice actividades y evacúe las áreas por suspensión de operaciones.',
      'Asegurar que equipos y máquinas que requieren agua queden con llaves cerradas antes de reponer el suministro.',
      'Informar al Líder el estado de evacuación: áreas evacuadas, emergencias secundarias, bloqueo de equipos.',
    ],
    procedimiento_pg: [
      'El personal autorizado debe cerrar llaves de equipos que requieran agua antes de que se restablezca el suministro.',
      'Comunicar de inmediato al supervisor si el corte fue causado por un problema local.',
      'Chequear equipos y maquinarias para evitar saturación al restablecer el suministro.',
      'Al activarse alarma de evacuación operativa: detenerse y ponerse a disposición del Encargado de evacuación.',
      'Evacuar siguiendo instrucciones. Solo realizar tareas de término de turno previa coordinación.',
    ],
  },
  {
    id: 'corte_electrico',
    nombre: 'Corte de Energía Eléctrica',
    icono: '⚡',
    color: 'bg-yellow-100 border-yellow-300',
    info_contexto: [
      'Corte parcial: afecta solo algunas áreas.',
      'Corte general con respaldo: hay generadores o subestaciones alternativas.',
      'Corte general sin respaldo: no hay alternativa.',
    ],
    procedimiento_lrc: [
      'Evaluar el grado del corte: parcial o general.',
      'Comunicar al encargado de servicios generales para activar sistemas de respaldo (generadores, subestaciones).',
      'Informar al supervisor del área afectada, priorizando procesos que dependen del suministro eléctrico.',
      'Coordinar con EDE la evacuación total operativa si el corte prolongado compromete la continuidad de la operación.',
    ],
    procedimiento_ede: [
      'Indicar al personal paralizar actividades y evacuar las áreas por suspensión de operaciones.',
      'Asegurar que equipos o sistemas identificados queden bloqueados por personal autorizado antes de reponer el suministro.',
      'Verificar si hay trabajadores en salas, monta cargas o ascensores dependientes de energía; comunicar al Líder para activar respuesta.',
      'Informar al Líder el estado de evacuación: áreas, emergencias secundarias, bloqueo de equipos.',
    ],
    procedimiento_pg: [
      'Desenchufar herramientas y equipos eléctricos para protegerlos de alzas de tensión al retornar la electricidad.',
      'Comunicar de inmediato al supervisor si el corte se originó en un problema local o podría generar emergencia mayor.',
      'Evitar encender velas, papeles u otros elementos no autorizados (riesgo de incendio).',
      'Al activarse alarma de evacuación operativa: detenerse y ponerse a disposición del Encargado.',
      'Mantener la calma si quedas encerrado en ascensores, pedir auxilio y esperar equipos de respuesta.',
    ],
  },
  {
    id: 'asalto_robo',
    nombre: 'Asalto o Robo',
    icono: '🚨',
    color: 'bg-red-100 border-red-300',
    procedimiento_lrc: [
      'Generar alarma a instituciones policiales (PDI 134 o Carabineros 133) cuando sea seguro hacerlo, entregando: tipo de emergencia, dirección, calles de referencia, si los delincuentes están aún en el CT. Si no puede activarse durante el asalto, activar una vez que los delincuentes se retiren.',
      'Indicar que bajo ninguna circunstancia se debe poner resistencia a personas armadas.',
      'Activar respuesta de salud (ACHS 1404 o SAMU 131) si hay personas lesionadas.',
      'Derivar a personas afectadas emocionalmente al centro médico ACHS para contención psicológica.',
    ],
    procedimiento_ede: [
      'Bajo ninguna circunstancia poner resistencia a personas armadas.',
      'Evacuar a las personas del área si existe peligro en el interior.',
      'Evacuar parcialmente a zonas internas de seguridad en caso de balaceras en el exterior.',
      'Comunicar al Líder ante personas lesionadas, solicitando apoyo de salud (ACHS 1404 o SAMU 131).',
      'Comunicar al Líder si hay personas afectadas emocionalmente para derivación a ACHS.',
    ],
    procedimiento_pg: [
      'Bajo ninguna circunstancia poner resistencia a personas armadas.',
      'Actuar con tranquilidad y prudencia ante situaciones de riesgo o intimidación.',
      'Obedecer instrucciones de los asaltantes, mantener la calma y memorizar rasgos, palabras, sexo, edad y vestimenta para la investigación posterior.',
      'Si es tomado como rehén: no resistirse ni intentar escapar.',
      'Tirarse al suelo y cubrirse la cabeza si hay disparos en el interior. En balacera exterior: dirigirse a zonas internas de seguridad.',
      'Informar al Encargado de evacuación si se encuentra lesionado.',
      'Retornar al puesto solo si el Encargado lo indica.',
    ],
  },
  {
    id: 'accidentes_graves',
    nombre: 'Accidentes Graves / Situaciones Médicas',
    icono: '🏥',
    color: 'bg-pink-100 border-pink-300',
    info_contexto: [
      'Identificar quién es la persona afectada: trabajador directo, trabajador externo (contratista/proveedor), o persona ajena (cliente/visita).',
    ],
    procedimiento_lrc: [
      'Identificar la persona afectada (trabajador directo, externo o ajeno a la organización).',
      'Convocar equipo de respuesta e intervención. El equipo debe: asegurar la escena, aplicar ABC del trauma y RCP, aplicar técnicas de inmovilización y traslado, aplicar triage en caso de múltiples víctimas, aplicar maniobra de Heimlich si corresponde.',
      'Solicitar ambulancia según corresponda: trabajador directo → ACHS 1404 / 800 800 1404; trabajador externo → organismo administrador respectivo o SAMU 131; persona ajena → SAMU 131.',
      'Solicitar suspensión del trabajo en el área afectada.',
      'Instruir evacuación y protección del área hasta descartar riesgo para otros.',
      'Evaluar con EDE si es posible retornar al puesto de trabajo.',
    ],
    procedimiento_ede: [
      'Dar indicaciones al personal para evacuar el lugar y dirigirse a zona de seguridad externa.',
      'Iniciar evacuación conforme al plan.',
      'Asegurar que personas con problemas de desplazamiento sean apoyadas por los responsables asignados.',
      'Verificar en zona de seguridad la presencia total de personas y sus condiciones de salud.',
      'Comunicar el estado de evacuación y resguardo del área al Líder de respuesta.',
    ],
    procedimiento_pg: [
      'No actuar por iniciativa propia al querer ayudar a un accidentado.',
      'Retirarse del lugar del accidente cuando la persona ya esté recibiendo ayuda.',
      'Cumplir instrucciones indicadas, tanto si eres el accidentado como si eres testigo.',
      'Evacuar el área de trabajo si el Encargado de evacuación lo indica.',
      'Comunicar al Encargado cualquier problema de salud propio o de personas evacuadas.',
      'Permanecer en zona de seguridad hasta que se indique lo contrario.',
    ],
  },
  {
    id: 'orden_publico',
    nombre: 'Alteraciones de Orden Público',
    icono: '🪧',
    color: 'bg-purple-100 border-purple-300',
    info_contexto: [
      'Las alertas pueden generarse ante convocatoria de grupos, turbas o manifestantes en las inmediaciones del CT.',
    ],
    procedimiento_lrc: [
      'Informar la alerta a encargados de seguridad física y coordinar cierre, bloqueo y protección de puertas y ventanas.',
      'Comunicar a los responsables de evacuación que el personal debe permanecer en su lugar de trabajo. Informar a los trabajadores sobre la situación.',
      'Mantener atención al comportamiento de la manifestación. Si aumenta en número y hay posibilidad de graves alteraciones: indicar el abandono inmediato del CT.',
      'Si los hechos se trasladan al interior del CT: activar alarma y evacuar al exterior de inmediato, incluyendo personal de seguridad. Prohibir el enfrentamiento.',
      'Comunicar a la autoridad policial competente.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación total externa. La zona de seguridad dependerá del contexto y comportamiento de la manifestación.',
      'Verificar que personas con problemas de desplazamiento sean apoyadas.',
      'Informar si hay personas lesionadas o atrapadas.',
      'Verificar en zona de seguridad la presencia total de personas y sus condiciones de salud.',
      'Comunicar el estado de la situación al Líder de respuesta.',
    ],
    procedimiento_pg: [
      'Informar de inmediato al detectar grupos o turbas en las inmediaciones del CT y mantenerse en el interior.',
      'Mantener una actitud que no desafíe a los participantes (evitar actitudes desafiantes, grabar, gritar, insultar).',
      'Mantener distancia de puertas y ventanas. Si ingresan: no prestar resistencia, no confrontar, retirarse y mantenerse unido al equipo.',
      'Evacuar inmediatamente si el Encargado de evacuación lo indica.',
      'Comunicar al Encargado cualquier problema de salud propio o de otras personas evacuadas.',
    ],
  },
  {
    id: 'artefactos_explosivos',
    nombre: 'Artefactos Explosivos',
    icono: '💣',
    color: 'bg-red-100 border-red-300',
    info_contexto: [
      'Dos formas de alerta: (1) Aviso anónimo telefónico u otro medio. (2) Detección de artefacto o paquete sospechoso.',
    ],
    procedimiento_lrc: [
      'Recopilar la mayor cantidad de información para entregar a la autoridad policial.',
      'Avisar al EDE y personal de seguridad para evacuar a todas las personas sin excepción, alejándolas al menos 300 metros del CT.',
      'Solicitar a guardias/vigilantes tomar procedimiento de resguardo y eventual revisión de instalaciones.',
      'Finalizar evacuación solo cuando las autoridades especialistas determinen que no hay peligro.',
      'En caso de activarse el artefacto: activar alarma de evacuación de inmediato y asegurar traslado de heridos a servicios médicos.',
    ],
    procedimiento_ede: [
      'Al recibir información de amenaza y activarse alarma: activar plan en el área asignada.',
      'Verificar que personas con problemas de desplazamiento sean apoyadas.',
      'Verificar la presencia total de personas en zona de seguridad y sus condiciones de salud.',
      'Comunicar el estado de situación al Líder de respuesta.',
    ],
    procedimiento_pg: [
      'Si recibe llamada con aviso de bomba: comunicar de inmediato al Líder de respuesta y tratar de obtener la mayor cantidad de antecedentes.',
      'Una vez iniciada la evacuación: seguir instrucciones del Encargado de evacuación.',
      'Si encuentra objeto o paquete sospechoso: NO tocarlo. Solo informar al Líder de respuesta y seguir instrucciones.',
      'No divulgar la información para evitar pánico colectivo.',
      'Si se activa el artefacto: tirarse al piso de inmediato, acercarse a una pared y permanecer tendido 15–30 minutos.',
      'En caso de heridos o atrapados: permanecer en el sitio haciendo ruidos con objetos para ser atendidos.',
      'Seguir instrucciones de las autoridades que atiendan el siniestro.',
    ],
  },
  {
    id: 'sustancias_peligrosas',
    nombre: 'Sustancias Peligrosas',
    icono: '☢️',
    color: 'bg-green-100 border-green-300',
    info_contexto: [
      'Alerta Verde: situación conocida en espacio y tiempo, monitoreo preventivo.',
      'Alerta Amarilla: emergencia compleja declarada, alistarse para intervenir.',
      'Alerta Roja: emergencia compleja, movilizar todos los recursos disponibles.',
    ],
    procedimiento_lrc: [
      'Activar evacuación total (incendios/explosiones) o parcial (derrames/fugas) según envergadura y ubicación.',
      'Informar a autoridades según tipo de emergencia: derrame/incendio químico → Bomberos 132; elementos nucleares/radioactivos → CCHEN (2) 2364 6100; biológicos → Ministerio de Salud 600 360 777; síntomas toxicológicos → CITUC +56 2 635 3800.',
      'Activar equipos de intervención específicos para sustancias peligrosas con sus procedimientos de control.',
      'Mantener hojas de datos de seguridad y plano de emplazamiento de almacenamientos para entregar a bomberos.',
      'Verificar que todas las personas del área afectada evacuaron. En caso contrario: informar a bomberos (no permitir que lo hagan personas no entrenadas).',
      'Inspeccionar áreas e instalaciones antes de instruir el retorno.',
    ],
    procedimiento_ede: [
      'Evacuar la totalidad de las personas del área afectada a zona de seguridad externa.',
      'Buscar alternativas de vías de evacuación si estas se encuentran afectadas.',
      'Comunicar al Líder el estado de evacuación.',
      'Controlar y mantener personas en zona segura hasta nueva indicación.',
      'Impedir que las personas regresen al lugar evacuado.',
    ],
    procedimiento_pg: [
      'Mantener la calma. No intervenir ante un derrame, fuga o accidente con sustancias químicas.',
      'Alejarse inmediatamente de la zona afectada. Nunca intentar intervenir.',
      'Informar de inmediato ante intoxicaciones propias o de otros, sin intentar ayudar con métodos no autorizados.',
      'Evacuar siguiendo indicaciones del Encargado de evacuación.',
      'Comunicar al Encargado si presenta algún síntoma o malestar.',
      'Permanecer en zona de seguridad hasta nuevas indicaciones.',
    ],
  },
  {
    id: 'tsunamis',
    nombre: 'Tsunamis o Maremotos',
    icono: '🌊',
    color: 'bg-blue-100 border-blue-300',
    info_contexto: [
      'Señales naturales: sismo que dificulta mantenerse en pie, sismo de 30 segundos o más, rápido recogimiento del mar que expone el fondo marino.',
      'Alerta Roja SENAPRED: sismo de campo cercano o lejano que genera amenaza de tsunami.',
      'Zona de seguridad: sobre la línea máxima de inundación (cota 30 msnm), definida por el municipio.',
    ],
    procedimiento_lrc: [
      'Activar alarma de evacuación total externa ante alerta roja de SENAPRED o ante cualquier señal natural de tsunami.',
      'Dirigir la evacuación hacia zonas de seguridad de tsunami definidas por el municipio (cota 30 msnm).',
      'Evitar el uso de vehículos en zonas urbanas densamente pobladas para no congestionar las vías.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación total externa hacia zonas de seguridad señalizadas por la municipalidad.',
      'Transportar el kit de emergencia para tsunamis definido para su área.',
      'Si no hay vías señalizadas: identificar calles o caminos más directos a zonas altas, alejados de cursos de agua, sin cruzar ríos ni esteros.',
      'No usar vehículos en zonas urbanas densamente pobladas.',
      'Verificar presencia total de personas en zona de seguridad. Cumplir instrucciones de la autoridad.',
    ],
    procedimiento_pg: [
      'Evacuar siguiendo indicaciones del Encargado, dirigiéndose a las zonas de seguridad señalizadas por el municipio.',
      'Si no hay señalización: identificar calles a zonas altas, alejadas de cursos de agua, sin cruzar ríos ni esteros.',
      'No usar medios de transporte en zonas urbanas para evitar congestión.',
      'Comunicar al Encargado cualquier problema de salud.',
      'Retornar al CT solo cuando el personal a cargo lo notifique oficialmente basándose en organismos gubernamentales.',
    ],
  },
  {
    id: 'nevadas',
    nombre: 'Nevadas',
    icono: '❄️',
    color: 'bg-sky-100 border-sky-300',
    info_contexto: [
      'Alerta Verde Temprana Preventiva: monitoreo y vigilancia preventiva.',
      'Alerta Amarilla: amenaza que crece, alistar recursos para intervenir.',
      'Alerta Roja: amenaza grave, movilizar todos los recursos disponibles.',
    ],
    procedimiento_lrc: [
      'Ante alerta verde/amarilla: mantener vigilancia, preparar recursos (agua embotellada, alimentos, ropa abrigada, combustible, generadores, vehículos con cadenas).',
      'Coordinar protección de puertas, ventanas y fuentes de agua para evitar congelamiento. Limpiar nieve acumulada en techos si es posible.',
      'Mantener despejado el acceso, veredas y caminos frente a la instalación.',
      'Ante alerta roja: activar evacuación total operativa. Suspender operaciones e instruir el retiro inmediato de todos los trabajadores.',
    ],
    procedimiento_ede: [
      'Dar indicaciones al personal para evacuar el CT ante alerta roja.',
      'Verificar cierre de la instalación: proteger puertas, ventanas, sistemas eléctricos, agua y alimentos.',
      'Asegurar que los vehículos estén preparados con combustible y cadenas para nieve.',
      'Verificar que ningún trabajador quede en el CT.',
      'Regresar al CT si alguna condición de traslado no es segura. Comunicar al coordinador.',
    ],
    procedimiento_pg: [
      'Mantener teléfonos o radios con carga completa antes de evacuar.',
      'Cubrir artefactos, maquinarias y cañerías para evitar congelamiento.',
      'Hidratarse con líquidos calientes y consumir alimentos ricos en proteína. Usar ropa de abrigo.',
      'Evacuar siguiendo indicaciones del responsable de evacuación.',
      'Al conducir: informar condiciones de la ruta, movilizarse siempre acompañado, usar cadenas, luces encendidas. Evitar conducir de noche.',
      'Si hay tormenta o ventisca al conducir: detenerse en lugar seguro, activar luces intermitentes y esperar mejores condiciones.',
    ],
  },
  {
    id: 'marejadas',
    nombre: 'Marejadas',
    icono: '🌬️',
    color: 'bg-blue-100 border-blue-300',
    info_contexto: [
      'Alerta Verde Temprana Preventiva: monitoreo y vigilancia preventiva.',
      'Alerta Amarilla: amenaza que crece, alistar recursos.',
      'Alerta Roja: amenaza grave, movilizar todos los recursos.',
    ],
    procedimiento_lrc: [
      'Ante alerta roja por marejadas: activar evacuación total interna (evacuar a zonas de seguridad internas en lugares protegidos estructuralmente).',
      'Coordinar instalación de protecciones en fachadas expuestas (puertas, ventanas, accesos).',
      'Señalar a trabajadores que eviten desplazarse cerca de la costa.',
      'Prestar atención a indicaciones de la Autoridad Marítima, radio avisos náuticos y mensajes del SHOA (www.shoa.mil.cl).',
    ],
    procedimiento_ede: [
      'Iniciar evacuación total interna según plan de evacuación.',
      'Informar al personal que no se expongan a rompientes y oleaje, especialmente en roquerías.',
      'Resguardar la instalación protegiendo ventanas y usando barreras (sacos de arena).',
      'Verificar presencia total de personas en zona de seguridad y sus condiciones de salud.',
    ],
    procedimiento_pg: [
      'Evacuar siguiendo indicaciones del Encargado de evacuación.',
      'Cortar energía eléctrica de herramientas o equipos en uso. Cerrar llaves de paso de agua y gas.',
      'Dirigirse a la zona de seguridad más cercana.',
      'Comunicar al Encargado cualquier problema de salud.',
      'Permanecer en zona de seguridad hasta que se indique lo contrario.',
    ],
  },
  {
    id: 'inundacion_crecidas',
    nombre: 'Inundaciones por Crecidas de Cauce',
    icono: '🏞️',
    color: 'bg-teal-100 border-teal-300',
    info_contexto: [
      'Las inundaciones más comunes son originadas por crecidas de ríos que desbordan sus lechos. Pueden ser consecuencia de lluvias, deshielos, deslizamientos o tsunamis.',
    ],
    procedimiento_lrc: [
      'Comprobar la alerta por inundación por crecida de cauce.',
      'Activar evacuación parcial interna si la inundación no es extensa ni severa (monitorear permanentemente para actualizar el plan), o evacuación total externa si es extensa y severa.',
      'Si no es posible salir al exterior: evacuar hacia plantas superiores y esperar rescate externo o baja del nivel de agua.',
      'Coordinar equipos de intervención para: proteger equipos y archivos, aislar zonas con sacos de arena u otras contenciones, monitorear nivel de agua.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación parcial interna (el Líder podría actualizar el tipo de evacuación).',
      'Verificar que vías de evacuación estén seguras y expeditas.',
      'Evaluar retiro de equipos críticos desenergizados del posible contacto con el agua.',
      'Verificar apoyo a personas con problemas de desplazamiento.',
      'Dirigir a personas trabajadoras por lugares altos y libres de agua.',
      'Verificar en zona de seguridad la presencia total de personas.',
    ],
    procedimiento_pg: [
      'Interrumpir inmediatamente el trabajo y ponerse a disposición del Encargado de evacuación.',
      'Seguir indicaciones del Encargado para evacuar hacia lugares altos y secos.',
      'Comunicar al Encargado cualquier problema de salud.',
      'Permanecer en zona de seguridad hasta nuevas indicaciones.',
    ],
  },
  {
    id: 'inundacion_aguas_lluvias',
    nombre: 'Inundaciones por Aguas Lluvias',
    icono: '🌧️',
    color: 'bg-cyan-100 border-cyan-300',
    procedimiento_lrc: [
      'Activar el plan ante alerta por inundación por aguas lluvias.',
      'Activar evacuación parcial interna si la inundación es localizada, o evacuación total externa si es extensa.',
      'Coordinar equipos para proteger equipos y archivos, instalar contenciones y monitorear nivel de agua.',
      'Evaluar la necesidad de avisar a bomberos u oficina de emergencia municipal.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación de acuerdo al plan activado (parcial interna o total externa).',
      'Verificar vías de evacuación seguras y expeditas.',
      'Verificar apoyo a personas con problemas de desplazamiento.',
      'Dirigir al personal por lugares altos y libres de agua.',
      'Verificar presencia total de personas en zona de seguridad.',
    ],
    procedimiento_pg: [
      'Interrumpir el trabajo al activarse la alarma y seguir instrucciones del Encargado de evacuación.',
      'Dirigirse a zonas altas y secas según indicaciones.',
      'Comunicar al Encargado cualquier problema de salud propio o de otras personas evacuadas.',
      'Permanecer en zona de seguridad hasta nuevas indicaciones.',
    ],
  },
  {
    id: 'aluviones',
    nombre: 'Aluviones',
    icono: '⛰️',
    color: 'bg-amber-100 border-amber-300',
    info_contexto: [
      'La alerta puede ser emitida por SENAPRED mediante tres niveles: verde, amarilla y roja.',
    ],
    procedimiento_lrc: [
      'Activar la alarma de evacuación total externa al recibir alerta roja de SENAPRED por aluvión.',
      'Dirigir evacuación hacia zonas de seguridad definidas por el municipio (zonas altas, alejadas de cursos de agua).',
      'Coordinar corte de suministros que puedan generar emergencias secundarias.',
      'Activar planes específicos si hay personas lesionadas o emergencias secundarias.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación total externa hacia zonas de seguridad definidas.',
      'Asegurar vías de evacuación alejadas de cursos de agua y zonas de deslizamiento.',
      'Verificar apoyo a personas con problemas de desplazamiento.',
      'Verificar presencia total de personas en zona de seguridad.',
    ],
    procedimiento_pg: [
      'Evacuar siguiendo instrucciones del Encargado de evacuación.',
      'Alejarse de cursos de agua, quebradas y laderas inestables.',
      'No obstaculizar las vías de evacuación con vehículos.',
      'Comunicar al Encargado cualquier problema de salud.',
      'Retornar al CT solo cuando las autoridades lo indiquen.',
    ],
  },
  {
    id: 'incendio_forestal',
    nombre: 'Incendio Forestal',
    icono: '🌲🔥',
    color: 'bg-orange-100 border-orange-300',
    info_contexto: [
      'Alerta Verde Temprana Preventiva: monitoreo y vigilancia preventiva de condiciones de riesgo.',
      'Alerta Amarilla: crecimiento de la amenaza, alistar recursos.',
      'Alerta Roja: amenaza grave y extensa, movilizar todos los recursos disponibles.',
      'CONAF y SENAPRED son las instituciones coordinadoras de la respuesta ante incendios forestales.',
    ],
    procedimiento_lrc: [
      'Ante alerta verde/amarilla: realizar seguimiento a alertas de CONAF y SENAPRED, y preparar condiciones de evacuación preventiva.',
      'Ante alerta roja: activar evacuación total operativa o externa según la ubicación del incendio respecto al CT.',
      'Informar al personal y coordinar con bomberos y autoridades.',
      'Coordinar corte de suministros de gas y electricidad si el incendio se aproxima.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación según tipo activado (operativa o externa).',
      'Dirigir evacuación por vías alejadas de la zona de incendio.',
      'Verificar apoyo a personas con problemas de desplazamiento.',
      'Verificar presencia total de personas en zona de seguridad.',
    ],
    procedimiento_pg: [
      'Evacuar inmediatamente siguiendo las instrucciones del Encargado.',
      'No intentar apagar el fuego forestal sin equipamiento y entrenamiento adecuado.',
      'Alejarse de zonas con vegetación seca, no usar vehículos si las vías están comprometidas.',
      'Comunicar al Encargado cualquier problema de salud.',
      'Retornar al CT solo cuando las autoridades lo autoricen.',
    ],
  },
  {
    id: 'erupciones_volcanicas',
    nombre: 'Erupciones Volcánicas',
    icono: '🌋',
    color: 'bg-red-100 border-red-300',
    info_contexto: [
      'SENAPRED establece niveles de alerta en coordinación con el SERNAGEOMIN.',
      'Los niveles van desde Verde (actividad técnica básica) hasta Roja (erupción en curso o inminente).',
    ],
    procedimiento_lrc: [
      'Activar el plan ante alerta naranja o roja emitida por SERNAGEOMIN/SENAPRED.',
      'Activar evacuación total operativa o externa según la distancia y peligrosidad de la erupción.',
      'Comunicar a los responsables del área e instruir medidas de protección: cerrar ventanas, puertas, proteger equipos de ceniza volcánica.',
      'Coordinarse con autoridades municipales para evacuar hacia zonas de seguridad definidas previamente.',
    ],
    procedimiento_ede: [
      'Iniciar evacuación según tipo activado.',
      'Indicar al personal que use protección nasobucal ante caída de ceniza.',
      'Verificar apoyo a personas con problemas de desplazamiento.',
      'Verificar presencia total de personas en zona de seguridad.',
    ],
    procedimiento_pg: [
      'Evacuar inmediatamente siguiendo instrucciones del Encargado.',
      'Usar mascarilla o tela húmeda para proteger las vías respiratorias ante ceniza volcánica.',
      'Cubrir equipos y maquinaria de la ceniza antes de evacuar si hay tiempo y es seguro.',
      'No retornar al CT hasta que las autoridades lo indiquen.',
    ],
  },
  {
    id: 'amenazas_biologicas',
    nombre: 'Amenazas Biológicas / Sanitarias',
    icono: '🦠',
    color: 'bg-lime-100 border-lime-300',
    info_contexto: [
      'Las amenazas biológicas sanitarias incluyen brotes de enfermedades infecciosas, pandemias u otras emergencias sanitarias que puedan afectar al CT.',
      'La autoridad sanitaria (Ministerio de Salud / SEREMI de Salud) establece los protocolos y niveles de alerta.',
    ],
    procedimiento_lrc: [
      'Activar el plan ante declaración de alerta sanitaria por parte de las autoridades competentes.',
      'Comunicar a todos los trabajadores las medidas preventivas indicadas por la autoridad sanitaria.',
      'Coordinar con el organismo administrador (ACHS/IST/Mutual) las medidas de protección.',
      'Evaluar la suspensión de actividades o la implementación de trabajo remoto según instrucciones de la autoridad.',
    ],
    procedimiento_ede: [
      'Comunicar al personal las instrucciones de la autoridad sanitaria.',
      'Asegurar disponibilidad de elementos de protección personal (mascarillas, guantes, alcohol gel).',
      'En caso de evacuación: velar por medidas de distanciamiento e higiene durante el proceso.',
    ],
    procedimiento_pg: [
      'Seguir estrictamente las instrucciones de las autoridades sanitarias y del Líder de respuesta.',
      'Usar elementos de protección personal indicados.',
      'Informar de inmediato al Líder de respuesta si presenta síntomas propios o detecta síntomas en compañeros.',
      'Mantener higiene personal, lavado de manos y distanciamiento según protocolos.',
    ],
  },
  {
    id: 'fugas_gas',
    nombre: 'Emanaciones o Fugas de Gas',
    icono: '💨',
    color: 'bg-yellow-100 border-yellow-300',
    procedimiento_lrc: [
      'Activar la alarma de evacuación al detectar olor a gas o ante alerta de fuga.',
      'Coordinar el corte del suministro de gas por personal autorizado.',
      'Indicar que no se operen interruptores eléctricos, no se enciendan llamas ni se active ningún equipo que pueda producir chispas.',
      'Contactar a la empresa distribuidora de gas y coordinar asistencia de bomberos (132).',
      'Ventilar las instalaciones solo cuando sea seguro.',
      'Verificar que todas las personas hayan evacuado antes de autorizar el retorno.',
    ],
    procedimiento_ede: [
      'Evacuar inmediatamente a todas las personas del área afectada hacia zona de seguridad externa.',
      'Indicar al personal que no activen interruptores eléctricos ni generen chispas.',
      'Asegurar vías de evacuación libres de obstáculos.',
      'Verificar presencia total de personas en zona de seguridad.',
      'Informar al Líder de respuesta el estado de la evacuación.',
    ],
    procedimiento_pg: [
      'Evacuar de inmediato el área de trabajo siguiendo instrucciones del Encargado.',
      'No accionar interruptores de luz, no encender llamas, no usar el teléfono en la zona de la fuga.',
      'Alejarse de la zona afectada por la vía más corta hacia el exterior.',
      'Comunicar al Encargado cualquier malestar o síntoma de intoxicación.',
      'Permanecer en zona de seguridad hasta que las autoridades o el Líder autoricen el retorno.',
    ],
  },
  {
    id: 'balacera',
    nombre: 'Balacera',
    icono: '⚠️',
    color: 'bg-red-100 border-red-300',
    procedimiento_lrc: [
      'Activar el plan de respuesta ante balacera.',
      'Indicar al personal que se pongan a cubierto de inmediato.',
      'Contactar a Carabineros (133) tan pronto sea seguro hacerlo.',
      'No activar alarmas que puedan revelar la posición de las personas.',
      'Esperar la llegada y liberación del área por parte de Carabineros antes de evacuar o retornar.',
    ],
    procedimiento_ede: [
      'Indicar al personal que se pongan a cubierto y se alejen de ventanas y puertas.',
      'En balacera exterior: evacuar parcialmente a zonas internas de seguridad.',
      'En balacera interior: instruir al personal a guarecerse y esperar la intervención policial.',
      'Comunicar al Líder de respuesta el estado del personal.',
    ],
    procedimiento_pg: [
      'Al oír disparos: ponerse a cubierto de inmediato detrás de elementos que puedan detener proyectiles (muros, pilares), alejarse de ventanas.',
      'En balacera exterior: permanecer en el interior del edificio, alejarse de ventanas y puertas.',
      'En balacera interior: buscar cubierto, no correr si ello implica cruzar zonas de peligro.',
      'Mantenerse en silencio y en posición baja hasta que Carabineros declare el área segura.',
      'Comunicar al Encargado si hay heridos en el área donde se encuentra.',
    ],
  },
  {
    id: 'altas_temperaturas',
    nombre: 'Altas Temperaturas / Golpe de Calor',
    icono: '🌡️',
    color: 'bg-orange-100 border-orange-300',
    info_contexto: [
      'Trabajadores especialmente sensibles: mayores de 65 años, personas con enfermedades crónicas (hipertensión, diabetes, insuficiencia cardíaca), personas con sobrepeso, embarazadas.',
      'Signos de golpe de calor: temperatura corporal > 40°C, piel caliente y seca, confusión, pérdida de conocimiento.',
    ],
    procedimiento_lrc: [
      'Activar medidas preventivas ante alerta de altas temperaturas por SENAPRED/DGMT.',
      'Identificar a trabajadores especialmente sensibles y aplicar medidas adicionales de protección.',
      'Asegurar disponibilidad de agua fresca potable, sombra y áreas de descanso.',
      'Evaluar la suspensión o adecuación de tareas en horarios de mayor temperatura (12:00–15:00 hrs).',
      'Ante caso de golpe de calor: activar respuesta de salud, contactar ACHS 1404 o SAMU 131.',
    ],
    procedimiento_ede: [
      'Supervisar el estado de los trabajadores en el área, especialmente los más sensibles.',
      'Asegurar acceso a agua, sombra y áreas de descanso.',
      'Ante síntomas de golpe de calor: informar al Líder de respuesta de inmediato.',
    ],
    procedimiento_pg: [
      'Hidratarse frecuentemente con agua fresca, incluso sin sentir sed (al menos 250 ml cada 20 minutos en trabajos al aire libre).',
      'Usar ropa liviana, de colores claros y protección solar (sombrero, bloqueador).',
      'Aprovechar sombra y descansos en espacios frescos.',
      'Evitar bebidas alcohólicas, con cafeína o muy frías durante el trabajo.',
      'Informar de inmediato al Encargado de evacuación ante síntomas: mareo, dolor de cabeza, piel muy caliente y seca, confusión.',
      'Ante compañero inconsciente o con síntomas graves: activar respuesta de emergencia inmediatamente.',
    ],
  },
]

export const REGIONES_CHILE = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana de Santiago',
  'Región del Libertador Gral. Bernardo O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén del Gral. Carlos Ibáñez del Campo',
  'Región de Magallanes y de la Antártica Chilena',
]
