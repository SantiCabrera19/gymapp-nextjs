-- Poblar músculos básicos (usando valores permitidos por constraints)
INSERT INTO muscles (name, name_short, muscle_group, anatomical_region, is_major) VALUES
('Pectoral Mayor', 'Pecho', 'chest', 'upper_body', true),
('Latissimus Dorsi', 'Dorsales', 'back', 'upper_body', true),
('Cuádriceps', 'Cuádriceps', 'legs', 'lower_body', true),
('Isquiotibiales', 'Isquios', 'legs', 'lower_body', true),
('Glúteos', 'Glúteos', 'legs', 'lower_body', true),
('Deltoides', 'Hombros', 'shoulders', 'upper_body', true),
('Bíceps', 'Bíceps', 'arms', 'upper_body', true),
('Tríceps', 'Tríceps', 'arms', 'upper_body', true),
('Abdominales', 'Abs', 'core', 'core', true),
('Romboides', 'Romboides', 'back', 'upper_body', false);

-- Ejercicios (sin especificar ID, se generarán automáticamente)
INSERT INTO exercises (name, description, instructions, tips, muscle_group_primary, difficulty_level, equipment, is_approved, is_custom) VALUES
('Press de Banca Plano', 'Ejercicio fundamental para desarrollar el pecho, hombros y tríceps', 
'1. Acuéstate en el banco con los pies firmes en el suelo
2. Agarra la barra con las manos separadas a la anchura de los hombros
3. Baja la barra controladamente hasta el pecho
4. Empuja la barra hacia arriba hasta extender completamente los brazos', 
'Mantén los omóplatos retraídos durante todo el movimiento. Controla la fase excéntrica lentamente.', 
'chest', 'intermediate', 'barbell', true, false),

('Press de Banca Inclinado', 'Variante que enfatiza la parte superior del pecho', 
'1. Ajusta el banco a 30-45 grados de inclinación
2. Posiciónate como en el press plano
3. Baja la barra hacia la parte superior del pecho
4. Empuja hacia arriba siguiendo el ángulo del banco', 
'El ángulo óptimo es entre 30-45 grados. Más inclinación trabaja más los hombros.', 
'chest', 'intermediate', 'barbell', true, false),

('Flexiones de Pecho', 'Ejercicio básico de peso corporal para pecho y tríceps', 
'1. Colócate en posición de plancha con las manos a la anchura de los hombros
2. Mantén el cuerpo recto desde la cabeza hasta los pies
3. Baja el pecho hasta casi tocar el suelo
4. Empuja hacia arriba hasta la posición inicial', 
'Mantén el core activado. Si es muy difícil, apoya las rodillas en el suelo.', 
'chest', 'beginner', 'bodyweight', true, false),

('Dominadas', 'Ejercicio fundamental para desarrollar la espalda y bíceps', 
'1. Cuelga de la barra con las palmas hacia adelante
2. Mantén los hombros hacia abajo y atrás
3. Tira del cuerpo hacia arriba hasta que la barbilla pase la barra
4. Baja controladamente hasta la posición inicial', 
'Si no puedes hacer dominadas completas, usa una banda elástica o máquina asistida.', 
'back', 'advanced', 'bodyweight', true, false),

('Remo con Barra', 'Ejercicio para desarrollar el grosor de la espalda', 
'1. Inclínate hacia adelante con la barra en las manos
2. Mantén la espalda recta y el core activado
3. Tira de la barra hacia el abdomen
4. Baja controladamente hasta extender los brazos', 
'Mantén los codos cerca del cuerpo. No uses impulso del torso.', 
'back', 'intermediate', 'barbell', true, false),

('Sentadillas', 'El rey de los ejercicios para piernas y glúteos', 
'1. Coloca los pies a la anchura de los hombros
2. Baja como si fueras a sentarte en una silla
3. Mantén el pecho erguido y las rodillas alineadas con los pies
4. Sube empujando a través de los talones', 
'Baja hasta que los muslos estén paralelos al suelo. Mantén el peso en los talones.', 
'legs', 'beginner', 'bodyweight', true, false),

('Peso Muerto', 'Ejercicio compuesto que trabaja toda la cadena posterior', 
'1. Colócate frente a la barra con los pies a la anchura de las caderas
2. Agarra la barra con las manos fuera de las piernas
3. Mantén la espalda recta y levanta la barra extendiendo caderas y rodillas
4. Baja controladamente siguiendo el mismo patrón', 
'Mantén la barra cerca del cuerpo. No redondees la espalda.', 
'legs', 'advanced', 'barbell', true, false);
