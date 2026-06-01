// ─── RIOHS · Reglamento Interno de Orden, Higiene y Seguridad ─────────────────
// Plantilla basada en DS 44 / Ley 16.744 / Código del Trabajo
// Placeholders: {{EMPRESA}} {{RUT}} {{MUTUAL}} {{CIUDAD}} {{DIRECCION}}
//               {{GERENTE}} {{REPRESENTANTE}} {{PREVENCIONISTA}} {{FECHA}} {{ANO}}

export interface Articulo {
  numero: string
  texto:  string
}

export interface Capitulo {
  id:        string
  titulo:    string
  parrafo?:  string
  articulos: Articulo[]
}

export interface SeccionRiohs {
  id:        string
  titulo:    string
  capitulos: Capitulo[]
}

export const SECCIONES_RIOHS: SeccionRiohs[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // TÍTULO 1 — REGLAMENTO INTERNO DE ORDEN
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'T1',
    titulo: 'TÍTULO 1 — REGLAMENTO INTERNO DE ORDEN',
    capitulos: [
      {
        id: 'T1C1', titulo: 'Capítulo I — Normas Generales',
        articulos: [
          { numero: 'ARTÍCULO 1°',
            texto: 'El presente Reglamento Interno regula los requisitos y las condiciones de ingreso, derechos, obligaciones, prohibiciones, normas, instrucciones y, en general, las modalidades y condiciones de trabajo de todas las personas trabajadoras dependientes de {{EMPRESA}}, con domicilio en {{DIRECCION}}, {{CIUDAD}}.' },
          { numero: 'ARTÍCULO 2°',
            texto: 'El presente reglamento se entregará formalmente en una charla de inducción al personal contratado, una vez iniciadas sus funciones en el cargo, dejando el registro correspondiente.' },
          { numero: 'ARTÍCULO 3°',
            texto: 'El presente reglamento será de conocimiento obligatorio y de estricto cumplimiento. Cada persona trabajadora tendrá la obligación de dar cabal, fiel y estricto cumplimiento a las disposiciones contenidas en este instrumento.' },
          { numero: 'ARTÍCULO 4°',
            texto: 'La potestad de dirección y disciplina del empleador contenidas en el presente reglamento, y en general el ejercicio de las facultades que la ley le reconoce al empleador, tiene como límite el respeto a las garantías constitucionales de las personas trabajadoras, en especial cuando pudieran afectar la intimidad, la vida privada o la honra de éstas.' },
        ],
      },
      {
        id: 'T1C2', titulo: 'Capítulo II — Terminología y Definiciones',
        articulos: [
          { numero: 'ARTÍCULO 5°',
            texto: 'Para los efectos del presente Reglamento Interno se entenderá por:\n\n**Accidente del Trabajo:** Toda lesión que una persona sufra a causa o con ocasión del trabajo, y que le produzca incapacidad o muerte (Art. 5° Ley 16.744).\n\n**Accidente de Trayecto:** Aquellos sufridos por el trabajador en el trayecto directo de ida o regreso entre la habitación y el lugar de trabajo.\n\n**Acoso laboral:** Toda conducta que constituya agresión u hostigamiento ejercida por el empleador o por uno o más trabajadores, en contra de otro u otros trabajadores, por cualquier medio, que tenga como resultado para el o los afectados su menoscabo, maltrato o humillación.\n\n**Acoso sexual:** Aquella conducta en que una persona realiza, en forma indebida, por cualquier medio, requerimientos de carácter sexual, no consentidos por quien los recibe y que amenacen o perjudiquen su situación laboral o sus oportunidades en el empleo.\n\n**Comité Paritario de Higiene y Seguridad (CPHS):** Organismo bipartito cuya constitución y funcionamiento se rige por el DS N°54 y el DS N°44.\n\n**Departamento de Prevención de Riesgos:** Órgano de la entidad empleadora encargado de planificar, organizar, asesorar, implementar, supervisar y tomar acciones para la mejora continua del desempeño de la gestión en SST.\n\n**Enfermedad Profesional:** Aquella causada de manera directa por el ejercicio de la profesión o el trabajo que realice una persona y que le produzca incapacidad o muerte (Art. 7° Ley 16.744).\n\n**Entidad Empleadora:** {{EMPRESA}}, RUT {{RUT}}.\n\n**Elemento de Protección Personal (EPP):** Todo equipo, aparato o dispositivo especialmente proyectado y fabricado para preservar el cuerpo humano de riesgos específicos de accidentes del trabajo o enfermedades profesionales.\n\n**Organismo Administrador del Seguro:** {{MUTUAL}}, responsable de administrar el seguro contra riesgos de accidentes del trabajo y enfermedades profesionales.\n\n**Riesgo grave e inminente:** Aquel que, manifestado a través de circunstancias objetivas, ofrece posibilidades ciertas de originar un siniestro laboral en un futuro inmediato.\n\n**Violencia en el trabajo:** Conductas que afecten a las trabajadoras y trabajadores ejercidas por terceros ajenos a la relación laboral.' },
        ],
      },
      {
        id: 'T1C3', titulo: 'Capítulo III — De las Condiciones de Ingreso',
        articulos: [
          { numero: 'ARTÍCULO 6°',
            texto: 'Las personas trabajadoras interesadas en ingresar a {{EMPRESA}} deberán entregar al área de Recursos Humanos todos los antecedentes que ésta requiera, incluyendo: fotocopia de Cédula de Identidad, Currículo Vitae, Certificado de Antecedentes, certificados de estudios y todos los demás que el cargo requiera.' },
          { numero: 'ARTÍCULO 7°',
            texto: 'Sin perjuicio de las exigencias específicas del cargo, constituye requisito para ingresar a la entidad empleadora someterse a una evaluación médica preocupacional, la que será efectuada previa autorización escrita del postulante.' },
          { numero: 'ARTÍCULO 8°',
            texto: 'De acuerdo con el puesto de trabajo, la persona trabajadora deberá cumplir con las medidas preventivas determinadas en la Matriz de Identificación de Peligros y Evaluación de Riesgos (MIPER) vigente en {{EMPRESA}}.' },
        ],
      },
      {
        id: 'T1C4', titulo: 'Capítulo IV — Del Contrato de Trabajo',
        articulos: [
          { numero: 'ARTÍCULO 9°',
            texto: 'Si el postulante cumpliera con los requisitos dispuestos por {{EMPRESA}} y esta decidiere contratarlo, se escriturará y suscribirá el respectivo Contrato de Trabajo en conformidad con las disposiciones del Código del Trabajo.' },
          { numero: 'ARTÍCULO 10°',
            texto: 'El Contrato de Trabajo contendrá, a lo menos, las estipulaciones del Art. 10 del Código del Trabajo: lugar y fecha, identificación de las partes, naturaleza de los servicios, remuneración, jornada, duración del contrato y demás pactos acordados.' },
          { numero: 'ARTÍCULO 11°',
            texto: 'Si los antecedentes del trabajador cambiaren (estado civil, domicilio, profesión u otros), éste deberá comunicarlo por escrito dentro de los 7 días siguientes a su modificación.' },
          { numero: 'ARTÍCULO 12°',
            texto: 'El ochenta y cinco por ciento (85%), a lo menos, del personal contratado deberá ser de nacionalidad chilena, en conformidad con el Art. 19 del Código del Trabajo.' },
        ],
      },
      {
        id: 'T1C5', titulo: 'Capítulo V — Terminación del Contrato de Trabajo',
        articulos: [
          { numero: 'ARTÍCULO 15°',
            texto: 'La Entidad Empleadora o el trabajador podrán poner término al Contrato de Trabajo de acuerdo con las causales establecidas en los artículos 159, 160 y 161 del Código del Trabajo.' },
          { numero: 'ARTÍCULO 16°',
            texto: 'El Contrato de Trabajo terminará sin derecho a indemnización cuando la entidad empleadora invoque alguna de las causales del Art. 160 del Código del Trabajo, entre ellas: falta de probidad, acoso sexual o laboral, abandono del trabajo, incumplimiento grave del contrato, entre otras.' },
          { numero: 'ARTÍCULO 19°',
            texto: 'En el caso de personas trabajadoras sujetas a fuero laboral, {{EMPRESA}} no podrá poner término al contrato sino con autorización previa del juez competente.' },
        ],
      },
      {
        id: 'T1C6', titulo: 'Capítulo VI — De las Jornadas de Trabajo',
        parrafo: 'Párrafo 1 — Normas Generales',
        articulos: [
          { numero: 'ARTÍCULO 20°',
            texto: 'Jornada de Trabajo es el tiempo durante el cual el trabajador debe prestar efectivamente sus servicios al empleador en conformidad al contrato, de acuerdo con los límites del Art. 21 del Código del Trabajo.' },
          { numero: 'ARTÍCULO 21°',
            texto: 'La duración y distribución de la Jornada de Trabajo será la establecida en los respectivos contratos individuales, no pudiendo excederse de los límites legales ni alterarse, sino en los casos y con las formalidades que el Código del Trabajo y este Reglamento establecen.' },
          { numero: 'ARTÍCULO 25°',
            texto: 'La jornada ordinaria de trabajo no podrá exceder de cuarenta horas semanales, en conformidad con la Ley N° 21.561 (gradualidad). {{EMPRESA}} determinará la distribución de la jornada en los contratos individuales y colectivos.' },
          { numero: 'ARTÍCULO 32°',
            texto: 'Las horas extraordinarias son aquellas trabajadas sobre la jornada ordinaria, pactadas por escrito. Sólo podrán pactarse para atender necesidades o situaciones temporales. Las horas extraordinarias se pagarán con un recargo del cincuenta por ciento (50%) sobre el sueldo convenido para la jornada ordinaria.' },
        ],
      },
      {
        id: 'T1C7', titulo: 'Capítulo VII — De las Remuneraciones',
        articulos: [
          { numero: 'ARTÍCULO 39°',
            texto: 'Se entiende por remuneración las contraprestaciones en dinero y las adicionales en especie avaluables en dinero que deba percibir el trabajador del empleador por causa del contrato de trabajo. No constituyen remuneración las asignaciones de movilización, de pérdida de caja, de desgaste de herramientas y de colación, entre otras señaladas en el Art. 41 del Código del Trabajo.' },
          { numero: 'ARTÍCULO 41°',
            texto: '{{EMPRESA}} pagará las remuneraciones en la oportunidad y forma establecidas en los respectivos contratos de trabajo, con una periodicidad no superior a un mes. El pago se efectuará en días hábiles, durante la jornada de trabajo y en el lugar de prestación de los servicios.' },
        ],
      },
      {
        id: 'T1C8', titulo: 'Capítulo VIII — Del Feriado Anual',
        articulos: [
          { numero: 'ARTÍCULO 46°',
            texto: 'Las personas trabajadoras con más de un año de servicio tendrán derecho a un feriado anual de quince días hábiles, con remuneración íntegra. El trabajador con diez o más años de trabajo (continuos o no) para uno o más empleadores tendrá derecho a un día adicional por cada tres nuevos años trabajados.' },
          { numero: 'ARTÍCULO 49°',
            texto: 'La época en que el feriado deberá concederse será convenida de común acuerdo entre {{EMPRESA}} y el trabajador. A falta de acuerdo, {{EMPRESA}} tendrá derecho a determinar su época, debiendo dar aviso con treinta días de anticipación.' },
        ],
      },
      {
        id: 'T1C9', titulo: 'Capítulo IX — De las Licencias, Maternidad y Permisos',
        parrafo: 'Párrafo 1 — De las Licencias',
        articulos: [
          { numero: 'ARTÍCULO 50°',
            texto: 'En caso de enfermedad, la persona trabajadora deberá comunicar su situación a su jefatura directa tan pronto como sea posible. La licencia médica deberá ser tramitada ante la entidad de salud previsional (ISAPRE o FONASA) dentro del plazo legal, y remitir el comprobante a {{EMPRESA}}.' },
          { numero: 'ARTÍCULO 52°',
            texto: 'La trabajadora embarazada tiene derecho a un descanso de maternidad de seis semanas antes del parto y doce semanas después de él (Art. 195 Código del Trabajo). Este período se extiende al padre en los casos que señala la ley.' },
          { numero: 'ARTÍCULO 55°',
            texto: '{{EMPRESA}} concederá los permisos señalados en el Art. 66 del Código del Trabajo: muerte de hijo o cónyuge (5 días hábiles), nacimiento de hijo (5 días hábiles), matrimonio (5 días hábiles), entre otros establecidos por ley o convenio colectivo.' },
        ],
      },
      {
        id: 'T1C11', titulo: 'Capítulo XI — De las Sugerencias, Consultas y Reclamos',
        articulos: [
          { numero: 'ARTÍCULO 62°',
            texto: '{{EMPRESA}} reconoce el derecho de las personas trabajadoras a formular sugerencias, consultas y reclamos. Estos deberán efectuarse de manera respetuosa y siguiendo los conductos regulares establecidos por la organización.' },
          { numero: 'ARTÍCULO 63°',
            texto: 'Todo reclamo o consulta deberá formularse, preferentemente por escrito, ante el jefe directo o ante Recursos Humanos. {{EMPRESA}} dará respuesta en un plazo razonable, en conformidad con sus procedimientos internos.' },
        ],
      },
      {
        id: 'T1C12', titulo: 'Capítulo XII — Las Obligaciones de la Entidad Empleadora',
        articulos: [
          { numero: 'ARTÍCULO 71°',
            texto: '{{EMPRESA}}, con la finalidad de proteger la persona y dignidad de cada una de las personas trabajadoras, se obliga a:\n\n1. Pagar las remuneraciones en conformidad con las estipulaciones legales y contractuales.\n2. Adoptar las medidas necesarias para la protección eficaz de la vida y salud de las personas trabajadoras.\n3. Dar a las personas trabajadoras ocupación efectiva en las labores convenidas.\n4. Colaborar al perfeccionamiento profesional de sus trabajadores.\n5. Cumplir las normas contractuales y legales, respetando los derechos fundamentales de las personas trabajadoras.\n6. Respetar el principio de igualdad de remuneraciones entre hombres y mujeres que desempeñen un mismo trabajo.\n7. Mantener reserva de toda la información y datos privados del trabajador a que tenga acceso.\n8. No discriminar por motivos de raza, color, sexo, edad, estado civil, sindicación, religión, opinión política, nacionalidad u orientación sexual.\n9. Investigar las denuncias y reclamos formulados por las personas trabajadoras de acuerdo con los procedimientos internos.\n10. Garantizar un ambiente laboral digno y de mutuo respeto entre las personas trabajadoras.' },
        ],
      },
      {
        id: 'T1C13', titulo: 'Capítulo XIII — Las Obligaciones de las Personas Trabajadoras',
        articulos: [
          { numero: 'ARTÍCULO 73°',
            texto: 'Son obligaciones de las personas trabajadoras de {{EMPRESA}}, además de las que emanan de las leyes y sus reglamentos:\n\n1. Cumplir el Contrato de Trabajo de buena fe.\n2. Comenzar y terminar el trabajo puntualmente.\n3. Concurrir al trabajo en condiciones físicas y mentales adecuadas.\n4. Respetar a la Entidad Empleadora y a sus representantes.\n5. Observar buen comportamiento, orden y disciplina.\n6. Guardar absoluta reserva sobre los asuntos internos de la Entidad Empleadora.\n7. Cumplir las instrucciones impartidas por los niveles superiores.\n8. Informar al jefe directo de cualquier deficiencia o anormalidad que observe en el desempeño de sus funciones.\n9. Cumplir estrictamente las normas de prevención y seguridad impartidas por {{EMPRESA}}.\n10. Dar aviso oportuno a su superior directo de las ausencias al trabajo.\n11. Asistir y aprobar los cursos de capacitación dispuestos por {{EMPRESA}}.\n12. Participar en las actividades preventivas de la entidad empleadora.\n13. Someterse a los exámenes médicos establecidos en los programas de vigilancia de la salud.\n14. Observar en todo momento una conducta correcta y honorable.' },
        ],
      },
      {
        id: 'T1C14', titulo: 'Capítulo XIV — Las Prohibiciones que Afectan a las Personas Trabajadoras',
        articulos: [
          { numero: 'ARTÍCULO 74°',
            texto: 'Queda absolutamente prohibido a las personas trabajadoras de {{EMPRESA}}:\n\n1. Faltar injustificadamente al trabajo o abandonarlo sin el permiso correspondiente.\n2. Presentarse al trabajo bajo los efectos del alcohol o drogas, introducirlas en los lugares de trabajo o consumirlas en estos.\n3. Usar los bienes de {{EMPRESA}} en beneficio personal o ajeno a la institución.\n4. Portar armas de cualquier tipo en los recintos de la entidad empleadora, salvo personal autorizado.\n5. Realizar o propiciar actos de acoso sexual o laboral.\n6. Divulgar información confidencial de {{EMPRESA}} o de sus clientes.\n7. Usar en beneficio propio los medios informáticos y de comunicación de {{EMPRESA}} para fines ajenos a la institución.\n8. Marcar o registrar la asistencia de otro trabajador, o permitir que otro lo haga en su nombre.\n9. Efectuar negociaciones dentro del giro del negocio de {{EMPRESA}} que hubieran sido prohibidas por contrato.\n10. Realizar trabajos particulares dentro del horario de trabajo y con materiales de la entidad empleadora.' },
        ],
      },
      {
        id: 'T1C15', titulo: 'Capítulo XV — De la Regulación de Actividades Relacionadas con el Tabaco',
        articulos: [
          { numero: 'ARTÍCULO 75°',
            texto: 'En conformidad con la Ley N° 19.419 y sus modificaciones, {{EMPRESA}} declara todos sus espacios de trabajo como ambientes libres de humo de tabaco. Queda prohibido fumar en todas las dependencias e instalaciones de la empresa, incluyendo oficinas, bodegas, patios, vehículos institucionales y zonas de trabajo en general. Se habilitarán, en la medida de lo posible, áreas específicas al aire libre para fumadores, debidamente señalizadas.' },
        ],
      },
      {
        id: 'T1C16', titulo: 'Capítulo XVI — De las Sanciones y del Procedimiento de Reclamación',
        articulos: [
          { numero: 'ARTÍCULO 76°',
            texto: 'Las infracciones a las disposiciones del presente Reglamento Interno que no constituyen causal de término de contrato serán sancionadas con:\na) Amonestación verbal.\nb) Amonestación escrita.\nc) Multa de hasta el 25% de la remuneración diaria del infractor.\n\nLa aplicación de sanciones se hará considerando la gravedad de la infracción, si se trata de una primera falta o reincidencia, y los antecedentes del trabajador.' },
          { numero: 'ARTÍCULO 79°',
            texto: 'Las personas trabajadoras afectadas por la aplicación de multas podrán reclamar de su aplicación ante la Inspección del Trabajo respectiva dentro del plazo de 30 días hábiles.' },
        ],
      },
      {
        id: 'T1C17', titulo: 'Capítulo XVII — Normas de Seguridad en General',
        articulos: [
          { numero: 'ARTÍCULO 80°',
            texto: 'En concordancia con las disposiciones legales vigentes, especialmente el DS N°44 y la Ley N°16.744, {{EMPRESA}} establece las siguientes normas de seguridad de carácter general:\n\na) Todo trabajador está obligado a cumplir las normas de seguridad e higiene establecidas.\nb) El uso de los Elementos de Protección Personal (EPP) indicados para cada puesto de trabajo es obligatorio.\nc) Toda persona que observe un riesgo o condición insegura deberá reportarlo de inmediato a su supervisor.\nd) Los equipos y maquinarias deberán operarse solo por personal autorizado y capacitado.\ne) Está prohibido efectuar reparaciones o trabajos en equipos energizados sin las debidas autorizaciones.' },
        ],
      },
      {
        id: 'T1C18', titulo: 'Capítulo XVIII — De las Organizaciones Sindicales',
        articulos: [
          { numero: 'ARTÍCULO 81°',
            texto: '{{EMPRESA}} reconoce y respeta el derecho de sus trabajadores a organizarse sindicalmente en conformidad con el Código del Trabajo y la legislación vigente.' },
          { numero: 'ARTÍCULO 84°',
            texto: '{{EMPRESA}} otorgará las facilidades necesarias para que los representantes sindicales cumplan sus funciones, en los términos establecidos por la ley.' },
        ],
      },
      {
        id: 'T1C19', titulo: 'Capítulo XIX — La Discriminación',
        articulos: [
          { numero: 'ARTÍCULO 85°',
            texto: '{{EMPRESA}} prohíbe expresamente cualquier forma de discriminación arbitraria en razón de raza, color, sexo, maternidad o paternidad, amamantamiento, edad, estado civil, sindicación, religión, opinión política, nacionalidad, ascendencia nacional, situación socioeconómica, idioma, orientación sexual, identidad de género, filiación, apariencia personal, enfermedad o discapacidad.' },
        ],
      },
      {
        id: 'T1C20', titulo: 'Capítulo XX — Prevención, Investigación y Sanción del Acoso (Ley Karin N° 21.643)',
        articulos: [
          { numero: 'ARTÍCULO 93°',
            texto: '{{EMPRESA}} establece procedimientos para la prevención, investigación y sanción del acoso laboral, sexual y violencia en el trabajo, en cumplimiento de la Ley N° 21.643 (Ley Karin), que modifica el Código del Trabajo y la Ley N° 16.744.' },
          { numero: 'ARTÍCULO 94°',
            texto: '{{EMPRESA}} declara formalmente que no tolerará ninguna conducta constitutiva de acoso laboral, acoso sexual o violencia en el trabajo, sea cual sea la jerarquía, cargo o condición de quien la ejerza. Las relaciones laborales se fundarán en un trato libre de violencia y compatible con la dignidad de la persona.' },
          { numero: 'ARTÍCULO 95°',
            texto: 'Toda denuncia deberá realizarse dentro del plazo de un año desde la ocurrencia del hecho constitutivo de acoso o violencia. Los canales de denuncia disponibles en {{EMPRESA}} son:\n- Canal interno: Área de Recursos Humanos / Gerencia General.\n- Canal externo: Dirección del Trabajo (www.dt.gob.cl).\n- Canal SUSESO.' },
          { numero: 'ARTÍCULO 100°',
            texto: '{{EMPRESA}} adoptará medidas de resguardo transitorias para proteger la integridad del denunciante y víctima durante el proceso de investigación, dentro de los 3 días hábiles siguientes a la recepción de la denuncia.' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // TÍTULO 2 — REGLAMENTO INTERNO DE HIGIENE Y SEGURIDAD
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'T2',
    titulo: 'TÍTULO 2 — REGLAMENTO INTERNO DE HIGIENE Y SEGURIDAD',
    capitulos: [
      {
        id: 'T2C1', titulo: 'Capítulo I — Disposiciones Generales',
        articulos: [
          { numero: 'ARTÍCULO 101°',
            texto: 'El presente Título del Reglamento Interno de Higiene y Seguridad tiene por objetivo establecer las normas de higiene, seguridad y salud en el trabajo que deben cumplir todas las personas que presten servicios en {{EMPRESA}}, en conformidad con la Ley N°16.744 y el DS N°44 del Ministerio del Trabajo.' },
          { numero: 'ARTÍCULO 102°',
            texto: '{{EMPRESA}} afilia a sus trabajadores en {{MUTUAL}} para los efectos del seguro obligatorio contra riesgos de accidentes del trabajo y enfermedades profesionales, conforme a la Ley N°16.744. Las prestaciones médicas, económicas y de rehabilitación derivadas de accidentes del trabajo o enfermedades profesionales serán otorgadas por {{MUTUAL}}.' },
          { numero: 'ARTÍCULO 103°',
            texto: 'Ante un riesgo grave e inminente, {{EMPRESA}} informará inmediatamente a todas las personas trabajadoras afectadas y adoptará medidas para la suspensión inmediata de las faenas afectadas y su evacuación, en caso de que el riesgo no pueda ser eliminado o atenuado.' },
        ],
      },
      {
        id: 'T2C2', titulo: 'Capítulo II — De las Obligaciones',
        parrafo: 'Párrafo 1 — De la Información de los Riesgos Laborales',
        articulos: [
          { numero: 'ARTÍCULO 109°',
            texto: '{{EMPRESA}} informará a cada trabajador sobre los riesgos que entrañan sus labores, las medidas preventivas y los métodos de trabajo correctos. Esta información se entregará en forma oportuna, previa al inicio de las labores y cada vez que existan cambios en los procesos o tecnologías utilizadas.' },
          { numero: 'ARTÍCULO 115°',
            texto: '{{EMPRESA}} constituirá el Comité Paritario de Higiene y Seguridad (CPHS) cuando tenga 25 o más personas trabajadoras, en conformidad con el Art. 23 de la Ley N°16.744 y el DS N°54. El CPHS tendrá por funciones asesorar, vigilar, investigar accidentes y promover la prevención de riesgos.' },
          { numero: 'ARTÍCULO 126°',
            texto: '{{EMPRESA}} proporcionará a las personas trabajadoras, libres de costo, los Elementos de Protección Personal (EPP) adecuados al riesgo a cubrir, en conformidad con el Art. 13 del DS N°44. Los EPP deberán cumplir con las normas vigentes de certificación de calidad o estar registrados en el ISP.' },
          { numero: 'ARTÍCULO 136°',
            texto: '{{EMPRESA}} investigará con enfoque de género las causas de los accidentes del trabajo y enfermedades profesionales que afecten a las personas trabajadoras, utilizando la metodología indicada por {{MUTUAL}}. Todo accidente del trabajo deberá ser denunciado a {{MUTUAL}} dentro de las 24 horas de ocurrido.' },
          { numero: 'ARTÍCULO 142°',
            texto: '{{EMPRESA}} efectuará capacitación en prevención de riesgos laborales a las personas trabajadoras, con una periodicidad no superior a dos años, con una duración mínima de 8 horas y con enfoque de género, abordando los factores de riesgo del puesto de trabajo, efectos en la salud y medidas preventivas.' },
          { numero: 'ARTÍCULO 163°',
            texto: '{{EMPRESA}} contará con uno o más planes de gestión, reducción y respuesta frente a emergencias, catástrofes o desastres, realizando pruebas de ensayo al menos una vez al año.' },
          { numero: 'ARTÍCULO 174°',
            texto: '{{EMPRESA}} dará cumplimiento a todos los protocolos del Ministerio de Salud (MINSAL) aplicables a su actividad, incluyendo los protocolos de exposición a ruido, agentes químicos, factores de riesgo ergonómico, factores psicosociales y otros que correspondan.' },
          { numero: 'ARTÍCULO 189°',
            texto: 'Cuando en los lugares de trabajo de {{EMPRESA}} presten servicios trabajadores de entidades empleadoras contratistas, existirá coordinación, cooperación e información mutua para la adecuada aplicación de las medidas de seguridad y salud, en conformidad con el Art. 20 del DS N°44.' },
        ],
      },
      {
        id: 'T2C3', titulo: 'Capítulo III — De las Prohibiciones',
        parrafo: 'Párrafo 1 — De las Prohibiciones en General',
        articulos: [
          { numero: 'ARTÍCULO 191°',
            texto: 'Queda estrictamente prohibido a toda persona en los lugares de trabajo de {{EMPRESA}}:\n\n1. Ingresar al trabajo en estado de ebriedad o bajo los efectos del alcohol, drogas o sustancias estupefacientes.\n2. Fumar en las dependencias interiores y zonas de trabajo.\n3. Ingresar a zonas restringidas sin la autorización correspondiente.\n4. Operar equipos o maquinarias sin la debida autorización y capacitación.\n5. Efectuar reparaciones en equipos energizados o en movimiento sin las medidas de bloqueo correspondientes.\n6. Remover, dañar o inutilizar dispositivos de seguridad, equipos de protección colectiva o señalética.\n7. Usar los EPP de manera incorrecta o no utilizarlos cuando la situación lo requiera.\n8. Correr dentro de los recintos de trabajo o realizar bromas que puedan provocar accidentes.\n9. Alterar o manipular los registros de accidentes, enfermedades o datos de seguridad.\n10. No reportar un accidente, incidente o condición de riesgo conocida.' },
          { numero: 'ARTÍCULO 192°',
            texto: 'En conformidad con la Ley N°20.949, el peso máximo de carga humana que un trabajador puede mover manualmente en {{EMPRESA}} será de 25 kg. Para mujeres embarazadas y menores de 18 años, el límite máximo será de 20 kg. Cuando la manipulación supere estos límites, se dispondrán medios mecánicos apropiados.' },
        ],
      },
      {
        id: 'T2C4', titulo: 'Capítulo IV — Las Sanciones y Reclamos',
        articulos: [
          { numero: 'ARTÍCULO 193°',
            texto: 'Las infracciones a las normas de higiene y seguridad establecidas en este Título serán sancionadas en conformidad con el Capítulo XVI del Título 1 del presente Reglamento, sin perjuicio de la responsabilidad civil o penal que pudiere corresponder.' },
          { numero: 'ARTÍCULO 197°',
            texto: 'Toda persona que estime que una sanción es injusta podrá recurrir ante la Inspección del Trabajo dentro del plazo legal, o ante el jefe superior de la entidad, en conformidad con los procedimientos internos de {{EMPRESA}}.' },
        ],
      },
      {
        id: 'T2C5', titulo: 'Capítulo V — Procedimientos, Recursos y Reclamos (Ley N°16.744)',
        articulos: [
          { numero: 'ARTÍCULO 198°',
            texto: 'En conformidad con los Arts. 76 y 77 de la Ley N°16.744, los trabajadores de {{EMPRESA}} tienen derecho a apelar ante {{MUTUAL}} y, en segunda instancia, ante la Superintendencia de Seguridad Social (SUSESO), respecto de las prestaciones otorgadas o negadas.' },
        ],
      },
      {
        id: 'T2C6', titulo: 'Capítulo VI — De Accidentes del Trabajo y Enfermedades Profesionales',
        articulos: [
          { numero: 'ARTÍCULO 205°',
            texto: 'En caso de accidente del trabajo, {{EMPRESA}} deberá:\n1. Prestar los primeros auxilios al accidentado.\n2. Denunciar el accidente a {{MUTUAL}} dentro de las 24 horas.\n3. Investigar las causas del accidente en el plazo establecido.\n4. Implementar medidas correctivas para evitar su repetición.' },
          { numero: 'ARTÍCULO 209°',
            texto: 'En caso de diagnóstico de enfermedad profesional, {{EMPRESA}} coordinará con {{MUTUAL}} la atención del trabajador, el traslado de puesto de trabajo si corresponde y la implementación de medidas correctivas en el ambiente laboral.' },
        ],
      },
      {
        id: 'T2C7', titulo: 'Capítulo VII — Típicos y Medidas Preventivas',
        articulos: [
          { numero: 'ARTÍCULO 212°',
            texto: '{{EMPRESA}} mantendrá en sus instalaciones la información sobre los principales riesgos existentes en los lugares de trabajo y las medidas preventivas asociadas, en conformidad con el Art. 62 del DS N°44 (Mapas de Riesgos).' },
          { numero: 'ARTÍCULO 216°',
            texto: 'El presente Reglamento Interno de Orden, Higiene y Seguridad entrará en vigencia a contar de {{FECHA}}, siendo de conocimiento y acatamiento obligatorio para todas las personas que presten servicios en {{EMPRESA}}.' },
          { numero: 'ARTÍCULO 217°',
            texto: 'El presente Reglamento será revisado con una periodicidad no inferior a un año, con la participación del Departamento de Prevención de Riesgos, del Comité Paritario o Delegado de SST si existieren, y de las organizaciones sindicales.' },
          { numero: 'ARTÍCULO 218°',
            texto: 'El Reglamento Interno deberá ser ingresado en la página web de la Dirección del Trabajo, lo que se entenderá como ingreso ante la Secretaría Regional Ministerial de Salud correspondiente. Asimismo, se entregará gratuitamente a cada persona trabajadora al momento de su ingreso.' },
        ],
      },
    ],
  },
]

// ─── Variables configurables ──────────────────────────────────────────────────

export interface RiohsConfig {
  empresa:         string
  rut:             string
  actividad:       string
  direccion:       string
  ciudad:          string
  n_trabajadores:  string
  gerente:         string
  representante:   string
  prevencionista:  string
  mutual:          string
  fecha:           string
  ano:             string
}

export const MUTALES = [
  'Asociación Chilena de Seguridad (ACHS)',
  'Instituto de Seguridad del Trabajo (IST)',
  'Mutual de Seguridad ChCC',
]

export function aplicarPlaceholders(texto: string, cfg: RiohsConfig): string {
  return texto
    .replace(/\{\{EMPRESA\}\}/g,        cfg.empresa        || '[NOMBRE EMPRESA]')
    .replace(/\{\{RUT\}\}/g,            cfg.rut            || '[RUT]')
    .replace(/\{\{MUTUAL\}\}/g,         cfg.mutual         || '[MUTUAL]')
    .replace(/\{\{CIUDAD\}\}/g,         cfg.ciudad         || '[CIUDAD]')
    .replace(/\{\{DIRECCION\}\}/g,      cfg.direccion      || '[DIRECCIÓN]')
    .replace(/\{\{GERENTE\}\}/g,        cfg.gerente        || '[GERENTE GENERAL]')
    .replace(/\{\{REPRESENTANTE\}\}/g,  cfg.representante  || '[REPRESENTANTE LEGAL]')
    .replace(/\{\{PREVENCIONISTA\}\}/g, cfg.prevencionista || '[PREVENCIONISTA]')
    .replace(/\{\{FECHA\}\}/g,          cfg.fecha          || '[FECHA]')
    .replace(/\{\{ANO\}\}/g,            cfg.ano            || '[AÑO]')
}
