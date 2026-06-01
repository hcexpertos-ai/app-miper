// ─── FUF · Formulario Único de Fiscalización · DS N°44/2024 ──────────────────

export type RespuestaFuf = 'cumple' | 'no_cumple' | 'no_aplica' | ''

export interface ItemFuf {
  id: number
  seccion: string
  descripcion: string
  articulo: string
  nota?: string
}

export interface SeccionFuf {
  id: string
  nombre: string
}

export const SECCIONES_FUF: SeccionFuf[] = [
  { id: 'S1',  nombre: 'Sistema de Gestión de SST (SGSST)' },
  { id: 'S2',  nombre: 'Identificación de Peligros y Evaluación de Riesgos' },
  { id: 'S3',  nombre: 'Programa de Trabajo en Prevención de Riesgos Laborales' },
  { id: 'S4',  nombre: 'Información y Formación en Seguridad y Salud en el Trabajo' },
  { id: 'S5',  nombre: 'Consulta y Participación' },
  { id: 'S6',  nombre: 'Riesgo Grave e Inminente y Plan de Gestión de Emergencias' },
  { id: 'S7',  nombre: 'Coordinación y Cooperación entre Entidades Empleadoras' },
  { id: 'S8',  nombre: 'Comités Paritarios de Higiene y Seguridad' },
  { id: 'S9',  nombre: 'Departamentos de Prevención de Riesgos' },
  { id: 'S10', nombre: 'Reglamentos Internos' },
  { id: 'S11', nombre: 'Mapas de Riesgos' },
  { id: 'S12', nombre: 'Vigilancia del Ambiente y de la Salud' },
  { id: 'S13', nombre: 'Traslado del Puesto de Trabajo y Prescripción de Medidas' },
  { id: 'S14', nombre: 'Investigación de Accidentes del Trabajo y Enfermedades Profesionales' },
  { id: 'S15', nombre: 'Registro de la Actividad Preventiva e Indicadores de Gestión' },
]

export const ITEMS_FUF: (ItemFuf & { seccion_id: string })[] = [
  // ── S1: Sistema de Gestión de SST ────────────────────────────────────────
  {
    id: 1, seccion_id: 'S1', seccion: 'Sistema de Gestión de SST (SGSST)',
    descripcion: 'La entidad empleadora cuenta con un Sistema de Gestión de Seguridad y Salud en el Trabajo, que contiene como mínimo:\na) Una Política de Seguridad y Salud en el Trabajo.\nb) La estructura organizacional de la entidad empleadora para la gestión preventiva de los riesgos laborales.\nc) El diagnóstico, la planificación y programación de la actividad preventiva.\nd) La evaluación o auditoría periódica del desempeño del Sistema de SST.\ne) La acción en promoción de mejoras continuas o correctivas.',
    articulo: 'Art. 22, inc. 1 / Art. 64, inc. 1',
  },
  // ── S2: Identificación de Peligros y Evaluación de Riesgos ───────────────
  {
    id: 2, seccion_id: 'S2', seccion: 'Identificación de Peligros y Evaluación de Riesgos',
    descripcion: '¿Cuenta con Matriz de Identificación de Peligros y Evaluación de los Riesgos laborales (MIPER) que incorpore todos los procesos, tareas y puestos de trabajo?',
    articulo: 'Art. 7, inc. 1',
  },
  {
    id: 3, seccion_id: 'S2', seccion: 'Identificación de Peligros y Evaluación de Riesgos',
    descripcion: '¿La MIPER considera la exposición a todos los agentes y factores de riesgos existentes en el lugar de trabajo (tales como los riesgos ergonómicos, psicosociales, la violencia y el acoso en el trabajo, los accidentes del trabajo y enfermedades profesionales que se hayan producido, a los riesgos asociados a los programas de vigilancia ocupacional, con enfoque de género)?',
    articulo: 'Art. 7, inc. 2',
  },
  {
    id: 4, seccion_id: 'S2', seccion: 'Identificación de Peligros y Evaluación de Riesgos',
    descripcion: '¿La MIPER se encuentra disponible en los lugares de trabajo y ha sido informada a las personas trabajadoras, comité paritario, delegado de Seguridad y Salud en el Trabajo, los dirigentes sindicales y a toda la línea de mando?',
    articulo: 'Art. 7, inc. 9',
  },
  {
    id: 5, seccion_id: 'S2', seccion: 'Identificación de Peligros y Evaluación de Riesgos',
    descripcion: 'La MIPER contiene los siguientes elementos mínimos y éstos se ajustan a los requisitos normativos y técnicos:\na) La identificación de los peligros del puesto de trabajo.\nb) La evaluación de los riesgos.\nc) Magnitud o el nivel de riesgo.\nd) Medidas preventivas de control y de emergencias adicionales.',
    articulo: 'Art. 7, inc. 3',
  },
  {
    id: 6, seccion_id: 'S2', seccion: 'Identificación de Peligros y Evaluación de Riesgos',
    descripcion: '¿La MIPER tiene fecha de elaboración y es revisada al menos anualmente o cuando cambien las condiciones de trabajo, ocurra un accidente del trabajo, se diagnostique una enfermedad profesional o se genere una situación de riesgo grave e inminente?',
    articulo: 'Art. 7, inc. 9 / Art. 64, inc. 2',
  },
  {
    id: 7, seccion_id: 'S2', seccion: 'Identificación de Peligros y Evaluación de Riesgos',
    descripcion: '¿La entidad empleadora de hasta 25 personas trabajadoras identifica y evalúa sus condiciones ambientales, psicosociales y ergonómicas y el cumplimiento normativo, con el instrumento de autoevaluación del Organismo Administrador del Seguro de la Ley 16.744?',
    articulo: 'Art. 64, inc. 1',
  },
  // ── S3: Programa de Trabajo ───────────────────────────────────────────────
  {
    id: 8, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿La entidad empleadora cuenta con el programa de trabajo preventivo confeccionado, o actualizado, a partir de la MIPER, en un plazo de 30 días corridos desde la confección o actualización de la MIPER?',
    articulo: 'Art. 8, inc. 1',
  },
  {
    id: 9, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿El programa de trabajo preventivo se encuentra por escrito y aprobado por el representante legal?',
    articulo: 'Art. 8, inc. 1',
  },
  {
    id: 10, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: 'El programa de trabajo preventivo contiene:\na) Las medidas preventivas y correctivas a implementar de acuerdo con la MIPER.\nb) Los plazos de implementación.\nc) Los responsables de implementación.\nd) Las actividades de promoción para prevenir factores de riesgos asociados al consumo de alcohol y drogas.\ne) Difusión de un estilo de vida y alimentación saludables.\nf) Actividades para prevenir riesgos asociados a la conducción de vehículos motorizados cuando corresponda.\ng) Fechas de modificaciones y aprobación.',
    articulo: 'Art. 8, inc. 1, 2 y 3',
  },
  {
    id: 11, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿El programa de trabajo preventivo ha sido difundido en los lugares de trabajo a las personas trabajadoras y remitido un ejemplar al Comité Paritario?',
    articulo: 'Art. 8, inc. 3',
  },
  {
    id: 12, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: 'En relación con el uso de máquinas, equipos y elementos de trabajo:\na) ¿Se informa convenientemente acerca de sus riesgos y de su manejo adecuado y seguro?\nb) ¿Informa sobre el contenido sustancial de los manuales, instrucciones y fichas técnicas?\nc) ¿Cuenta con procedimiento de trabajo seguro?\nd) ¿Informa y capacita sobre la forma de uso correcto y seguro de las maquinarias?',
    articulo: 'Art. 10, inc. 1 y 2',
  },
  {
    id: 13, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Se adoptan medidas de prevención de los riesgos laborales, según la prelación de medidas, que privilegien el uso de mecanismos o equipos de protección colectiva por sobre el uso de elementos de protección personal (EPP)?',
    articulo: 'Art. 12',
  },
  {
    id: 14, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: 'Ante el riesgo residual ¿Se proporciona a las personas trabajadoras, libres de costo, los EPP?',
    articulo: 'Art. 13, inc. 1',
  },
  {
    id: 15, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Los EPP son adecuados al riesgo a cubrir?',
    articulo: 'Art. 13, inc. 1',
  },
  {
    id: 16, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Los EPP cumplen con las normas vigentes de certificación de calidad o encontrarse registrados en el Instituto de Salud Pública de Chile (ISP)?',
    articulo: 'Art. 13, inc. 2',
  },
  {
    id: 17, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Cuenta con un procedimiento que considere la utilización, mantenimiento, reposición o recambio de los EPP?',
    articulo: 'Art. 13, inc. 2',
  },
  {
    id: 18, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Las personas trabajadoras se encuentran capacitadas sobre el uso y mantención de los EPP?',
    articulo: 'Art. 13, inc. 3',
    nota: 'Curso de duración mínima de 1 hora, en el que se considere las partes que componen el EPP, su colocación, limitaciones de uso, limpieza, almacenamiento y prueba de chequeo diario.',
  },
  {
    id: 19, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Cuenta con registro de las actividades de capacitación en EPP?',
    articulo: 'Art. 13, inc. 4',
    nota: 'El registro debe considerar como mínimo: a) Actividades teóricas y prácticas; b) Asistentes; c) Relatores; d) Resultados de las evaluaciones de aprendizaje; e) Actividades de reforzamiento.',
  },
  {
    id: 20, seccion_id: 'S3', seccion: 'Programa de Trabajo en Prevención de Riesgos Laborales',
    descripcion: '¿Se realiza, al menos anualmente, una evaluación del cumplimiento del programa de trabajo preventivo, especialmente la eficacia de las acciones programadas, y se disponen las medidas de mejora continua?',
    articulo: 'Art. 14 / Art. 52',
  },
  // ── S4: Información y Formación ───────────────────────────────────────────
  {
    id: 21, seccion_id: 'S4', seccion: 'Información y Formación en SST',
    descripcion: 'Se informa los riesgos que entrañan sus labores, las medidas preventivas y los métodos o procedimientos de trabajo correctos, a las personas trabajadoras, de forma:\na) Oportuna y adecuada.\nb) Previa al inicio de las labores y cada vez que exista un nuevo proceso productivo, cambien las tecnologías, los materiales o sustancias utilizados.',
    articulo: 'Art. 15, inc. 1',
  },
  {
    id: 22, seccion_id: 'S4', seccion: 'Información y Formación en SST',
    descripcion: 'La información de los riesgos laborales entregada a las personas trabajadoras considera a lo menos:\na) Las características mínimas que debe reunir el lugar de trabajo en el que se ejecutarán las labores.\nb) Los riesgos a los que podrían estar expuestas y las respectivas medidas preventivas, incluidos los derivados de emergencias, catástrofes y desastres.\nc) Los procedimientos de trabajo seguro.\nd) Las características de los productos y sustancias que se manipularán.\ne) Los riesgos derivados de emergencias, catástrofes o desastres y los mecanismos de actuación frente a ellas.',
    articulo: 'Art. 15, inc. 3 / Art. 19, inc. 1',
  },
  {
    id: 23, seccion_id: 'S4', seccion: 'Información y Formación en SST',
    descripcion: 'Se efectuó capacitación teórica o práctica en prevención de riesgos laborales a las personas trabajadoras, y esta:\na) Fue realizada en las oportunidades y con la periodicidad definida en el programa de trabajo preventivo, que no podrá exceder de dos años.\nb) Contiene las principales medidas de seguridad y salud que deben tenerse presente para desempeñar las labores.\nc) Considera un enfoque de género.\nd) Tiene una duración de al menos 8 horas, preferentemente dentro de la jornada.\ne) Considera metodologías que procuren un adecuado aprendizaje.',
    articulo: 'Art. 16, inc. 1',
  },
  {
    id: 24, seccion_id: 'S4', seccion: 'Información y Formación en SST',
    descripcion: 'La capacitación (teórica o práctica) aborda los siguientes temas:\na) Factores de riesgos presentes en el lugar en el que deban ejecutarse las labores.\nb) Efectos en la salud por la exposición a factores de riesgos, causantes de enfermedades profesionales.\nc) Medidas preventivas para el control de los riesgos identificados y evaluados.\nd) Prestaciones médicas y económicas a las que tiene derecho la persona trabajadora.\ne) El establecimiento asistencial del respectivo organismo administrador.\nf) Plan de gestión de riesgos de emergencia, catástrofe o desastre.\ng) Señalética en los lugares de trabajo.\nh) Prevención de riesgos de incendio.',
    articulo: 'Art. 16, inc. 1',
  },
  // ── S5: Consulta y Participación ─────────────────────────────────────────
  {
    id: 25, seccion_id: 'S5', seccion: 'Consulta y Participación',
    descripcion: '¿Se promueve la consulta y participación de los representantes de las personas trabajadoras, en la gestión preventiva?',
    articulo: 'Art. 17, inc. 1 / Art. 37, inc. 2, numeral 4 / Art. 71, inc. 1',
    nota: 'Se consulta al Comité Paritario cuando existan cambios en los procesos de trabajo. La entidad empleadora deberá promover la participación de las personas trabajadoras y sus representantes en la investigación de las causas de accidentes o enfermedades profesionales.',
  },
  // ── S6: Riesgo Grave e Inminente ─────────────────────────────────────────
  {
    id: 26, seccion_id: 'S6', seccion: 'Riesgo Grave e Inminente y Plan de Gestión de Emergencias',
    descripcion: 'La entidad empleadora ante un riesgo grave e inminente realizó lo siguiente:\na) Informar inmediatamente a todas las personas trabajadoras afectadas sobre la existencia del mencionado riesgo, así como las medidas adoptadas para eliminarlo o atenuarlo.\nb) Adoptar medidas para la suspensión inmediata de las faenas afectadas y su evacuación, en caso de que el riesgo no se pueda eliminar o atenuar.',
    articulo: 'Art. 18, inc. 1',
  },
  {
    id: 27, seccion_id: 'S6', seccion: 'Riesgo Grave e Inminente y Plan de Gestión de Emergencias',
    descripcion: '¿Se cuenta con uno o más planes de gestión, reducción y respuesta de los riesgos en caso de emergencias, catástrofe o desastres u otros eventos o incidentes conocidos, probables y previsibles de naturaleza interna o externa a la empresa?',
    articulo: 'Art. 19, inc. 1',
  },
  {
    id: 28, seccion_id: 'S6', seccion: 'Riesgo Grave e Inminente y Plan de Gestión de Emergencias',
    descripcion: '¿Se realiza a lo menos una vez al año pruebas de ensayo del o los planes de gestión, reducción y respuesta frente a los riesgos de emergencias, catástrofe o desastres u otros eventos o incidentes conocidos?',
    articulo: 'Art. 19, inc. 1',
  },
  // ── S7: Coordinación y Cooperación ───────────────────────────────────────
  {
    id: 29, seccion_id: 'S7', seccion: 'Coordinación y Cooperación entre Entidades Empleadoras',
    descripcion: '¿Existe coordinación, cooperación e información mutua, en el lugar de trabajo, cuando presten servicios más de una entidad empleadora, o al menos una entidad empleadora y una o más personas trabajadoras independientes, para la adecuada aplicación de las medidas de seguridad y salud?',
    articulo: 'Art. 20, inc. 1',
  },
  // ── S8: Comités Paritarios ────────────────────────────────────────────────
  {
    id: 30, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿Se encuentra constituido el Comité Paritario de Higiene y Seguridad en la empresa, faena, sucursal o agencia en que trabajen más de 25 personas?',
    articulo: 'Art. 23, inc. 1',
  },
  {
    id: 31, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿Se toman las medidas para que los integrantes electos del Comité Paritario de Higiene y Seguridad que no cuenten con el curso de orientación de prevención de riesgos lo realicen durante el primer semestre de su mandato?',
    articulo: 'Art. 32, inc. 1',
  },
  {
    id: 32, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿Se registró el acta de constitución del Comité Paritario en el sitio web de la Dirección del Trabajo, dentro de los 15 días hábiles siguientes a la fecha de la elección de representantes de las personas trabajadoras?',
    articulo: 'Art. 36',
  },
  {
    id: 33, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿La entidad empleadora otorga las facilidades y adopta las medidas necesarias para que funcione adecuadamente el o los Comités Paritarios de Higiene y Seguridad?',
    articulo: 'Art. 37',
  },
  {
    id: 34, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: 'El Comité Paritario de Higiene y Seguridad efectúa reuniones mensuales en forma ordinaria, y en forma extraordinaria en los siguientes casos:\na) A petición conjunta de miembros del Comité.\nb) Cuando ocurra un accidente del trabajo fatal o grave.\nc) Cuando exista riesgo grave e inminente.',
    articulo: 'Art. 39, inc. 1 y 2',
  },
  {
    id: 35, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿Se cuenta con actas de las reuniones efectuadas por el Comité Paritario de Higiene y Seguridad, donde se consigne como mínimo: las materias tratadas, los acuerdos, y en caso de adoptarse medidas preventivas, el plazo de cumplimiento?',
    articulo: 'Art. 39, inc. 4 / Art. 42, inc. 1',
  },
  {
    id: 36, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿Los acuerdos del Comité Paritario de Higiene y Seguridad se le comunican por escrito a la entidad empleadora?',
    articulo: 'Art. 42, inc. 2',
  },
  {
    id: 37, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿Se proporciona toda la documentación de prevención de riesgos laborales de la respectiva entidad empleadora al Comité Paritario de Higiene y Seguridad para cumplir su rol en la gestión de la SST?',
    articulo: 'Art. 46, inc. 3',
  },
  {
    id: 38, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿El Comité Paritario de Higiene y Seguridad cumple con las funciones mínimas?\na) Asesorar e instruir a las personas trabajadoras para la correcta utilización de los instrumentos de protección.\nb) Vigilar el cumplimiento de las medidas de prevención o de SST.\nc) Investigar las causas de los accidentes del trabajo y enfermedades profesionales.\nd) Decidir si el accidente o la EP se debió a negligencia inexcusable de la persona trabajadora.\ne) Indicar la adopción de todas las medidas de seguridad y salud para la prevención de los riesgos laborales.\nf) Promover la realización de cursos destinados a la capacitación profesional.\ng) Informar a la entidad empleadora cuando detectare un riesgo grave e inminente.\nh) Cumplir las demás funciones que le encomiende el Organismo Administrador del Seguro de la Ley 16.744.',
    articulo: 'Art. 47',
  },
  {
    id: 39, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: 'En todo lugar de trabajo o faena donde laboren entre 10 y hasta 25 personas trabajadoras, ¿cuenta con Delegado de Seguridad y Salud en el Trabajo, que participe en la implementación del Sistema de Gestión para empresas de menor tamaño y demás intervenciones legales asignadas?',
    articulo: 'Art. 66, inc. 1 / Art. 64 / Art. 37',
  },
  {
    id: 40, seccion_id: 'S8', seccion: 'Comités Paritarios de Higiene y Seguridad',
    descripcion: '¿El Delegado de Seguridad y Salud en el Trabajo es elegido cada 2 años, mediante realización de asamblea de las personas trabajadoras de la faena o lugar de trabajo, dejando acta de esta?',
    articulo: 'Art. 66, inc. 2',
  },
  // ── S9: Departamentos de Prevención de Riesgos ───────────────────────────
  {
    id: 41, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: '¿Cuenta con Departamento de Prevención de Riesgos, si la entidad empleadora tiene más de 100 personas trabajadoras, dirigido por un experto inscrito en los registros de la Seremi de Salud?',
    articulo: 'Art. 50 / Art. 55, inc. 2',
  },
  {
    id: 42, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: '¿Se proporciona al Departamento de Prevención de Riesgos todos los medios y el personal necesario para dar cumplimiento a las funciones y las actividades programadas?',
    articulo: 'Art. 51, inc. 1',
  },
  {
    id: 43, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: '¿El Departamento de Prevención de Riesgos cumple con sus funciones?',
    articulo: 'Art. 52',
  },
  {
    id: 44, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: '¿La categoría y tiempo de dedicación mínima del encargado del Departamento de Prevención de Riesgos es determinada en base al número de personas trabajadoras y cotización genérica?',
    articulo: 'Art. 54 / Art. 55, inc. 1',
  },
  {
    id: 45, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: '¿El encargado del Departamento de Prevención de Riesgos registra asistencia, dando cumplimiento al tiempo de atención definido conforme la norma, según el número de personas trabajadoras y cotización genérica?',
    articulo: 'Art. 55, inc. 1 y 3',
  },
  {
    id: 46, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: 'El Departamento de Prevención de Riesgos mantiene:\na) Registro de Incidentes o sucesos peligrosos.\nb) Registros de todos los accidentes del trabajo, trayecto y de enfermedades profesionales.\nc) Registro de personas trabajadoras en vigilancia de la salud.\nd) Estadísticas (tasas) de seguridad y salud: tasa de accidentabilidad, tasa mensual de frecuencia, tasa semestral de gravedad.\ne) Los registros se encuentran diferenciados por sexo (perspectiva de género).',
    articulo: 'Art. 73 / Art. 74',
    nota: 'Los registros deben resguardar la información de carácter sensible o confidencial de las personas trabajadoras o personas involucradas.',
  },
  {
    id: 47, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: 'En caso de que la entidad empleadora no esté obligada a contar con Departamento de Prevención de Riesgos, registra la siguiente información:\na) Tasa anual de accidentabilidad por accidentes del trabajo.\nb) Todos los accidentes del trabajo y trayecto.\nc) Enfermedades profesionales.',
    articulo: 'Art. 75',
  },
  {
    id: 48, seccion_id: 'S9', seccion: 'Departamentos de Prevención de Riesgos',
    descripcion: 'La entidad empleadora que cuenta con hasta 100 personas trabajadoras y haya designado a un encargado en materia de Gestión del Riesgo, ¿la persona trabajadora asignada fue capacitada por el Organismo Administrador de la Ley 16744 en la materia?',
    articulo: 'Art. 65, inc. 1',
  },
  // ── S10: Reglamentos Internos ─────────────────────────────────────────────
  {
    id: 49, seccion_id: 'S10', seccion: 'Reglamentos Internos',
    descripcion: '¿La entidad empleadora cuenta y mantiene al día un Reglamento Interno de Higiene y Seguridad en el Trabajo, este es entregado de forma gratuita a las personas trabajadoras e ingresado a la página web de la Dirección del Trabajo?',
    articulo: 'Art. 56, inc. 1 / Art. 57, inc. 1',
    nota: 'Al ser ingresado en la página web de la Dirección del Trabajo será considerado ingresado en Secretaría Regional Ministerial de Salud.',
  },
  {
    id: 50, seccion_id: 'S10', seccion: 'Reglamentos Internos',
    descripcion: 'El Reglamento Interno se envía para su consideración y observaciones, con 30 días antes que empiece a regir, a:\na) Las personas trabajadoras.\nb) Comité Paritario o del Delegado de Seguridad y Salud en el Trabajo.\nc) Las organizaciones sindicales.',
    articulo: 'Art. 57, inc. 2',
  },
  {
    id: 51, seccion_id: 'S10', seccion: 'Reglamentos Internos',
    descripcion: '¿Se revisa el Reglamento Interno con una periodicidad no inferior a un año, con la participación del Departamento de Prevención de Riesgos o del Comité Paritario o Delegado de Seguridad Salud en el Trabajo y organizaciones sindicales?',
    articulo: 'Art. 57, inc. 5',
  },
  {
    id: 52, seccion_id: 'S10', seccion: 'Reglamentos Internos',
    descripcion: '¿El Reglamento Interno contiene como mínimo los siguientes capítulos: preámbulo, disposiciones generales, obligaciones de las personas trabajadoras, prohibiciones y sanciones?',
    articulo: 'Art. 58',
  },
  // ── S11: Mapas de Riesgos ─────────────────────────────────────────────────
  {
    id: 53, seccion_id: 'S11', seccion: 'Mapas de Riesgos',
    descripcion: '¿La entidad empleadora mantiene en sus dependencias mapas de riesgos en lugares visibles y estos consideran como mínimo un dibujo o esquema del lugar de trabajo e indican los principales riesgos existentes?',
    articulo: 'Art. 62, inc. 1 y 2',
  },
  // ── S12: Vigilancia del Ambiente y de la Salud ───────────────────────────
  {
    id: 54, seccion_id: 'S12', seccion: 'Vigilancia del Ambiente y de la Salud',
    descripcion: '¿La entidad empleadora tiene los lugares de trabajo con exposición a agentes o factores de riesgos en programa de vigilancia ambiental, en conformidad a lo establecido en los protocolos del Ministerio de Salud y a los programas establecidos por los Organismos Administradores del Seguro de la Ley 16.744?',
    articulo: 'Art. 67, inc. 1 y 3',
  },
  {
    id: 55, seccion_id: 'S12', seccion: 'Vigilancia del Ambiente y de la Salud',
    descripcion: '¿Las personas trabajadoras expuestas a agentes o factores de riesgos en los lugares de trabajo se encuentran en programa de vigilancia a la salud en conformidad a lo establecido en los protocolos del Ministerio de Salud y a los programas establecidos por los Organismos Administradores del Seguro de la Ley 16.744?',
    articulo: 'Art. 67, inc. 1, 3 y 5',
    nota: 'Debe entenderse considerado en este ítem la obligación de la entidad empleadora de solicitar la incorporación y ejecución del programa de vigilancia a la salud.',
  },
  {
    id: 56, seccion_id: 'S12', seccion: 'Vigilancia del Ambiente y de la Salud',
    descripcion: '¿La entidad empleadora autoriza a las personas trabajadoras a que asistan a la citación para exámenes de control por Organismos Administradores del Seguro de la Ley 16.744?',
    articulo: 'Art. 68',
    nota: 'El tiempo que empleen en dichos exámenes será considerado como trabajado para todos los efectos legales.',
  },
  // ── S13: Traslado del Puesto de Trabajo ───────────────────────────────────
  {
    id: 57, seccion_id: 'S13', seccion: 'Traslado del Puesto de Trabajo y Prescripción de Medidas',
    descripcion: '¿La persona trabajadora afectada por una enfermedad profesional ha sido trasladada a un puesto de trabajo en donde no está expuesta al riesgo que dio origen a dicha enfermedad, de acuerdo con lo prescrito por el Organismo Administrado de la Ley 16744? Esta medida no le significa detrimento de sus remuneraciones.',
    articulo: 'Art. 69',
  },
  {
    id: 58, seccion_id: 'S13', seccion: 'Traslado del Puesto de Trabajo y Prescripción de Medidas',
    descripcion: '¿La entidad empleadora implementa las medidas de seguridad y salud en el trabajo que les ordenen los organismos fiscalizadores competentes, las que le prescriba el respectivo Organismo Administrador del Seguro de la Ley 16.744, y las que indique el Departamento de Prevención de Riesgos o el Comité Paritario de Higiene y Seguridad?',
    articulo: 'Art. 70',
  },
  // ── S14: Investigación de Accidentes ─────────────────────────────────────
  {
    id: 59, seccion_id: 'S14', seccion: 'Investigación de Accidentes y Enfermedades Profesionales',
    descripcion: '¿La entidad empleadora investiga con enfoque de género las causas de los accidentes del trabajo y las enfermedades profesionales diagnosticadas que afecte a las personas trabajadoras?',
    articulo: 'Art. 71',
    nota: 'La entidad empleadora deberá utilizar la metodología de investigación que indique el Organismo Administrador del Seguro de la Ley 16.744 o administración delegada.',
  },
  // ── S15: Registro de la Actividad Preventiva ─────────────────────────────
  {
    id: 60, seccion_id: 'S15', seccion: 'Registro de la Actividad Preventiva e Indicadores de Gestión',
    descripcion: '¿La entidad empleadora registra y respalda de forma documental y fidedigna toda la información vinculada a la gestión de los riesgos y la mantiene a disposición de las entidades fiscalizadoras y del respectivo Organismo Administrador del Seguro de la Ley 16.744?',
    articulo: 'Art. 72, inc. 1',
  },
]
