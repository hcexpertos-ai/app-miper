// =============================================================
// APP MIPER · Biblioteca de Reglas Preventivas
// Motor local de IA — basado en normativa chilena vigente
// DS 44 · Ley 16.744 · DS 594 · Ley Karin · Protocolos MINSAL
// =============================================================

import type { SugerenciaIA } from '../../types/ai'

export interface ReglaPreventiva {
  id:         string
  nombre:     string
  keywords:   string[]   // palabras clave a buscar en el corpus de la tarea
  threshold:  number     // mínimo de keywords que deben coincidir
  sugerencias: SugerenciaIA[]
}

export const REGLAS_MIPER: ReglaPreventiva[] = [

  // ─── 1. POLVO DE HARINA ────────────────────────────────────────────────────
  {
    id:        'polvo_harina',
    nombre:    'Exposición a polvo de harina',
    keywords:  ['harina', 'amasadora', 'panaderia', 'panadero', 'masa', 'amasar',
                'pasteleria', 'galleteria', 'tortilleria', 'polvos organicos'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a polvo de harina (polvo orgánico respirable)',
        riesgo:              'Sensibilización alérgica y enfermedad respiratoria ocupacional',
        consecuenciaEsperada:'Asma del panadero, rinitis alérgica, EPOC; daño pulmonar irreversible por exposición crónica sin controles',
        factorRiesgo:        'materias_primas',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar sistema de ventilación localizada (extracción) en zona de amasado, pesaje y dosificación de harina',
            responsableSugerido:   'Jefe de Producción',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Limpieza húmeda de superficies al término de cada turno. Prohibir el barrido en seco en toda el área de producción',
            responsableSugerido:   'Encargado de turno',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: false,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Dotar de mascarilla de protección respiratoria FFP2 o superior durante dosificación y amasado. Verificar ajuste facial',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:       'DS N° 594/1999, Artículos 41–54',
            fundamento:  'Límites permisibles de polvo orgánico respirable en el ambiente de trabajo. Obliga a controles de ingeniería y vigilancia ambiental',
          },
          {
            norma:       'PLANESI — Plan Nacional de Erradicación de la Silicosis (aplica a polvos orgánicos)',
            fundamento:  'Vigilancia médica periódica obligatoria para trabajadores expuestos a polvos respirables',
          },
          {
            norma:       'Ley N° 16.744, Artículo 68',
            fundamento:  'Obligación del empleador de implementar todas las medidas de higiene y seguridad necesarias para prevenir enfermedades profesionales',
          },
        ],
        justificacionTecnica: 'La harina de trigo contiene alérgenos proteicos (albúminas, globulinas, α-amilasas) que, por sensibilización repetida, desencadenan asma ocupacional. La prevalencia del asma del panadero supera el 15% en trabajadores sin controles. El polvo de harina es el agente causal más frecuente de enfermedad respiratoria profesional en el sector alimentario en Chile.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Contacto con amasadoras, batidoras y laminadoras con partes móviles sin protección',
        riesgo:              'Atrapamiento, aplastamiento o amputación de dedos, manos o extremidades superiores',
        consecuenciaEsperada:'Amputación parcial o total de dedos o mano; fracturas graves; incapacidad permanente',
        factorRiesgo:        'maquinas_herramientas',
        probabilidadSugerida:'baja',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Instalar y mantener guardas de seguridad fijas o con enclavamiento (interlock) en todos los puntos de atrapamiento de amasadoras, batidoras y laminadoras. Verificar que el enclavamiento impida el arranque con la guarda abierta.', responsableSugerido: 'Jefe de Mantenimiento', plazoSugerido: '15 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Establecer procedimiento de bloqueo y etiquetado (LOTO) obligatorio para limpieza, mantenimiento y desatasco de maquinaria. Prohibir usar ropa suelta, anillos o pulseras al operar máquinas con partes móviles. Capacitar a todo el personal.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Prohibir el uso de guantes de tela cerca de partes giratorias (riesgo de arrastre). Usar guantes de nitrilo de ajuste fino solo en tareas de manipulación de alimentos, nunca cerca del punto de atrapamiento.', responsableSugerido: 'Encargado de turno', plazoSugerido: 'Inmediato', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 16 y 17', fundamento: 'Toda maquinaria con partes móviles accesibles debe contar con protecciones que impidan el contacto accidental del trabajador.' },
          { norma: 'NCh 1952 — Principios de seguridad en maquinaria', fundamento: 'Establece requisitos de guardas y dispositivos de seguridad para maquinaria industrial.' },
        ],
        justificacionTecnica: 'Los atrapamientos en maquinaria de panadería son la primera causa de accidentes graves en el sector. Las amasadoras de espiral y las laminadoras son los equipos de mayor accidentabilidad. La implementación de LOTO reduce los accidentes por energía no controlada en un 85% según OSHA.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Piso húmedo, enharinado o con grasa derramada en zonas de producción',
        riesgo:              'Caída al mismo nivel por resbalón durante el desplazamiento en el área de panadería',
        consecuenciaEsperada:'Fracturas de muñeca, tobillo o cadera; traumatismo craneoencefálico; golpes con equipos fijos',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'alta',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Instalar pavimento antideslizante (coeficiente de rozamiento ≥0,6 en mojado) en toda el área de producción. Instalar canaletas y sumideros para evacuación inmediata de líquidos. Aplicar pintura epoxi antideslizante en zonas de mayor riesgo.', responsableSugerido: 'Jefe de Mantenimiento', plazoSugerido: '30 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Establecer programa de limpieza de pisos al inicio y término de cada turno y cada vez que se produzca derrame. Señalizar inmediatamente los pisos mojados con conos y letreros. Usar limpieza húmeda (trapeo) en vez de barrido en seco.', responsableSugerido: 'Encargado de turno', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
          { tipoControl: 'epp', descripcion: 'Calzado de trabajo antideslizante con suela de caucho (coeficiente de rozamiento ≥0,4 en grasa) para todo el personal de producción. Verificar estado de la suela mensualmente.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 6', fundamento: 'Los pisos de los lugares de trabajo deben ser sólidos y no resbaladizos, fáciles de limpiar y en buen estado de conservación.' },
        ],
        justificacionTecnica: 'Las caídas al mismo nivel por resbalón representan el 25% de los accidentes en el sector de alimentos en Chile. La combinación de harina, agua y grasa en los pisos de panadería crea una de las condiciones de resbalón más severas, con coeficientes de rozamiento que pueden bajar a 0,1 en condiciones desfavorables.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Levantamiento y traslado repetitivo de sacos de harina (25-50 kg) desde bodega a línea de producción',
        riesgo:              'Sobreesfuerzo y lesión musculoesquelética de columna lumbar y hombros',
        consecuenciaEsperada:'Lumbago agudo, hernia discal L4-L5 o L5-S1, contracturas de hombro; incapacidad temporal recurrente',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'alta',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Instalar sistema de dosificación automática (silo con tornillo sin fin o bomba neumática) para traspasar harina a tolva sin manejo manual de sacos. En ausencia de automatización, usar transpaleta con plataforma regulable para reducir la altura de levantamiento.', responsableSugerido: 'Jefe de Producción', plazoSugerido: '60 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Aplicar Protocolo MMC (MINSAL): no superar 25 kg por levantamiento manual. Reorganizar bodega para evitar traslados >10 m. Rotar al personal entre tareas de carga y amasado. Pausas activas de espalda cada 50 min.', responsableSugerido: 'Encargado de turno', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Faja lumbar de soporte para operaciones de levantamiento de sacos. Uso obligatorio durante el turno de aprovisionamiento. Evaluar mensualmente la efectividad.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'Ley N° 20.949 y DS N° 63/2005 — Manejo manual de carga', fundamento: 'Limita a 25 kg el peso máximo de carga manual para hombres adultos. Obliga a medidas técnicas para cargas repetitivas.' },
          { norma: 'Guía Técnica MMC — MINSAL 2008 (actualización 2024)', fundamento: 'Metodología oficial para evaluar y controlar el riesgo por manejo manual de cargas en Chile.' },
        ],
        justificacionTecnica: 'El aprovisionamiento manual de harina en sacos de 25-50 kg es una de las tareas de mayor riesgo de TME lumbar en el sector alimentario. Los panaderos realizan en promedio 60-120 levantamientos por jornada, superando ampliamente los límites de la ecuación NIOSH cuando no existen ayudas mecánicas.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Quemaduras por contacto accidental con bandejas, latas y carros de horno a altas temperaturas (180-280°C)',
        riesgo:              'Quemaduras de 2° y 3° grado en manos, antebrazos y cara durante la operación de hornos',
        consecuenciaEsperada:'Quemaduras profundas con cicatrices permanentes, dolor severo, hospitalización; posible injerto de piel',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'epp',
        medidasControl: [
          { tipoControl: 'epp', descripcion: 'Guantes térmicos de horno certificados para temperaturas de hasta 300°C (p.ej., guantes de Kevlar o silicona reforzada). Longitud mínima hasta el codo. Delantal de cuero o fibra térmica para protección de tronco y brazos.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
          { tipoControl: 'ingenieria', descripcion: 'Instalar carros de horno con sistema de freno y guías que impidan el contacto accidental. Señalizar todas las superficies calientes con pictograma de quemadura. Instalar extractor de calor sobre boca del horno para reducir la temperatura de exposición al abrir.', responsableSugerido: 'Jefe de Mantenimiento', plazoSugerido: '15 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Establecer procedimiento escrito para carga y descarga de hornos. Capacitar al personal en manejo seguro de bandejas calientes. Mantener zona libre de 1 m frente a la boca del horno durante la operación.', responsableSugerido: 'Encargado de turno', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 6', fundamento: 'El empleador debe adoptar medidas de prevención para el riesgo de quemaduras en trabajos con materiales o equipos a alta temperatura.' },
          { norma: 'Ley N° 16.744, Art. 68', fundamento: 'Obligación del empleador de proveer EPP adecuado cuando el riesgo no puede eliminarse con medidas colectivas.' },
        ],
        justificacionTecnica: 'Las quemaduras representan el 8% de los accidentes laborales en el sector alimentos en Chile. Los hornos de panadería y pastelería son la principal fuente de quemaduras térmicas, siendo las manos y los antebrazos las zonas corporales más afectadas por el manejo de bandejas y carros calientes sin EPP adecuado.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 2. CALOR / HORNOS ────────────────────────────────────────────────────
  {
    id:       'calor_hornos',
    nombre:   'Exposición a calor / ambiente térmico',
    keywords: ['horno', 'calor', 'temperatura', 'coccion', 'fritura', 'plancha',
               'cocina', 'caldera', 'fundicion', 'freidora', 'vapor'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a ambiente térmico caluroso y contacto con superficies calientes',
        riesgo:              'Estrés térmico, quemaduras y deshidratación por trabajo en ambiente con altas temperaturas',
        consecuenciaEsperada:'Quemaduras de 1° a 3° grado, golpe de calor, síncope térmico, deshidratación severa',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar ventilación general y extracción de calor en áreas de cocción. Colocar pantallas de protección radiante frente a hornos y planchas',
            responsableSugerido:   'Jefe de Producción',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Establecer programa de pausas e hidratación (250 ml agua fresca c/30 min). Implementar rotación de puestos en zonas calurosas. Capacitar en reconocimiento de síntomas de estrés térmico',
            responsableSugerido:   'Encargado de turno',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Proveer guantes térmicos (resistencia hasta 250°C), delantal y mangas protectoras contra quemaduras para operación de hornos y freidoras',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículos 96–104',
            fundamento: 'Condiciones térmicas de los lugares de trabajo: temperatura mínima 10°C y máxima recomendada 27°C en actividades medianas. Obliga a controles para exposición a calor intenso',
          },
          {
            norma:      'Ley N° 16.744, Artículo 184 del Código del Trabajo',
            fundamento: 'Obligación del empleador de proteger eficazmente la vida y salud de los trabajadores, adoptando las medidas necesarias',
          },
        ],
        justificacionTecnica: 'El trabajo en proximidad a hornos industriales puede exponer a temperaturas superiores a 50°C en la zona de trabajo. El estrés térmico reduce la capacidad cognitiva en un 15% por cada grado de aumento de temperatura corporal, incrementando el riesgo de error operacional y accidente. Sin controles, la fatiga calórica puede progresar a golpe de calor con riesgo vital.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 3. MANEJO MANUAL DE CARGAS ───────────────────────────────────────────
  {
    id:       'manejo_cargas',
    nombre:   'Manejo manual de cargas',
    keywords: ['carga', 'saco', 'bulto', 'bodega', 'almacen', 'traslado',
               'levantamiento', 'cargar', 'mover', 'descargar', 'pallet',
               'arrume', 'transpaleta', 'estiba'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Manejo manual de cargas sobre los límites normativos sin ayuda mecánica',
        riesgo:              'Sobreesfuerzo físico y lesiones musculoesqueléticas de columna y extremidades',
        consecuenciaEsperada:'Lumbago agudo o crónico, hernia discal, lesiones cervicales, contracturas musculares; incapacidad laboral temporal o permanente',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'alta',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'eliminacion',
        medidasControl: [
          {
            tipoControl:           'eliminacion',
            descripcion:           'Evaluar mecanización completa: transpaletas eléctricas, grúas horquilla o cintas transportadoras para eliminar el manejo manual',
            responsableSugerido:   'Gerencia de Operaciones',
            plazoSugerido:         '60 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'ingenieria',
            descripcion:           'Proveer transpaletas manuales y carros de transporte para bultos superiores a 25 kg (hombres) y 15 kg (mujeres). Mantener equipos en buen estado',
            responsableSugerido:   'Jefe de Bodega',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Capacitar en técnicas de manejo manual de cargas (postura, agarre, trayecto). Implementar programa de pausas activas. Verificar pesos máximos según Ley 20.001',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'Ley N° 20.001 y DS N° 63/2005',
            fundamento: 'Regula el peso máximo de carga humana: 25 kg para hombres adultos, 20 kg para trabajadores jóvenes o mayores de 50 años, 15 kg para mujeres. Obliga a medios mecánicos para cargas superiores',
          },
          {
            norma:      'Protocolo TMERT-EESS (MINSAL/SUSESO)',
            fundamento: 'Evaluación de riesgo por trastornos musculoesqueléticos de extremidades superiores. Obligatorio cuando se combina carga con movimientos repetitivos o posturas forzadas',
          },
        ],
        justificacionTecnica: 'El manejo manual de cargas es la primera causa de enfermedades musculoesqueléticas en Chile según estadísticas del ISL y las mutuales. El levantamiento repetitivo sobre 25 kg genera una compresión discal en L5-S1 que puede superar los 770 kg de fuerza, excediendo la tolerancia estructural del disco intervertebral. El riesgo aumenta con la frecuencia, la distancia de transporte y la postura de carga.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Aplastamiento o golpe por caída de cargas, arrumes inestables o pallet mal asegurado',
        riesgo:              'Traumatismo grave en cabeza, tronco o extremidades por objeto en caída',
        consecuenciaEsperada:'Fracturas múltiples, traumatismo craneoencefálico, aplastamiento de extremidades; riesgo vital',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Instalar racks y estanterías certificadas con capacidad de carga indicada. Delimitar y señalizar zonas de almacenamiento con altura máxima de arrume (≤1,8 m para carga manual). Instalar mallas o topes laterales en estanterías.', responsableSugerido: 'Jefe de Bodega', plazoSugerido: '15 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Establecer procedimiento de estiba segura: base mayor al frente, objetos pesados abajo, verificar estabilidad antes de soltar. Capacitar al personal en riesgos de derrumbe y señalizar altura máxima de apilamiento.', responsableSugerido: 'Supervisor de bodega', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Uso obligatorio de casco de seguridad y zapatos de seguridad con puntera de acero en zonas de carga y descarga con riesgo de caída de objetos.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 6 y 9', fundamento: 'El empleador debe garantizar que el almacenamiento de materiales no genere riesgo de derrumbe ni accidente para los trabajadores.' },
        ],
        justificacionTecnica: 'El derrumbe de arrumes y la caída de cargas desde estanterías son causas frecuentes de accidentes graves en bodegas y centros de distribución. La falta de delimitación de altura máxima y la ausencia de sistemas de sujeción lateral son los factores de riesgo más comunes identificados en fiscalizaciones de la DT.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Atrapamiento o golpe por transpaleta manual o eléctrica sin zona de tráfico peatonal delimitada',
        riesgo:              'Colisión de equipo de movimiento de carga con trabajador peatón',
        consecuenciaEsperada:'Aplastamiento de pies, fracturas de extremidades inferiores; en alta velocidad, traumatismo múltiple grave',
        factorRiesgo:        'maquinas_herramientas',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Delimitar y señalizar con pintura amarilla los pasillos peatonales y las rutas de tráfico de transpaletas. Instalar espejos convexos en esquinas ciegas. Separar físicamente el tráfico de personas y equipos.', responsableSugerido: 'Jefe de Bodega', plazoSugerido: '15 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Establecer velocidad máxima de transpaleta eléctrica de 5 km/h en interior. Capacitar a operadores en uso seguro del equipo. Prohibir el transporte de personas sobre equipos de carga.', responsableSugerido: 'Supervisor de bodega', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
          { tipoControl: 'epp', descripcion: 'Calzado de seguridad con puntera de acero y suela antideslizante para todos los trabajadores en zona de bodega. Chaleco reflectante para peatones en áreas con tráfico de equipos.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 55', fundamento: 'Regula el uso de equipos mecánicos de movimiento de cargas y la protección de trabajadores en zonas de tráfico.' },
        ],
        justificacionTecnica: 'En bodegas y centros logísticos, los atropellos por transpaletas representan una de las 3 causas más frecuentes de accidentes graves. La delimitación de pasillos reduce el riesgo de colisión en un 60-70% según estudios de seguridad logística de mutuales chilenas.',
        nivelConfianza: 'media',
      },
      {
        peligro:             'Postura forzada y movimientos repetitivos en operaciones de paletizado, etiquetado o clasificación manual de productos',
        riesgo:              'Trastorno musculoesquelético de extremidades superiores (TMERT-EESS): tendinitis, síndrome del túnel carpiano',
        consecuenciaEsperada:'Dolor crónico en muñecas, codos y hombros; incapacidad laboral progresiva; enfermedad profesional reconocida',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'alta',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Ajustar la altura de la mesa/banda de trabajo a la altura de codos del operador (promedio 90-100 cm). Instalar transportadoras de rodillos o cintas para reducir el empuje y jalado de cajas. Usar herramientas neumáticas de bajo torque para etiquetado.', responsableSugerido: 'Jefe de Producción', plazoSugerido: '30 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Aplicar el Protocolo TMERT-EESS (MINSAL) para evaluación del riesgo. Implementar rotación de puestos cada 2 horas entre tareas con distintos grupos musculares. Pausas activas de 5 min cada 50 min de trabajo repetitivo.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '15 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Proveer muñequeras de soporte ergonómico para operaciones de alta repetitividad. Guantes de agarre para manejo de envases.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'Protocolo TMERT-EESS — MINSAL/SUSESO (2013, actualizado 2024)', fundamento: 'Obligatorio para empleadores con trabajadores en tareas de alta repetitividad de extremidades superiores. Establece niveles de acción y controles.' },
          { norma: 'Ley N° 16.744, Art. 68', fundamento: 'Obligación del empleador de implementar medidas preventivas para evitar enfermedades profesionales, incluidos los TME.' },
        ],
        justificacionTecnica: 'Los TME de extremidades superiores son la segunda causa de enfermedades profesionales en Chile (ISL, 2023). El paletizado y clasificación manual son las tareas de mayor riesgo TMERT en el sector logístico y distribución, con frecuencias de movimiento que pueden superar los 20.000 ciclos/turno.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Caída a distinto nivel desde plataforma, rampa de carga o camión durante operaciones de estiba',
        riesgo:              'Caída desde altura durante la carga/descarga del vehículo o acceso a estanterías en altura',
        consecuenciaEsperada:'Fracturas de calcáneo, pelvis o columna vertebral; traumatismo craneoencefálico; muerte en caídas superiores a 1,8 m',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Instalar rampas de carga niveladas con sistemas anti-deslizamiento y barandas laterales (altura ≥90 cm). Nivelar la altura de carga del vehículo con la plataforma mediante niveladores hidráulicos. Instalar líneas de vida o anclajes en camiones de estiba en altura.', responsableSugerido: 'Jefe de Mantenimiento', plazoSugerido: '30 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Establecer procedimiento de trabajo seguro para carga/descarga en altura. Prohibir trabajar sobre la carga del camión sin sistema de protección. Capacitar en riesgos de caída y uso de EPP en altura.', responsableSugerido: 'Supervisor de bodega', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Arnés de seguridad certificado ANSI Z359 y línea de vida para operaciones de carga en plataformas sobre 1,8 m de altura. Calzado antideslizante con tobillera de soporte.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 36 y 37', fundamento: 'Exige protección colectiva e individual para trabajos en altura. Las plataformas de carga deben cumplir requisitos de resistencia, señalización y protección de bordes.' },
          { norma: 'NCh 997 Of. 2009 — Andamios y superficies de trabajo elevadas', fundamento: 'Especifica los requisitos técnicos de plataformas de trabajo en altura, incluyendo rampas y plataformas de carga.' },
        ],
        justificacionTecnica: 'Las caídas a distinto nivel durante operaciones de carga/descarga de vehículos son responsables del 15% de los accidentes graves en el sector logístico en Chile (ACHS, 2022). La ausencia de sistemas de nivelación y protección lateral en plataformas es el factor de riesgo más frecuente identificado en fiscalizaciones.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 4. RUIDO ─────────────────────────────────────────────────────────────
  {
    id:       'ruido',
    nombre:   'Exposición a ruido sobre el límite permisible',
    keywords: ['ruido', 'decibel', 'maquinaria', 'compresora', 'sierra',
               'esmeril', 'taladro', 'martillo', 'demolicion', 'fabrica',
               'planta', 'generador', 'motoserra', 'impacto'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a niveles de ruido superiores a 85 dB(A) para jornada de 8 horas',
        riesgo:              'Hipoacusia neurosensorial inducida por ruido (HNIR)',
        consecuenciaEsperada:'Pérdida auditiva bilateral e irreversible, acúfenos permanentes, dificultad comunicacional y aislamiento social. Enfermedad profesional calificada por Ley 16.744',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar aislamientos acústicos en fuentes de ruido, cabinas insonorizadas para operadores y silenciadores en escapes de aire comprimido',
            responsableSugerido:   'Jefe de Mantenimiento',
            plazoSugerido:         '60 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Implementar PREXOR: medición de ruido con sonómetro certificado, rotación de puestos, señalética de zona de ruido y audiometrías anuales para trabajadores expuestos sobre 82 dB(A)',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Proveer protección auditiva: tapones (SNR ≥ 25 dB) u orejeras (SNR ≥ 30 dB). Verificar uso correcto y renovar cada 3 meses',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículos 74–82',
            fundamento: 'Límite de exposición ocupacional a ruido: 85 dB(A) para 8 horas/día. Nivel de acción: 82 dB(A). Obliga a medidas de control cuando se supera el límite',
          },
          {
            norma:      'PREXOR — Protocolo de Exposición Ocupacional a Ruido (MINSAL)',
            fundamento: 'Protocolo de vigilancia médica y ambiental de aplicación obligatoria para trabajadores expuestos sobre el nivel de acción. Incluye audiometrías y plan de intervención por empresa',
          },
        ],
        justificacionTecnica: 'La hipoacusia inducida por ruido es la enfermedad profesional más prevalente en Chile, representando aproximadamente el 30% de las enfermedades calificadas. El daño es irreversible: destruye las células ciliadas externas de la cóclea, que no se regeneran. El protocolo PREXOR es de aplicación obligatoria y su incumplimiento expone al empleador a sanciones de la SEREMI de Salud.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 5. TRABAJO EN ALTURA ─────────────────────────────────────────────────
  {
    id:       'trabajo_altura',
    nombre:   'Trabajo en altura física',
    keywords: ['altura', 'andamio', 'escalera', 'techo', 'cubierta', 'tejado',
               'plataforma elevada', 'grua', 'torre', 'poste', 'estructura',
               'trabajo en altura', 'azotea', 'entretecho'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Trabajo en altura física sobre 1,8 metros sin sistema de detención de caídas',
        riesgo:              'Caída a distinto nivel con consecuencias potencialmente fatales',
        consecuenciaEsperada:'Traumatismo craneoencefálico grave, fracturas múltiples, lesión medular, muerte. Principal mecanismo de accidente fatal en Chile',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'eliminacion',
        medidasControl: [
          {
            tipoControl:           'eliminacion',
            descripcion:           'Evaluar si la tarea puede realizarse desde nivel inferior mediante equipos telescópicos, plataformas fijas o drones de inspección',
            responsableSugerido:   'Supervisor de Obra',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar barandas de seguridad perimetrales (mínimo 90 cm de altura), rodapiés y redes de seguridad en todas las plataformas de trabajo en altura',
            responsableSugerido:   'Jefe de Obra',
            plazoSugerido:         'Antes de iniciar el trabajo',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Elaborar Procedimiento Escrito de Trabajo Seguro (PETS) para trabajo en altura. Exigir Permiso de Trabajo vigente. Verificar competencia del trabajador. Realizar AST antes de cada jornada',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Arnés de seguridad de cuerpo completo con doble línea de vida y absorbedor de energía. Casco con barbiquejo. Anclar a punto certificado con capacidad ≥ 2.000 kg',
            responsableSugerido:   'Supervisor directo',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículo 36',
            fundamento: 'Toda superficie de trabajo sobre 1,8 metros debe tener barandas y protecciones perimetrales para prevenir caídas',
          },
          {
            norma:      'NCh 2760:2013 — Trabajo en altura',
            fundamento: 'Establece requisitos para sistemas de detención de caídas, equipos y procedimientos. Incluye requisitos de anclaje, arnés y líneas de vida',
          },
          {
            norma:      'DS N° 44/2024 (MINTRAB)',
            fundamento: 'Incluye el riesgo de caída en altura como riesgo crítico dentro del sistema de gestión de SST. Obliga a su identificación, evaluación y control documentado',
          },
        ],
        justificacionTecnica: 'Las caídas en altura representan entre el 35 y 40% de los accidentes fatales del trabajo en Chile según estadísticas del ISL. El trabajo en altura requiere un sistema de gestión específico: análisis previo, permiso de trabajo, verificación de equipos, competencia del trabajador y supervisión continua. La ausencia de controles constituye infracción grave a la normativa y puede derivar en responsabilidad penal del empleador.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 6. PRODUCTOS QUÍMICOS / LIMPIEZA ─────────────────────────────────────
  {
    id:       'quimicos',
    nombre:   'Exposición a productos químicos',
    keywords: ['quimico', 'cloro', 'hipoclorito', 'desinfectante', 'detergente',
               'acido', 'solvente', 'pintura', 'barniz', 'thinner', 'amoniaco',
               'limpieza', 'sanitizacion', 'aseo', 'desgrasante', 'soda caustica'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición dérmica, ocular e inhalatoria a productos químicos peligrosos (corrosivos, irritantes o tóxicos)',
        riesgo:              'Intoxicación aguda o crónica, quemaduras químicas y sensibilización por contacto repetido',
        consecuenciaEsperada:'Dermatitis de contacto, quemaduras dérmicas y oculares, irritación de mucosas respiratorias, intoxicación sistémica en exposición grave',
        factorRiesgo:        'materias_primas',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'sustitucion',
        medidasControl: [
          {
            tipoControl:           'sustitucion',
            descripcion:           'Evaluar sustitución de productos peligrosos por alternativas menos tóxicas (ej: reemplazar hipoclorito concentrado por desinfectantes de pH neutro certificados)',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Mantener Hojas de Datos de Seguridad (SDS) vigentes y accesibles para cada producto. Capacitar en manejo seguro, mezclas prohibidas y primeros auxilios. Rotular todos los envases según GHS',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Guantes de nitrilo (mínimo 0,3 mm), lentes de seguridad con protección lateral, delantal impermeable y respirador de media cara con filtros para vapores orgánicos (según SDS del producto)',
            responsableSugerido:   'Supervisor directo',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Título VI — Agentes Químicos, Artículos 54–58',
            fundamento: 'Obligación de identificar agentes químicos peligrosos, implementar medidas de control según jerarquía y mantener hojas de seguridad SDS actualizadas',
          },
          {
            norma:      'Sistema GHS — Clasificación y Etiquetado de Productos Químicos (MINSAL)',
            fundamento: 'Obligación de rotular y clasificar todos los productos químicos según el Sistema Globalmente Armonizado. Los envases deben tener etiqueta GHS en español',
          },
        ],
        justificacionTecnica: 'Mezclas inadvertidas de productos de limpieza comunes (hipoclorito + amoníaco) pueden generar cloraminas tóxicas con riesgo de intoxicación aguda. La exposición crónica a irritantes en personal de aseo es la primera causa de dermatitis profesional en el sector servicios en Chile. Sin hojas SDS disponibles, es imposible actuar correctamente ante una emergencia química.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 7. RIESGO PSICOSOCIAL / ATENCIÓN AL PÚBLICO / LEY KARIN ─────────────
  {
    id:       'psicosocial',
    nombre:   'Riesgo psicosocial y violencia en el trabajo',
    keywords: ['publico', 'cliente', 'atencion', 'call center', 'caja',
               'recepcion', 'ventas', 'servicio', 'hostigamiento', 'acoso',
               'estres', 'trato', 'conflicto', 'emocional', 'presion'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a violencia de terceros y factores psicosociales laborales adversos (alta demanda, bajo control, escaso apoyo social)',
        riesgo:              'Estrés laboral crónico, agotamiento emocional, acoso laboral o sexual, violencia de clientes',
        consecuenciaEsperada:'Síndrome de Burnout, trastornos ansiosos, depresión laboral, ausentismo crónico. En casos graves: licencias médicas prolongadas e incapacidad laboral',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'administrativo',
        medidasControl: [
          {
            tipoControl:           'administrativo',
            descripcion:           'Aplicar cuestionario SUSESO/ISTAS21 versión breve para diagnóstico de riesgo psicosocial (obligatorio para empresas con 25+ trabajadores). Elaborar plan de intervención según resultado',
            responsableSugerido:   'RRHH / Encargado de SSOMA',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Difundir y aplicar protocolo de prevención de acoso laboral y sexual conforme a Ley Karin (Ley 21.643 vigente desde agosto 2024). Designar canal de denuncia y persona de confianza',
            responsableSugerido:   'Gerencia de RRHH',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Establecer protocolo ante situaciones de violencia de clientes o terceros. Capacitar en técnicas de desescalada verbal. Instalar sistema de alerta o botón de pánico en áreas de atención',
            responsableSugerido:   'Jefe de Operaciones',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'Ley N° 21.643 (Ley Karin) — vigente desde agosto 2024',
            fundamento: 'Fortalece la prevención y sanción del acoso laboral, acoso sexual y violencia en el trabajo. Obliga a contar con protocolo de prevención, canales de denuncia y procedimiento de investigación con plazo máximo de 30 días hábiles',
          },
          {
            norma:      'Protocolo de Vigilancia de Riesgos Psicosociales en el Trabajo — MINSAL/SUSESO',
            fundamento: 'Empresas con 25 o más trabajadores deben aplicar el cuestionario SUSESO/ISTAS21 y elaborar un plan de intervención. Su incumplimiento es sancionable por la Dirección del Trabajo',
          },
        ],
        justificacionTecnica: 'El trabajo en atención directa al público implica alta exposición a demandas emocionales, ritmo intenso y violencia de terceros. La Ley Karin (agosto 2024) establece nuevas obligaciones con sanciones administrativas para empleadores que no implementen protocolos formales. El Protocolo SUSESO define dimensiones de riesgo (carga de trabajo, apoyo social, compensación) que deben ser evaluadas y controladas.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 8. ERGONOMÍA / TMERT / OFICINA ───────────────────────────────────────
  {
    id:       'ergonomia',
    nombre:   'Riesgo ergonómico / TMERT-EESS',
    keywords: ['computador', 'oficina', 'escritorio', 'teclado', 'pantalla',
               'monitor', 'administrativo', 'digitacion', 'mouse', 'postura',
               'sedentario', 'repetitivo', 'tmert'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a factores de riesgo ergonómico: postura sedentaria prolongada y movimientos repetitivos de extremidades superiores',
        riesgo:              'Trastornos musculoesqueléticos de extremidades superiores (TMERT-EESS) y columna vertebral',
        consecuenciaEsperada:'Síndrome del túnel carpiano, tendinitis, epicondilitis, cervicalgia y lumbago postural crónico. Riesgo de licencias médicas reiteradas y limitación funcional permanente',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Adecuar puesto de trabajo: silla ergonómica regulable, monitor a nivel de ojos (±5°), teclado y mouse a altura de codos, apoyamuñecas gel y reposapiés si es necesario',
            responsableSugerido:   'Jefe de Administración',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Implementar pausas activas (5–10 min cada 2 horas). Capacitar en autocuidado postural. Aplicar Lista de Chequeo TMERT-EESS nivel básico para evaluación de riesgo. Realizar evaluación de puestos por kinesiólogo',
            responsableSugerido:   'RRHH / Encargado de SSOMA',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'Protocolo TMERT-EESS — MINSAL/SUSESO (2012, actualizado 2019)',
            fundamento: 'Protocolo de vigilancia específico para trastornos musculoesqueléticos de extremidades superiores. Obliga a evaluación de riesgo y plan de intervención cuando se detectan factores de riesgo en el puesto de trabajo',
          },
          {
            norma:      'DS N° 594/1999, Artículo 54 y 55',
            fundamento: 'Condiciones ergonómicas generales en los lugares de trabajo: sillas con respaldo, iluminación adecuada y diseño del puesto que preserve la salud del trabajador',
          },
        ],
        justificacionTecnica: 'El trabajo sedentario intensivo con computador es la primera causa de enfermedades musculoesqueléticas en el sector servicios. La postura estática mantenida genera presión discal crónica y fatiga muscular cervical. El Protocolo TMERT-EESS es de aplicación obligatoria y requiere evaluación por profesional competente cuando se detectan los factores de riesgo definidos (fuerza, repetitividad, postura).',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 9. TRANSPORTE / CONDUCCIÓN ───────────────────────────────────────────
  {
    id:       'transporte',
    nombre:   'Conducción y transporte de vehículos',
    keywords: ['vehiculo', 'conduccion', 'camion', 'auto', 'furgon', 'reparto',
               'distribucion', 'moto', 'transporte', 'conductor', 'ruta',
               'despacho', 'entrega'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Conducción de vehículos en vías públicas bajo condiciones de tráfico, fatiga o adversidad climática',
        riesgo:              'Accidente de tránsito en misión: colisión, volcamiento o atropello con consecuencias graves o fatales',
        consecuenciaEsperada:'Traumatismos múltiples, fracturas, TCE, muerte del conductor o terceros. Alto impacto legal y económico para el empleador por responsabilidad civil',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'administrativo',
        medidasControl: [
          {
            tipoControl:           'administrativo',
            descripcion:           'Verificar vigencia de licencia de conducir, hoja de vida del conductor (DGTT), apto médico para conducir y antecedentes. Establecer política de tolerancia cero al alcohol y drogas (0,0 g/L alcohol en sangre para trabajadores)',
            responsableSugerido:   'Jefe de Operaciones / RRHH',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Capacitar en conducción defensiva y técnicas de manejo seguro. Establecer tiempos de descanso mínimos entre jornadas (≥11 horas). Prohibir uso de celular al conducir. Planificar rutas evitando horarios de alta accidentabilidad',
            responsableSugerido:   'Encargado de Flota',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'ingenieria',
            descripcion:           'Verificar mantenimiento preventivo del vehículo (frenos, neumáticos, luces). Instalar GPS y monitoreo de conducción en flota. Revisar condiciones de estiba y aseguramiento de la carga',
            responsableSugerido:   'Jefe de Mantenimiento',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'Ley N° 18.290 (Ley de Tránsito) y DS N° 170/1985',
            fundamento: 'Establece requisitos de licencias de conducir por clase de vehículo, obligaciones del conductor, límites de velocidad y responsabilidades civiles y penales ante accidentes',
          },
          {
            norma:      'Ley N° 16.744 — Accidente en misión',
            fundamento: 'El accidente de tránsito ocurrido durante el ejercicio de funciones laborales es accidente del trabajo. Genera derechos del trabajador y obligaciones del empleador ante la mutual o el ISL',
          },
        ],
        justificacionTecnica: 'Los accidentes de tránsito en misión son la principal causa de fatalidades fuera del recinto de trabajo en Chile. La conducción bajo fatiga multiplica por 4 el riesgo de colisión (equivalente a conducir con 0,5 g/L de alcohol en sangre). El empleador tiene responsabilidad directa cuando el accidente se produce por incumplimiento de estándares preventivos documentados.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Fatiga y somnolencia al conducir por jornadas prolongadas, turnos nocturnos o rutas monótonas',
        riesgo:              'Microsueño al volante con pérdida de control del vehículo',
        consecuenciaEsperada:'Colisión frontal o salida de pista, muerte o incapacidad permanente del conductor y terceros',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'administrativo',
        medidasControl: [
          { tipoControl: 'administrativo', descripcion: 'Limitar jornada de conducción a máx. 5 horas continuas con pausa de 30 min. Implementar bitácora de conducción diaria y control de horas. Prohibir turnos nocturnos consecutivos sin descanso mínimo de 11 horas.', responsableSugerido: 'Jefe de Operaciones', plazoSugerido: 'Inmediato', requiereProgramaTrabajo: true },
          { tipoControl: 'ingenieria', descripcion: 'Instalar sistema de alerta por fatiga (detección de cierre palpebral) en vehículos de la flota. Considerar vehículos con asistente de mantenimiento de carril.', responsableSugerido: 'Jefe de Mantenimiento', plazoSugerido: '60 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Proveer dispositivo wearable anti-fatiga (detección de microsueños por movimiento ocular) para conductores en rutas largas nocturnas.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '30 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'Código del Trabajo, Art. 22 y 28 — Jornada máxima', fundamento: 'Limita la jornada ordinaria a 45 h semanales. Aplica para conductores en misión.' },
          { norma: 'Ley N° 16.744, Art. 68', fundamento: 'Obligación del empleador de implementar medidas que eviten la fatiga como factor de riesgo de accidente.' },
        ],
        justificacionTecnica: 'Según la OIT, conducir con 17 horas de vigilia produce un deterioro cognitivo equivalente a 0,5 g/L de alcohol. La Comisión Nacional de Seguridad de Tránsito (CONASET) identifica la fatiga como factor en el 20% de los accidentes fatales en Chile.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Carga y descarga manual de mercancías (sacos, cajas, paquetes) durante el reparto',
        riesgo:              'Lesión musculoesquelética por sobreesfuerzo en columna, hombros y rodillas',
        consecuenciaEsperada:'Lumbago agudo, hernia discal, desgarro muscular; incapacidad temporal o permanente por TME',
        factorRiesgo:        'maquinas_herramientas',
        probabilidadSugerida:'alta',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          { tipoControl: 'ingenieria', descripcion: 'Proveer carros de transporte, porta-pallets manuales o hidráulicos y rampas de carga para reducir el manejo manual. Diseñar zonas de descarga a altura de trabajo (0,75–1,0 m).', responsableSugerido: 'Jefe de Operaciones', plazoSugerido: '30 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Limitar peso individual de carga a ≤25 kg (hombres) y ≤15 kg (mujeres) según Ley 20.949. Capacitar en técnica de levantamiento seguro: espalda recta, carga cerca del cuerpo, piernas como motor. Rotar tareas de carga/descarga.', responsableSugerido: 'Encargado de turno', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Proveer faja lumbar de soporte para operaciones de carga/descarga pesada. Calzado de seguridad antideslizante con puntera de acero.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'Ley N° 20.949 (Ley Mala Espalda) y DS N° 63/2005', fundamento: 'Limita el peso máximo de carga manual y obliga a implementar medidas técnicas cuando se supera. Aplica a todas las empresas.' },
          { norma: 'Guía Técnica MMC — MINSAL/SUSESO', fundamento: 'Protocolo de evaluación y control del manejo manual de cargas en Chile.' },
        ],
        justificacionTecnica: 'El manejo repetitivo de cargas durante el reparto es una de las principales causas de licencias médicas por TME en Chile. Los repartidores realizan en promedio 40-80 maniobras de carga/descarga por jornada, superando ampliamente los límites ergonómicos sin controles.',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Caídas al descender del vehículo o al caminar en superficies irregulares, húmedas o con desniveles durante el reparto',
        riesgo:              'Caída al mismo o distinto nivel con traumatismo en extremidades y cabeza',
        consecuenciaEsperada:'Esguinces, fracturas de tobillo/muñeca, traumatismo craneoencefálico; incapacidad temporal',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'administrativo',
        medidasControl: [
          { tipoControl: 'administrativo', descripcion: 'Capacitar en técnica segura de descenso del vehículo (tres puntos de apoyo). Establecer procedimiento de inspección del punto de entrega antes de descender. Reportar inmediatamente condiciones inseguras en clientes.', responsableSugerido: 'Encargado de flota', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'ingenieria', descripcion: 'Instalar peldaño de acceso antideslizante y asidero de agarre en cabina del vehículo. Verificar que la rampa de carga tenga superficie antideslizante y sistema de retención.', responsableSugerido: 'Jefe de Mantenimiento', plazoSugerido: '30 días', requiereProgramaTrabajo: true },
          { tipoControl: 'epp', descripcion: 'Proveer calzado de seguridad con suela antideslizante (norma ASTM F2913) para trabajo en exterior y superficies variables. Pantalón de alta visibilidad para reparto en vía pública.', responsableSugerido: 'Encargado de SSOMA', plazoSugerido: '7 días', requiereProgramaTrabajo: false },
        ],
        normativaRelacionada: [
          { norma: 'DS N° 594/1999, Art. 6', fundamento: 'El empleador debe mantener condiciones de trabajo que minimicen el riesgo de accidentes, incluidos los ocurridos fuera del recinto cuando el trabajador está en misión.' },
          { norma: 'Ley N° 16.744 — Accidente en misión', fundamento: 'Las caídas ocurridas durante el reparto son accidentes del trabajo cubiertos por el seguro de la Ley 16.744.' },
        ],
        justificacionTecnica: 'Las caídas al mismo nivel representan el 25% de los accidentes laborales en Chile. Los trabajadores de reparto tienen exposición múltiple diaria al riesgo de caída por la variabilidad de los puntos de entrega (patios, bodegas, escaleras, veredas).',
        nivelConfianza: 'alta',
      },
      {
        peligro:             'Exposición a violencia externa (asalto, robo con violencia) durante el reparto en zonas de riesgo',
        riesgo:              'Agresión física por terceros con lesiones o consecuencias psicológicas graves',
        consecuenciaEsperada:'Traumatismos, heridas por arma blanca o fuego de fuego; cuadros de estrés postraumático (TEPT) con incapacidad prolongada',
        factorRiesgo:        'factor_humano',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'administrativo',
        medidasControl: [
          { tipoControl: 'administrativo', descripcion: 'Clasificar zonas de reparto por nivel de riesgo de seguridad. Establecer protocolo de comunicación (check-in cada 30 min en zonas de alto riesgo). Capacitar al personal en conductas seguras ante asalto (no resistir, proteger la integridad física). Coordinar con Carabineros en zonas críticas.', responsableSugerido: 'Jefe de Operaciones', plazoSugerido: '7 días', requiereProgramaTrabajo: true },
          { tipoControl: 'ingenieria', descripcion: 'Instalar GPS con botón de pánico en vehículos de reparto. Implementar sistema de rastreo en tiempo real con central de monitoreo. Reducir el manejo de efectivo (pagos digitales).', responsableSugerido: 'Jefe de Tecnología', plazoSugerido: '30 días', requiereProgramaTrabajo: true },
          { tipoControl: 'administrativo', descripcion: 'Implementar atención psicológica inmediata post-incidente (protocolo IASC). Registrar y reportar todo incidente de violencia a la mutual. Revisar rutas de alto riesgo con frecuencia mensual.', responsableSugerido: 'RRHH / Encargado de SSOMA', plazoSugerido: '15 días', requiereProgramaTrabajo: true },
        ],
        normativaRelacionada: [
          { norma: 'Ley N° 21.643 (Ley Karin) — Violencia en el trabajo', fundamento: 'Obliga a los empleadores a implementar protocolos de prevención de violencia laboral, incluyendo la violencia perpetrada por terceros ajenos a la empresa.' },
          { norma: 'Protocolo de Vigilancia de Riesgo Psicosocial (SUSESO-ISTAS21)', fundamento: 'Las amenazas y violencia externa son factores de riesgo psicosocial que deben ser evaluados y controlados.' },
        ],
        justificacionTecnica: 'Los trabajadores de reparto y transporte de valores son uno de los grupos laborales con mayor exposición a violencia externa en Chile. La Ley Karin (2024) extiende explícitamente la obligación preventiva del empleador a la violencia cometida por terceros durante el ejercicio de funciones.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 10. ELECTRICIDAD ─────────────────────────────────────────────────────
  {
    id:       'electricidad',
    nombre:   'Riesgo eléctrico',
    keywords: ['electrico', 'electricidad', 'voltaje', 'corriente', 'cable',
               'tablero', 'enchufe', 'instalacion electrica', 'alta tension',
               'panel electrico', 'cortocircuito', 'electrodomestico'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Contacto eléctrico directo o indirecto con instalaciones energizadas',
        riesgo:              'Electrocución, quemaduras eléctricas internas/externas e incendio eléctrico',
        consecuenciaEsperada:'Fibrilación ventricular, parada cardiorrespiratoria, quemaduras de arco eléctrico, muerte. Daño a instalaciones y terceros por incendio derivado de cortocircuito',
        factorRiesgo:        'maquinas_herramientas',
        probabilidadSugerida:'baja',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Verificar certificación SEC vigente de instalaciones eléctricas. Instalar disyuntores diferenciales (RCD 30 mA) y puesta a tierra. Mantener cubiertas y carcasas en tableros',
            responsableSugerido:   'Jefe de Mantenimiento',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Aplicar procedimiento LOTOTO (Bloqueo/Etiquetado/Verificación) antes de cualquier intervención eléctrica. Solo personal con competencia eléctrica acreditada puede intervenir instalaciones',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículos 19–21',
            fundamento: 'Requisitos mínimos para instalaciones eléctricas en lugares de trabajo: protecciones, distancias de seguridad y estado de las instalaciones',
          },
          {
            norma:      'Reglamento SEC — DS N° 61 (Ministerio de Energía)',
            fundamento: 'Toda instalación eléctrica interior debe ser ejecutada por instalador autorizado por la SEC y contar con certificación de instalación vigente',
          },
        ],
        justificacionTecnica: 'El riesgo eléctrico es especialmente peligroso porque es invisible. Corrientes tan bajas como 50–100 mA a través del corazón pueden causar fibrilación ventricular mortal. Las instalaciones deterioradas o sin mantención son la principal causa de incendios en establecimientos comerciales e industriales. El procedimiento LOTOTO es el estándar internacional para intervención segura de equipos energizados.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 11. SÍLICE / CONSTRUCCIÓN ────────────────────────────────────────────
  {
    id:       'silice',
    nombre:   'Exposición a polvo de sílice',
    keywords: ['silice', 'cemento', 'hormigon', 'arido', 'demolicion', 'granito',
               'ladrillo', 'construccion', 'albanileria', 'roca', 'mineria',
               'perforacion', 'esmeril concreto', 'polvo mineral'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a polvo de sílice cristalina respirable (cuarzo) durante perforación, corte o demolición de materiales pétreos',
        riesgo:              'Silicosis — neumoconiosis por sílice: enfermedad pulmonar fibrótica, progresiva e irreversible',
        consecuenciaEsperada:'Fibrosis pulmonar progresiva, insuficiencia respiratoria, aumento del riesgo de tuberculosis pulmonar (×3 veces), cáncer de pulmón. Incapacidad permanente o muerte anticipada',
        factorRiesgo:        'materias_primas',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      8,
        clasificacionRiesgo: 'importante',
        jerarquiaControl:    'eliminacion',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Aplicar técnica húmeda (riego permanente con agua) en perforación, corte y esmerilado de materiales silíceos. Instalar aspiración localizada con filtro HEPA en herramientas eléctricas',
            responsableSugerido:   'Jefe de Obra',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Implementar PLANESI: medición ambiental de sílice con laboratorio acreditado. Vigilancia médica anual con radiografía de tórax (lectores OIT). Capacitar en riesgos de sílice y uso correcto de EPP respiratorio',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '30 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Mascarilla P100 de media cara o PAPR con filtro P3. Verificar prueba de ajuste (fit test) anual. NO usar mascarillas quirúrgicas o de tela para protección contra sílice',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículo 66 — LPP de sílice cristalina: 0,025 mg/m³',
            fundamento: 'La exposición sobre este límite requiere medidas correctivas inmediatas y vigilancia médica. Uno de los límites más estrictos del mundo',
          },
          {
            norma:      'PLANESI — Plan Nacional de Erradicación de la Silicosis (MINSAL)',
            fundamento: 'Obliga a empleadores con trabajadores expuestos a sílice a realizar medición ambiental, vigilancia médica y reportar casos a la autoridad sanitaria',
          },
        ],
        justificacionTecnica: 'La sílice cristalina es carcinógena del grupo 1 (IARC) y Chile tiene alta prevalencia de silicosis por su industria minera, construcción y cerámica. A diferencia de otras neumoconiosis, la silicosis puede progresar años después de cesar la exposición. El límite permisible chileno (0,025 mg/m³) exige controles más estrictos que los estándares de muchos países de la OCDE.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 12. MÁQUINAS / ATRAPAMIENTO ──────────────────────────────────────────
  {
    id:       'maquinas',
    nombre:   'Riesgo mecánico / partes móviles de maquinaria',
    keywords: ['maquina', 'prensa', 'torno', 'fresadora', 'banda', 'correa',
               'engranaje', 'cortadora', 'picadora', 'trozadora', 'sierra circular',
               'atrapamiento', 'aplastamiento', 'molino'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Contacto con partes móviles de maquinaria desprotegidas: engranajes, correas, rodillos o cuchillas',
        riesgo:              'Atrapamiento, aplastamiento o corte por parte móvil de maquinaria sin guarda de seguridad',
        consecuenciaEsperada:'Amputación de dedos o manos, aplastamiento de extremidades, avulsión de tejidos, fracturas expuestas, muerte en casos graves',
        factorRiesgo:        'maquinas_herramientas',
        probabilidadSugerida:'baja',
        consecuenciaSugerida:'extremadamente_danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar guardas de seguridad fijas o de interbloqueo en todos los puntos de peligro mecánico. Las guardas no deben ser removibles sin herramienta. Verificar estado de guardas en cada turno',
            responsableSugerido:   'Jefe de Mantenimiento',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar dispositivo de parada de emergencia (seta) de fácil acceso desde el puesto del operador. Verificar funcionalidad mensualmente y registrar inspección',
            responsableSugerido:   'Jefe de Mantenimiento',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Elaborar e implementar procedimiento LOTOTO (Bloqueo/Etiquetado/Verificación de energía cero) para toda intervención en maquinaria. Capacitar y evaluar a todos los operadores',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículos 22 y 23',
            fundamento: 'Todas las maquinarias con partes peligrosas deben protegerse con guardas, vallas u otros dispositivos. Su ausencia constituye infracción grave sujeta a multa',
          },
          {
            norma:      'NCh 2999:2013 — Seguridad de maquinaria',
            fundamento: 'Establece principios de diseño e instalación de protecciones en maquinaria industrial. Define distancias de seguridad y tipos de guardas aceptables',
          },
        ],
        justificacionTecnica: 'Las amputaciones traumáticas por maquinaria representan aproximadamente el 8% de los accidentes graves en Chile y son los de mayor impacto psicosocial y costo de rehabilitación. Las guardas de seguridad son la medida más eficaz: cuando están instaladas correctamente, prácticamente eliminan el riesgo de atrapamiento. Su ausencia es una infracción grave que puede derivar en responsabilidad penal del empleador.',
        nivelConfianza: 'alta',
      },
    ],
  },

  // ─── 13. AGENTES BIOLÓGICOS ───────────────────────────────────────────────
  {
    id:       'biologico',
    nombre:   'Exposición a agentes biológicos',
    keywords: ['sangre', 'fluidos', 'hospital', 'clinica', 'enfermeria',
               'paciente', 'residuos', 'basura', 'aguas servidas', 'desechos',
               'reciclaje', 'bacteria', 'virus', 'biologico'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Exposición a agentes biológicos (bacterias, virus, hongos) a través de fluidos corporales, residuos o superficies contaminadas',
        riesgo:              'Infección por patógenos de transmisión sanguínea, respiratoria o por contacto directo con material biológico contaminado',
        consecuenciaEsperada:'Hepatitis B/C, infección por VIH (trabajadores de salud), tuberculosis, leptospirosis, infecciones cutáneas y gastrointestinales',
        factorRiesgo:        'materias_primas',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Instalar estaciones de lavado de manos con agua corriente, jabón y toallas desechables. Dispensadores de solución alcohólica al 70% en puntos críticos',
            responsableSugerido:   'Jefe de Establecimiento',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Capacitar en Precauciones Estándar: higiene de manos (5 momentos OMS), manejo de cortopunzantes (contenedores rígidos) y segregación de residuos biológicos según DS 6/2009',
            responsableSugerido:   'Encargado de SSOMA',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Guantes de látex o nitrilo para contacto con fluidos. Mascarilla quirúrgica o FFP2 según tipo de exposición. Lentes de protección y delantal impermeable ante riesgo de salpicaduras',
            responsableSugerido:   'Supervisor directo',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Título V — Agentes Biológicos, Artículos 41–53',
            fundamento: 'Obliga a identificar riesgos biológicos, implementar medidas de control y proveer EPP adecuado al tipo de agente y vía de exposición',
          },
          {
            norma:      'DS N° 6/2009 (MINSAL) — Reglamento sobre manejo de residuos de establecimientos de atención de salud',
            fundamento: 'Establece clasificación, contenedores normados, transporte y disposición final de residuos biológicos y cortopunzantes',
          },
        ],
        justificacionTecnica: 'Las Precauciones Estándar de la OMS son el pilar de la prevención en entornos con riesgo biológico: tratar todos los fluidos corporales como potencialmente infecciosos, independientemente del diagnóstico del paciente. La vacunación contra Hepatitis B es obligatoria para trabajadores de salud en Chile y debe verificarse antes del inicio de funciones.',
        nivelConfianza: 'media',
      },
    ],
  },

  // ─── 14. CAÍDAS AL MISMO NIVEL ────────────────────────────────────────────
  {
    id:       'caidas_nivel',
    nombre:   'Caídas al mismo nivel',
    keywords: ['piso', 'mojado', 'resbalon', 'tropiezo', 'caida', 'desorden',
               'obstaculo', 'cocina', 'bano', 'pasillo', 'escalon', 'rampa',
               'superficie irregular'],
    threshold: 1,
    sugerencias: [
      {
        peligro:             'Superficies de trabajo resbaladizas, mojadas o con obstáculos en el piso',
        riesgo:              'Caída al mismo nivel por resbalón, tropiezo o pérdida de equilibrio en el puesto de trabajo',
        consecuenciaEsperada:'Contusiones, fracturas de extremidades superiores e inferiores, TEC por golpe contra el suelo, lesiones de rodilla y cadera',
        factorRiesgo:        'ambiente_trabajo',
        probabilidadSugerida:'media',
        consecuenciaSugerida:'danino',
        magnitudRiesgo:      4,
        clasificacionRiesgo: 'moderado',
        jerarquiaControl:    'ingenieria',
        medidasControl: [
          {
            tipoControl:           'ingenieria',
            descripcion:           'Aplicar tratamiento antideslizante en pisos críticos (cocinas, baños, áreas de proceso). Instalar canaletas y drenajes para evitar acumulación de agua. Eliminar diferencias de nivel abruptas y asegurar cables',
            responsableSugerido:   'Jefe de Mantenimiento',
            plazoSugerido:         '15 días',
            requiereProgramaTrabajo: true,
          },
          {
            tipoControl:           'administrativo',
            descripcion:           'Implementar programa de orden y limpieza (metodología 5S). Definir rutas de tránsito despejadas. Señalizar zonas de piso húmedo. Capacitar en reporte de condiciones inseguras',
            responsableSugerido:   'Encargado de turno',
            plazoSugerido:         'Inmediato',
            requiereProgramaTrabajo: false,
          },
          {
            tipoControl:           'epp',
            descripcion:           'Proveer calzado de seguridad con suela antideslizante certificada (EN-ISO 20345) para personal en áreas húmedas o con derrames frecuentes',
            responsableSugerido:   'Jefe de Producción',
            plazoSugerido:         '7 días',
            requiereProgramaTrabajo: false,
          },
        ],
        normativaRelacionada: [
          {
            norma:      'DS N° 594/1999, Artículos 24 y 35',
            fundamento: 'Los pisos deben ser sólidos, no resbaladizos y de fácil limpieza. Las escaleras y rampas deben tener superficies antideslizantes y barandas',
          },
        ],
        justificacionTecnica: 'Las caídas al mismo nivel representan entre el 20–25% de los accidentes del trabajo con días perdidos en Chile según estadísticas del ISL. Son frecuentes en cocinas, bodegas y áreas de proceso con derrames de agua, aceites o productos. Las causas más comunes son pisos mojados sin señalización, falta de orden y calzado inadecuado.',
        nivelConfianza: 'media',
      },
    ],
  },

]
