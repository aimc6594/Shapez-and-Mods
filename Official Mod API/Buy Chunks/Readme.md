# Buy Chunks

**Autor:** NatNgs
 **Versión:** 1.0.2
 **ID:** buyChunks
 **Web:** [Shapez Mods](https://github.com/NatNgs/shapez-mods)
 **Compatibilidad:** >=1.5.0

**Descripción:**
 Este mod obliga a los jugadores a comprar “chunks” antes de poder construir sobre ellos. Introduce una capa de gestión de terreno que añade desafío estratégico y planificación al juego.

------

## Cómo funciona

1. **Chunks bloqueados:**
   - Cada chunk del mapa puede estar bloqueado hasta que se compre.
   - Los chunks iniciales están desbloqueados automáticamente, mientras que los adyacentes deben comprarse progresivamente.
2. **Visualización y HUD:**
   - Cuando el jugador activa la capa de mapa, los chunks disponibles muestran su precio y el recurso requerido.
   - El HUD `BuyChunksHUD` se encarga de mostrar el estado visual:
     - Verde si se puede comprar
     - Rojo si no se puede
     - Indicador del recurso requerido y cantidad faltante
3. **Compra de chunks:**
   - Al hacer click sobre un chunk disponible y tener los recursos necesarios, se realiza la compra automáticamente.
   - Se actualiza inmediatamente la propiedad del chunk y se recalculan los gráficos de las zonas adyacentes.
4. **Sistema de precios:**
   - El precio de cada chunk depende de su posición y de la complejidad de los shapes que contiene.
   - Esto genera una progresión natural, haciendo que los chunks más lejanos o complejos cuesten más recursos.
5. **Restricción de construcción:**
   - Se reemplaza el método `checkCanPlaceEntity` para impedir construir en tiles de chunks no comprados.
   - Esto asegura que los jugadores solo puedan expandirse a través del sistema de compra de chunks.
6. **Optimización visual:**
   - Los chunks no comprados se dibujan con colores oscuros y sin overlays, reduciendo el impacto visual y mejorando el rendimiento.
   - Los chunks disponibles para compra muestran una ligera superposición gris clara.

------

## Elementos que se pueden aprovechar

El sistema de **Buy Chunks** es un excelente punto de partida para crear mecánicas más avanzadas:

1. **Gestión progresiva del mapa:**
   - Puedes extender la idea de compra de chunks para introducir “niveles de expansión”, zonas con requerimientos especiales o limitaciones temporales.
2. **Sistema de costos dinámicos:**
   - La función `getPriceOfChunk(x, y)` calcula el precio según la posición y la complejidad de los shapes.
   - Esto puede usarse para generar un sistema de economía más desafiante o adaptativo, ajustando los costos según la expansión del jugador.
3. **Restricción de construcción personalizada:**
   - `checkCanPlaceEntity` puede reemplazarse para implementar condiciones especiales, como desbloqueo por objetivos, logros o misiones secundarias.
4. **Integración con recursos y blueprints:**
   - El HUD y la gestión de recursos (`hubGoals`) pueden enlazarse con otros mods o sistemas internos del juego.
   - Esto permite que los chunks desbloqueados se utilicen como puntos estratégicos para desbloquear edificios o blueprints avanzados.
5. **Extensiones visuales:**
   - El método `MapChunkView.drawBackgroundLayer` y `drawOverlayPatches` puede ser extendido para mostrar información adicional (misiones, objetivos secundarios, dificultades).
   - Esto facilita la creación de un “mapa de control” más interactivo.

------

## Ideas de sistemas avanzados

- **Expansión progresiva basada en logros:** desbloquear chunks solo después de cumplir ciertos objetivos.
- **Chunks premium o especiales:** algunas zonas podrían requerir combinaciones raras de recursos o shapes específicos.
- **Desafíos adicionales:** combinar la compra de chunks con eventos aleatorios que afecten costos o disponibilidad.
- **Integración multijugador o con mods:** la información de chunks puede sincronizarse con otros mods para crear sistemas cooperativos o competitivos.

------

**Resumen:**
 Buy Chunks no solo añade un desafío de planificación y economía al juego, sino que también ofrece una **base sólida para construir sistemas de expansión, economía, objetivos secundarios y mecánicas avanzadas**, haciendo que la progresión sea más estratégica y personalizada.