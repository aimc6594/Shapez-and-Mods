# Sandbox — Descripción y funcionamiento

**Nombre:** Sandbox
 **Autor:** tobspr
 **Versión:** 1
 **ID:** sandbox
 **Web:** https://tobspr.io
 **Compatibilidad:** >= 1.5.0

**Funcionalidad principal:**

1. **Coste de blueprints = 0**
   - Se reemplaza `Blueprint.getCost()` para que siempre devuelva `0`.
   - Esto significa que cualquier plano puede colocarse sin gastar recursos.
2. **Todos los edificios y recompensas desbloqueados**
   - Se reemplaza `HubGoals.isRewardUnlocked()` para que siempre devuelva `true`.
   - Esto habilita todos los edificios y mecánicas, incluso los de DLC o mods compatibles.

**Efecto:**

- Prácticamente elimina todas las restricciones de progresión.
- Permite probar cualquier edificio, layout, o mecánica sin preocuparse por recursos o desbloqueos.

------

## Cómo aprovecharlo más allá del “modo cheat”

El mod es simple, pero su potencial se amplía si lo usas como base para crear un **modo Sandbox real** dentro del juego:

1. **Modo creativo independiente**
   - Crear un menú principal donde el jugador elija entre “Partida normal” y “Sandbox”.
   - En Sandbox, no solo desbloqueas todo, sino que los recursos, la progresión y la economía se ignoran.
   - Permite experimentar libremente con layouts complejos, puzzles o construcciones gigantes.
2. **Pruebas de diseño de mods y blueprints**
   - Ideal para testear nuevos edificios, combinaciones de mods o diseños de producción sin tener que jugar toda la progresión.
   - Se puede usar como entorno seguro para depurar o balancear mecánicas nuevas.
3. **Simulaciones de eficiencia**
   - Ejecutar layouts enormes para medir eficiencia o velocidad sin preocuparse por coste o desbloqueos.
   - Permite comparar diferentes configuraciones de fábricas a gran escala.
4. **Mapas experimentales**
   - Crear mapas o escenarios específicos con reglas personalizadas (por ejemplo, mapas temáticos de puzzle, laboratorios de pruebas, o redes logísticas enormes).
   - Puedes añadir un HUD adicional que controle condiciones especiales sin afectar el juego principal.
5. **Tutoriales o enseñanza**
   - Con todas las mecánicas desbloqueadas, se puede preparar un entorno de aprendizaje para jugadores nuevos o para mostrar combinaciones avanzadas de edificios y cables.
6. **Extensiones creativas**
   - Modificar el mod para activar efectos opcionales, como:
     - Reseteo de recursos bajo demanda.
     - Clonar edificios o blueprints instantáneamente.
     - Añadir límites opcionales (por ejemplo, solo ciertos edificios para retos específicos).
   - Esto permite construir un modo Sandbox **estructurado**, no solo libre.

------

## Buenas prácticas para desarrolladores

- **Separar progresión y sandbox:**
   Mantén este modo como una opción independiente para no afectar partidas normales.
- **Agregar UI contextual:**
   Mostrar claramente que se está en Sandbox para evitar confusiones.
- **Registro de acciones:**
   Guardar un historial de colocaciones o experimentos podría permitir volver atrás o analizar diseños.
- **Compatibilidad con otros mods:**
   Debido a que desbloquea todo, puede generar conflictos; se recomienda probar sandbox con diferentes combinaciones de mods para asegurar estabilidad.