// ─── Autoevaluación Inicial de Cumplimiento — Anexo N°2 · DS 44 ─────────────

export type Respuesta = 'si' | 'no' | 'na' | ''

export interface ItemAutoevaluacion {
  id: number
  seccion_romana: string
  seccion: string
  descripcion: string
  cuerpo_legal: string
}

export interface SeccionMeta {
  romana: string
  nombre: string
}

export const SECCIONES: SeccionMeta[] = [
  { romana: 'I',   nombre: 'Organización de la Prevención de Riesgos' },
  { romana: 'II',  nombre: 'Saneamiento Básico' },
  { romana: 'III', nombre: 'Condiciones de Seguridad' },
  { romana: 'IV',  nombre: 'Protección Colectiva y Personal' },
  { romana: 'V',   nombre: 'Prevención de Incendio y Emergencia' },
  { romana: 'VI',  nombre: 'Vigilancia' },
  { romana: 'VII', nombre: 'Registro' },
]

export const ITEMS: ItemAutoevaluacion[] = [
  // ── I. Organización de la Prevención de Riesgos ──────────────────────────
  {
    id: 1, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora cuenta con Reglamento Interno de Higiene y Seguridad (RIHS) y/u Orden Higiene y Seguridad (RIOHS) actualizado, según corresponda.',
    cuerpo_legal: 'Cód. del Trabajo Art. N°153-154; Ley N°16.744, Art. N°67; D.S. N°44, Art. N°56.',
  },
  {
    id: 2, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora mantiene los registros actualizados de la recepción o entrega del RIHS o RIOHS a cada persona trabajadora.',
    cuerpo_legal: 'Cód. del Trabajo Art. N°153-154; Ley N°16.744, Art. N°67; D.S. N°44, Art. N°56.',
  },
  {
    id: 3, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora cuenta con un "Manual", "Guía", "Protocolo o Instructivo" en concordancia con la implementación de la Ley N°21.645 sobre "La protección a la maternidad, paternidad y vida familiar".',
    cuerpo_legal: 'Ley N°21.645 sobre "La protección a la maternidad, paternidad y vida familiar".',
  },
  {
    id: 4, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora cuenta con el "Protocolo de Prevención de Acoso Sexual, Laboral y Violencia en el trabajo" de la Ley N° 21.643 (Ley Karin).',
    cuerpo_legal: 'Ley N°21.643 (Ley Karin) sobre la Prevención, Investigación y Sanción del Acoso Laboral, Sexual y Violencia en el Trabajo.',
  },
  {
    id: 5, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora garantiza que cada persona trabajadora, previo al inicio de las labores, y cada vez que sea necesario, reciba de forma oportuna y adecuada información acerca de los riesgos que entrañan sus labores, de las medidas preventivas y los métodos o procedimientos de trabajo correctos, determinados conforme a la matriz de riesgos y el programa de trabajo preventivo.',
    cuerpo_legal: 'D.S. N°44, Art. 15.',
  },
  {
    id: 6, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora efectúa una capacitación teórica o práctica, según corresponda, a las personas trabajadoras, acerca de las principales medidas de seguridad y salud que deben tener presente para desempeñar sus labores, considerando el enfoque de género (curso de al menos 8 horas "a través de entidades acreditadas o con la asistencia técnica del respectivo organismo administrador de la ley N° 16.744").',
    cuerpo_legal: 'D.S. N°44, Art. 16.',
  },
  {
    id: 7, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'En la entidad empleadora se ha constituido y se encuentra en funcionamiento el Comité Paritario de Higiene y Seguridad (entidad empleadora con más de 25 trabajadores permanentes).',
    cuerpo_legal: 'Ley N°16.744 Art. N°66; Ley N°19.345, Art. N°6; D.S. N°44, Art. N°23.',
  },
  {
    id: 8, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'El Comité Paritario de Higiene y Seguridad cuenta con un programa de trabajo propio y se reúne como mínimo una vez al mes.',
    cuerpo_legal: 'Ley N°16.744 Art. N°66; Ley N°19.345, Art. N°6; D.S.N°44, Art. N°39 y Art. N°47.',
  },
  {
    id: 9, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'El Comité Paritario de Higiene y Seguridad realiza investigación de las causas de los accidentes del trabajo y las enfermedades profesionales.',
    cuerpo_legal: 'Ley N°16.744 Art. N°66; Ley N°19.345, Art. N°6; D.S.N°44, Art. N°47.',
  },
  {
    id: 10, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'Se vela para que los miembros del Comité Paritario de Higiene y Seguridad cumplan con los requisitos de formación y capacitación suficiente para ejercer sus funciones (Curso OPR 8hrs o CPHS 20 Hrs.).',
    cuerpo_legal: 'D.S. N°44, Art. N°32.',
  },
  {
    id: 11, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora con más de 25 personas trabajadoras tiene implementado un Sistema de Gestión de Seguridad y Salud en el Trabajo (SGSST), que contenga Política de SST; Estructura organizacional para la gestión preventiva; Diagnóstico, planificación y programación de la actividad preventiva; Evaluación o auditoría periódica del SGSST; Acciones en promoción de mejoras continuas o correctivas.',
    cuerpo_legal: 'D.S. N°44, Art. N°22.',
  },
  {
    id: 12, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora de hasta 25 personas trabajadoras tiene implementado un Sistema de Gestión de Seguridad y Salud en el Trabajo (SGSST) que contenga Política de SST; Evaluación o diagnóstico y Programa de trabajo preventivo.',
    cuerpo_legal: 'D.S. N°44, Art. N°64.',
  },
  {
    id: 13, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora elaboró o modificó el programa de trabajo preventivo a partir de la matriz de identificación de peligros dentro del plazo de 30 días corridos, conteniendo al menos las medidas preventivas y correctivas a implementar, los plazos de implementación y los responsables de su ejecución.',
    cuerpo_legal: 'D.S.N°44, Art. N°8.',
  },
  {
    id: 14, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora promueve la consulta y participación de los representantes de las personas trabajadoras cuando se prevean cambios en los procesos o en la estructura organizacional que puedan poner en riesgo grave la vida y salud de quienes los ejecuten.',
    cuerpo_legal: 'D.S. N°44, Art. N°17.',
  },
  {
    id: 15, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'La entidad empleadora cuando presta servicios junto a más entidades empleadoras en el mismo lugar de trabajo, coordina y coopera para la adecuada aplicación de las medidas de seguridad y salud, garantizando que se informen mutuamente sobre los riesgos laborales existentes, medidas preventivas y planes de emergencia.',
    cuerpo_legal: 'D.S. N°44, Art. N°20.',
  },
  {
    id: 16, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'Los representantes legales de las entidades empleadoras de hasta 100 personas trabajadoras (o quienes estos designen) fueron capacitados por su respectivo organismo administrador de la Ley N°16.744, considerando los contenidos mínimos que instruya la Superintendencia de Seguridad Social.',
    cuerpo_legal: 'D.S. N°44, Art. N°65.',
  },
  {
    id: 17, seccion_romana: 'I', seccion: 'Organización de la Prevención de Riesgos',
    descripcion: 'En todo lugar de trabajo donde laboren entre 10 y hasta 25 personas trabajadoras y no funcione un Comité Paritario, se eligió un representante que cumpla el rol de Delegado en materia de Seguridad y Salud en el Trabajo.',
    cuerpo_legal: 'D.S. N°44, Art.N°66.',
  },
  // ── II. Saneamiento Básico ────────────────────────────────────────────────
  {
    id: 18, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'La entidad empleadora cuenta con servicios higiénicos (o letrina sanitaria en caso de corresponder), de uso individual o colectivo, en cantidades adecuadas; si trabajan hombres y mujeres, éstos se encuentran separados por sexo, en buen estado de limpieza y/o funcionamiento.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 21 y 22.',
  },
  {
    id: 19, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'La entidad empleadora cuenta con un sistema efectivo de sanitización, desratización y desinfección de las dependencias y áreas de trabajo.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 22.',
  },
  {
    id: 20, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'Si el tipo de actividad requiere del cambio de ropa, ¿existen vestidores (fijos o temporales) independientes para hombres y mujeres, con cantidad adecuada de casilleros y en buen estado general?',
    cuerpo_legal: 'D.S. N°594; Art. N°27.',
  },
  {
    id: 21, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'Si el trabajo implica contacto con sustancias tóxicas o causa suciedad corporal, dispone de duchas con agua fría y caliente para sus trabajadores.',
    cuerpo_legal: 'D.S. N°594; Art. N°21.',
  },
  {
    id: 22, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'El lugar de trabajo mantiene condiciones ambientales de ventilación confortables, por medios naturales o artificiales, y que no causen molestias o perjudiquen la salud de las personas trabajadoras.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 9, 22, 32, 33, 35, 120.',
  },
  {
    id: 23, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'Si se deben consumir alimentos, dispone de comedor fijo o móvil separado de las áreas de trabajo, con mesas y sillas de material lavable, agua potable, cocinilla, lavaplatos, sistema de energía eléctrica y refrigeración para la conservación de alimentos.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 28, 29, 30, 128.',
  },
  {
    id: 24, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'La entidad empleadora mantiene el lugar de trabajo adecuadamente iluminado, con luz natural o artificial dependiendo de la faena o actividad que en él se realice.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 103, 104, 106, 120.',
  },
  {
    id: 25, seccion_romana: 'II', seccion: 'Saneamiento Básico',
    descripcion: 'La entidad empleadora toma las medidas necesarias contra las inclemencias del tiempo en los ambientes de trabajo (trabajo en faenas descubiertas, galpones o campo abierto).',
    cuerpo_legal: 'D.S. N°594; Art. N°s 10, 121.',
  },
  // ── III. Condiciones de Seguridad ─────────────────────────────────────────
  {
    id: 26, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora confeccionó una matriz de identificación de peligros y evaluación de los riesgos laborales con enfoque de género, disponible en los lugares de trabajo, e informada a las personas trabajadoras, el Comité Paritario, el Delegado SST y los dirigentes sindicales.',
    cuerpo_legal: 'D.S. N°44, Art. N°7.',
  },
  {
    id: 27, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora considera la situación de las personas trabajadoras especialmente sensibles a determinados riesgos laborales, implementando las medidas de protección específica que requieran.',
    cuerpo_legal: 'D.S. N°44, Art. N°11.',
  },
  {
    id: 28, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'Las entidades empleadoras mantienen en sus dependencias mapas de riesgos que permitan localizar y visualizar los principales riesgos a los que están expuestos las personas trabajadoras.',
    cuerpo_legal: 'D.S. N°44, Art. N°62.',
  },
  {
    id: 29, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora ha suprimido en los lugares de trabajo cualquier factor de peligro que pueda afectar la salud o integridad física de los trabajadores.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 37, 39.',
  },
  {
    id: 30, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora mantiene señalización de seguridad informativa, visible y permanente, indicando agentes y condiciones de riesgo además del uso obligatorio de elementos de protección personal específicos en caso de ser necesario.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 37.',
  },
  {
    id: 31, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora mantiene señalizadas las vías de evacuación, las redes de incendio y salidas de emergencia conforme la normativa.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 37.',
  },
  {
    id: 32, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora mantiene las instalaciones eléctricas y de gas de acuerdo a las normas establecidas por la autoridad competente.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 37, 39. Normativa de Superintendencia de Electricidad y Combustibles (SEC).',
  },
  {
    id: 33, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora cuenta con un procedimiento de trabajo seguro para máquinas, equipos y herramientas que puedan generar riesgo de atrapamiento, corte, lesión y/o amputación, considerando un programa preventivo de operación y mantenimiento, el control permanente de su funcionamiento, así como la existencia de protecciones.',
    cuerpo_legal: 'D.S. N°44, Art.N°10.',
  },
  {
    id: 34, seccion_romana: 'III', seccion: 'Condiciones de Seguridad',
    descripcion: 'La entidad empleadora investiga con enfoque de género, promoviendo la participación de las personas trabajadoras y sus representantes, cuando ocurra un accidente del trabajo, incidente peligroso, se diagnostique una enfermedad profesional o se presente cualquiera otra afección que afecte en forma reiterada o general a las personas trabajadoras.',
    cuerpo_legal: 'D.S. N°44, Art.N°71.',
  },
  // ── IV. Protección Colectiva y Personal ───────────────────────────────────
  {
    id: 35, seccion_romana: 'IV', seccion: 'Protección Colectiva y Personal',
    descripcion: 'La entidad empleadora adopta medidas de prevención de los riesgos laborales que privilegien el uso de mecanismos o equipos de protección colectiva de las personas trabajadoras por sobre el uso de elementos de protección personal.',
    cuerpo_legal: 'D.S. N°44, Art. N°12.',
  },
  {
    id: 36, seccion_romana: 'IV', seccion: 'Protección Colectiva y Personal',
    descripcion: 'La entidad empleadora realiza selección y proporciona a las personas trabajadoras sin costo los elementos de protección personal que cumplan con los requisitos que exige el riesgo a proteger, según la normativa D.S. N°18/1982 del Ministerio de Salud.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 53-54; 57-58.',
  },
  {
    id: 37, seccion_romana: 'IV', seccion: 'Protección Colectiva y Personal',
    descripcion: 'La entidad empleadora entrega capacitación/instrucción teórico/práctica necesaria para el correcto uso y empleo de los elementos de protección personal a sus personas trabajadoras.',
    cuerpo_legal: 'D.S. N°594; Art. N°53.',
  },
  // ── V. Prevención de Incendio y Emergencia ────────────────────────────────
  {
    id: 38, seccion_romana: 'V', seccion: 'Prevención de Incendio y Emergencia',
    descripcion: 'La entidad empleadora cuenta con uno o más planes de gestión, reducción y respuesta de los riesgos en caso de emergencias, catástrofes o desastres, u otros eventos o incidentes conocidos, probables y previsibles de naturaleza interna o externa que tengan la capacidad de producir una alteración grave en su funcionamiento.',
    cuerpo_legal: 'D.S. N°44, Art. N°19.',
  },
  {
    id: 39, seccion_romana: 'V', seccion: 'Prevención de Incendio y Emergencia',
    descripcion: 'En la entidad empleadora se manipulan sustancias o se generan residuos peligrosos (generación, almacenamiento, transporte, eliminación o reciclaje) en condiciones de seguridad adecuadas según las exigencias del Ministerio de Salud.',
    cuerpo_legal: 'MINSAL D.S. N°43; D.S. N°148.',
  },
  {
    id: 40, seccion_romana: 'V', seccion: 'Prevención de Incendio y Emergencia',
    descripcion: 'La entidad empleadora cuenta con extintores de incendio adecuadamente mantenidos, en cantidad adecuada a las dimensiones de la zona de trabajo, ubicados en lugares visibles, señalizados y de fácil acceso.',
    cuerpo_legal: 'D.S. N°594; Art. N°s 45 – 51.',
  },
  {
    id: 41, seccion_romana: 'V', seccion: 'Prevención de Incendio y Emergencia',
    descripcion: 'La entidad empleadora mantiene a los trabajadores instruidos y entrenados sobre la forma correcta de usar los extintores de incendio en caso de emergencia y cuenta con los registros correspondientes.',
    cuerpo_legal: 'D.S. N°594; Art. N°48.',
  },
  // ── VI. Vigilancia ────────────────────────────────────────────────────────
  {
    id: 42, seccion_romana: 'VI', seccion: 'Vigilancia',
    descripcion: 'La entidad empleadora solicita al organismo administrador la incorporación al programa de vigilancia de la salud de las personas trabajadoras expuestas a agentes o factores que puedan causar daño o cuando se diagnostique una enfermedad profesional.',
    cuerpo_legal: 'D.S. N°44, Art. N°67.',
  },
  {
    id: 43, seccion_romana: 'VI', seccion: 'Vigilancia',
    descripcion: 'La entidad empleadora implementa las medidas prescritas por el organismo administrador para el traslado de las personas trabajadoras afectadas por una enfermedad profesional a un puesto donde no estén expuestas al riesgo que dio origen a dicha enfermedad.',
    cuerpo_legal: 'D.S. N°44, Art. N°67.',
  },
  {
    id: 44, seccion_romana: 'VI', seccion: 'Vigilancia',
    descripcion: 'La entidad empleadora evalúa la presencia de agentes de riesgo en los lugares de trabajo que puedan causar una enfermedad profesional (evaluados en la MIPER), incorporando y ejecutando el correspondiente programa de vigilancia ambiental y de la salud de las personas trabajadoras.',
    cuerpo_legal: 'D.S. N°44, Art. N°67.',
  },
  {
    id: 45, seccion_romana: 'VI', seccion: 'Vigilancia',
    descripcion: 'La entidad empleadora implementa las medidas de seguridad y salud en el trabajo que le ordenen los organismos fiscalizadores y/o las que prescriba el organismo administrador y/o aquellas indicadas por el Departamento de Prevención de Riesgos o el Comité Paritario.',
    cuerpo_legal: 'D.S. N°44, Art. N°70.',
  },
  // ── VII. Registro ─────────────────────────────────────────────────────────
  {
    id: 46, seccion_romana: 'VII', seccion: 'Registro',
    descripcion: 'La entidad empleadora lleva el registro de forma documental y fidedigna de toda la información vinculada a la gestión de los riesgos laborales y estadísticas SST: tasa anual de accidentabilidad por accidentes del trabajo y todos los accidentes del trabajo, de trayecto y enfermedades profesionales.',
    cuerpo_legal: 'D.S. N°44, Art. N°72 y 75.',
  },
]
