#  README

**Nombre:** Configurable Pins
 **Autor:** nightfire
 **Versión:** 0.1.2
 **ID:** configurable-pins
 **Web:** https://github.com/nightfire2/shapez-configurable-pins-mod
 **Compatibilidad:** >= 1.5.0

**Resumen corto**
 Este mod permite rotar los pines (wired pins) de los edificios. Su aporte técnico principal es exponer la rotación por pin, persistir la orientación en el savegame y proporcionar la lógica para detectar rotaciones válidas (evitando colisiones). Es una mejora pequeña pero poderosa para crear máquinas y puzzles basados en orientación de entradas/salidas.

------

## Qué hace (detalle funcional)

- Añade un HUD (`PinConfigurator`) que captura la tecla de rotación y, cuando el cursor está sobre un edificio con pines y se cumplen las condiciones (capa `wires`, no estar en modo de colocación ni en overlay del mapa), intenta rotar los pins que estén en la casilla bajo el cursor.
- Calcula rotaciones válidas tratando hasta 3 pasos de 90° y evitando colisiones con otros pins del mismo edificio.
- Persiste la orientación por pin en el savegame (modifica el schema del componente `WiredPinsComponent`).
- Añade un flag por slot `canRotate` (por defecto true) para permitir/restringir la rotación pin-a-pin.
- Fuerza el recálculo del sistema de cables cuando una rotación se aplica.

------

## Desglose técnico (qué hace cada parte del código)

### METADATA

Contiene la información del mod (website, author, name, id, version, description, minimumGameVersion, doesNotAffectSavegame).
 Importante: `doesNotAffectSavegame: false` indica que este mod **sí** puede afectar partidas guardadas (porque extiende el schema y añade campos persistentes).

### `PinConfigurator` (HUD)

- `initialize()`:
  - Obtiene el `keyMapper` y añade `this.tryRotate` al binding `shapez.KEYMAPPINGS.placement.rotateWhilePlacing`. Así la rotación responde a la misma tecla de rotación que el juego usa en colocación.
  - Guarda referencias a `placementBlueprint` y `placementBuilding` para impedir rotar mientras se colocan entidades.
- `canRotate()`:
  - Comprueba condiciones para permitir rotar: la capa activa debe ser `wires`, no debe estar el overlay de mapa activo y no debe estar en proceso de colocar blueprint o building.
- `getBuildingWithPins(tile)`:
  - Devuelve el edificio en la capa “regular” si tiene `components.WiredPins` con slots y si el meta-building permite renderizar pins en su variante (usa `getRenderPins(variant)`).
- `getTilePins(building, localTile)`:
  - Filtra los slots del componente WiredPins y devuelve los pins que pertenecen a la subcasilla local indicada.
- `getValidPinRotations(pins, tilePins, rotateCC)`:
  - Lógica clave: intenta rotar los `tilePins` en pasos de 90° (prueba i=1..3), calcula la dirección resultante de cada pin y la posición de destino (usando `shapez.Vector.transformDirectionFromMultipleOf90` y `shapez.enumDirectionToVector`). Si alguna rotación provoca colisión entre pins, se descarta; la primera rotación sin colisiones se devuelve como válida. Si no hay rotación válida, devuelve `[]`.
- `tryRotate()`:
  - Si `canRotate()` es true y el cursor está sobre una casilla con un building con pins, obtiene los `tilePins` y el resto de `pins`, evalúa si la rotación debe ser CCW (tecla modificadora), pide las rotaciones válidas y aplica `rotation.pin.direction = rotation.direction` para cada pin rotado.
  - Si se aplicaron rotaciones, marca `this.root.systemMgr.systems.wire.needsRecompute = true` para que el sistema de cables se actualice.

### Extensiones en `Mod.init()`

- `this.modInterface.registerHudElement("pin_configurator", PinConfigurator)` — registra el HUD que maneja la rotación vía input.
- `this.modInterface.extendObject(shapez.WiredPinsComponent, ...)` — modifica el schema: convierte `direction` en un campo nullable (se persiste).
- `this.modInterface.extendClass(shapez.WiredPinsComponent, ...)` — añade `copyAdditionalStateTo` para copiar la dirección entre copias (importante al clonar o serializar componentes).
- `this.modInterface.runAfterMethod(shapez.WiredPinsComponent, "setSlots", ...)` — tras `setSlots` asegura que `slots[i].canRotate` exista y por defecto sea `true`.

------

## Propiedades y métodos útiles que expone el mod (para otros mods)

- `building.components.WiredPins.slots` — array de slots/pines. Cada slot contiene, como mínimo:
  - `pos` `{x,y}` (posición local dentro del edificio),
  - `direction` (string) — orientación actual (ahora persistida),
  - `canRotate` (boolean) — si el pin puede rotar.
- Para forzar una rotación programáticamente:

```js
building.components.WiredPins.slots[index].direction = 'right' // o 'up', 'left', 'down' según convenga
root.systemMgr.systems.wire.needsRecompute = true
```

- Para bloquear un pin:

```js
building.components.WiredPins.slots[index].canRotate = false
```

- Para comprobar si un tile tiene pins y obtenerlos:

```js
const building = root.map.getLayerContentXY(tile.x, tile.y, "regular")
if (building && building.components.WiredPins) {
  const localTile = building.components.StaticMapEntity.worldToLocalTile(tile)
  const pinsHere = building.components.WiredPins.slots.filter(pin => pin.pos.x === localTile.x && pin.pos.y === localTile.y)
}
```

- `shapez.Vector.transformDirectionFromMultipleOf90(direction, angle)` y `shapez.enumDirectionToVector` — funciones útiles para calcular posiciones tras rotar una orientación por múltiplos de 90°.

------

## Ejemplos prácticos de uso / integración

- **Bloquear rotación en definiciones del edificio**
   En la definición del meta-building (slot definitions), poner `canRotate: false` para fijar un pin:

  ```js
  // ejemplo conceptual en la definición de slots
  slots: [
    { pos: {x:0,y:0}, direction: 'up', canRotate: false },
    { pos: {x:1,y:0}, direction: 'right' }
  ]
  ```

- **Rotar por script (tools, poderes o efectos)**
   Un item o evento puede rotar pins de un edificio:

  ```js
  const pins = building.components.WiredPins.slots;
  pins.forEach(p => p.direction = rotateDirection(p.direction, 90)); // rotateDirection = wrapper sobre transformDirectionFromMultipleOf90
  root.systemMgr.systems.wire.needsRecompute = true;
  ```

- **Lectura de orientación para comportamiento de máquina**
   Otros sistemas pueden leer `slot.direction` para decidir a qué lado emitir o recibir recursos, o para condicionar la lógica del edificio según la orientación.

- **Extender el HUD**
   Puedes superponer flechas u otra UI que muestren la orientación actual de cada pin, o un panel de configuración por edificio que permita rotar pines uno a uno.

------

## Ideas novedosas (qué se puede construir con esta base)

> Nota: la innovación real aquí es la rotación por pin; las ideas son extensiones que aprovechan esa capacidad.

1. **Puzzles basados en orientación**
   - Crear objetivos que requieran conectar cables en una forma concreta; el jugador debe rotar pins (y tal vez colocar bloques) para conectar la red correcta.
2. **Entradas/salidas direccionales avanzadas**
   - Máquinas que exporten/importe según la orientación del pin; por ejemplo, una máquina con múltiples salidas que cambien comportamiento si el pin apunta a una dirección permitida.
3. **Rotación como recurso**
   - Hacer que rotar un pin cueste un recurso (consumible o energía), obligando a planificar y no girar indiscriminadamente.
4. **Mecánicas de bloqueo/desbloqueo**
   - Pins bloqueados que se desbloquean con logros, pagos o por construir un módulo; permite progresión por orientación.
5. **Blueprints con orientación preservada**
   - Al guardar blueprints, incluir las orientaciones de pins; los blueprints complejos dependerán de ellas.
6. **Herramienta remota de configuración**
   - Un “configurador” (item/edificio) que pueda rotar pins a distancia; útil para reconfigurar grandes instalaciones sin desarmar.
7. **Rotación dinámica (puzzles temporales)**
   - Eventos que rotan pins aleatoriamente en áreas controladas requiriendo intervención del jugador.
8. **Integración con otras mecánicas**
   - Reglas condicionales donde una red sólo funciona si un conjunto de pins apunta en determinada configuración (puede usarse para “cerraduras” o minijuegos).
9. **Multijugador y sincronización**
   - En modos cooperativos, rotar pins puede ser una acción sincronizada que requiere comunicación entre jugadores.

------

## Limitaciones y riesgos

- **Persistencia:** el mod extiende el schema para persistir `direction`. Por eso `doesNotAffectSavegame` es `false`. Desinstalar el mod puede dejar saves con datos expectantes; recomendar hacer backup antes de quitarlo.
- **Compatibilidad:** si otro mod también modifica la representación o la semántica de pins, pueden existir conflictos. Recomiendo documentar cambios en slots y usar namespacing en nuevas propiedades.
- **Colisiones y edge-cases:** la función que busca rotaciones válidas es conservadora: prueba rotaciones por pasos de 90° y evita colisiones con otros pins del mismo edificio. Aún así pueden existir casos complejos con edificios multi-tile inusuales; probar con combinaciones variadas es aconsejable.
- **Rendimiento:** forzar recomputes frecuentes del sistema de cables (`needsRecompute`) es necesario, pero hacerlo en bucle o masivamente puede repercutir en rendimiento. Aplicar límites o animaciones suaves ayuda.
- **Blueprints / clonados:** el mod copia el estado extra al clonar componentes (`copyAdditionalStateTo`) — buena práctica — pero otras operaciones (migraciones, importaciones de saves antiguos) deben gestionarse con cuidado.

------

## Instalación y uso rápido

1. Coloca el mod en la carpeta de mods de Shapez.
2. Activa el mod desde el menú de mods.
3. En el juego:
   - Cambia a la capa `wires`.
   - Coloca el cursor sobre un edificio que tenga pines visibles.
   - Pulsa la tecla de rotación (la misma que usarías al rotar entidades mientras colocas) para rotar los pins de la casilla bajo el cursor. Mantén la tecla modificadora de rotación inversa si quieres girar en sentido contrario.
4. Si rotas, las conexiones se recalculan automáticamente.

------

## Buenas prácticas para modders que quieran usarlo como base

- **Comprobar `canRotate` antes de forzar cambios** para respetar locks de diseño y evitar romper expectativas del jugador.
- **Persistir datos con defaults**: al añadir nuevos campos (p. ej. `pin.tier`), siempre definir valores por defecto para compatibilidad con saves previos.
- **Documentar slots modificados** en el README del mod que extienda pins (qué `canRotate` default, valores de `direction` permitidos).
- **Probar con múltiples mods** instalados y con escenarios de edge (multi-tile, variantes de building) para evitar colisiones lógicas.
- **Sincronización multiplayer**: propagar cambios de pins vía mecanismos de sincronización del juego si el mod se usa en multiplayer.

------

## Ejemplos de snippets relevantes

- Forzar rotación programática y recomputar:

```js
const pins = building.components.WiredPins.slots;
pins.forEach(p => p.direction = shapez.Vector.transformDirectionFromMultipleOf90(p.direction, 90));
root.systemMgr.systems.wire.needsRecompute = true;
```

- Bloquear un pin específico:

```js
building.components.WiredPins.slots[2].canRotate = false;
```

- Obtener pins en la tile actual del mouse (concepto):

```js
const worldPos = root.camera.screenToWorld(root.app.mousePosition);
const tile = worldPos.toTileSpace();
const building = root.map.getLayerContentXY(tile.x, tile.y, "regular");
const localTile = building.components.StaticMapEntity.worldToLocalTile(tile);
const pins = building.components.WiredPins.slots.filter(pin => pin.pos.x === localTile.x && pin.pos.y 
```