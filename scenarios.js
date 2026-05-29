const SCENARIOS = [
  {
    id: 'greeting',
    title: '👋 Saludar a un conocido',
    desc: 'Practicar el saludo apropiado con alguien que conoces pero no ves frecuentemente.',
    difficulty: 1,
    context: `Simula ser un vecino o compañero que se cruza con el usuario en la calle en Colombia.
Objetivo: practicar el saludo apropiado (¿cuándo dar la mano, cuándo beso, qué decir?).
Da retroalimentación directa sobre tono, expresión y normas de saludo colombianas (beso mejilla derecha entre conocidos, apretón de manos en contextos formales).`,
    quickReplies: ['Hola, ¿cómo estás?', 'Buenos días', '¿Quiubo, qué más?', 'No sé qué decir']
  },
  {
    id: 'store',
    title: '🛒 Pedir ayuda en una tienda',
    desc: 'Cómo pedirle ayuda a un empleado de tienda de barrio o almacén.',
    difficulty: 1,
    context: `Simula ser un empleado de una tienda de barrio colombiana.
Objetivo: practicar cómo llamar la atención del empleado, formular la pregunta y agradecer.
Da retroalimentación sobre si el tono fue apropiado (ni muy informal ni muy formal para el contexto de tienda).`,
    quickReplies: ['Disculpe, ¿me puede ayudar?', 'Perdón, ¿dónde están los...?', 'Buenas, ¿tiene...?', '¿Cuánto vale esto?']
  },
  {
    id: 'workplace',
    title: '💼 Conversar en el trabajo/clase',
    desc: 'Conversación informal con compañeros durante un descanso.',
    difficulty: 2,
    context: `Simula ser un compañero de trabajo o universidad en Colombia durante un descanso.
Objetivo: practicar cómo iniciar conversación, cuánto hablar y cómo escuchar.
Señala si el usuario monopoliza la conversación, cambia el tema abruptamente o ignora señales sociales.`,
    quickReplies: ['¿Cómo te fue el fin de semana?', 'Qué calor hace hoy, ¿no?', '¿Ya almorzaste?', 'No sé de qué hablar']
  },
  {
    id: 'disagreement',
    title: '🤝 Expresar desacuerdo',
    desc: 'Decir que no estás de acuerdo sin generar conflicto.',
    difficulty: 3,
    context: `Simula ser alguien que acaba de dar una opinión con la que el usuario podría no estar de acuerdo en Colombia.
Objetivo: expresar desacuerdo sin atacar a la persona, validar la perspectiva del otro, proponer alternativas.
Da retroalimentación muy específica sobre el tono: ¿sonó agresivo, demasiado pasivo, o apropiado?`,
    quickReplies: ['Entiendo tu punto, pero yo pienso...', 'No estoy de acuerdo porque...', 'Puede que tengas razón, aunque...', 'Me parece que hay otra forma de verlo']
  },
  {
    id: 'phone',
    title: '📞 Llamada telefónica formal',
    desc: 'Practicar una llamada a un banco, clínica o empresa.',
    difficulty: 2,
    context: `Simula ser un operador de servicio al cliente colombiano (banco, clínica, empresa).
Objetivo: practicar cómo abrir la llamada, explicar el motivo de forma concisa y cerrar la llamada.
Señala si el usuario fue demasiado extenso, muy escueto, o si omitió información necesaria.`,
    quickReplies: ['Buenos días, quisiera...', 'Me comunico para...', 'Tengo una pregunta sobre...', '¿Con quién hablo?']
  },
  {
    id: 'group',
    title: '👥 Unirse a una conversación grupal',
    desc: 'Integrarse a un grupo de personas que ya están hablando.',
    difficulty: 3,
    context: `Simula ser parte de un grupo de 3 personas que ya están conversando en Colombia.
Objetivo: encontrar el momento correcto para intervenir, qué decir al unirse, cómo hacer una contribución relevante.
Señala si interrumpió abruptamente, esperó demasiado o si su intervención fue fuera de contexto.`,
    quickReplies: ['¿De qué están hablando?', 'Perdón, ¿puedo unirme?', '(Esperar a que haya pausa)', 'No sé cómo entrar a la conversación']
  },
  {
    id: 'clarification',
    title: '❓ Pedir que te expliquen mejor',
    desc: 'Preguntar cuando algo no quedó claro sin parecer irrespetuoso.',
    difficulty: 1,
    context: `Simula ser un profesor, jefe o compañero que acaba de dar instrucciones confusas en Colombia.
Objetivo: preguntar cómo hacerlo sin parecer irrespetuoso, especificar exactamente qué no entendió.
Da retroalimentación sobre si la pregunta fue lo suficientemente específica o si fue demasiado vaga.`,
    quickReplies: ['Disculpa, ¿puedes repetir la parte de...?', 'No entendí bien cuando dijiste...', '¿Qué quieres decir con...?', 'Entonces, si entendí bien...']
  }
];
