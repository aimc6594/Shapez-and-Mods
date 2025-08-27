###  README

**METADATA**

- `website`: enlace al repositorio.
- `id`: identificador único del mod.
- `settings`: opciones configurables como disponibilidad desde nivel 1 (`enabledAtLevel1`) o salida de wire (`outputGoalShape`).

**Clase Mod e init()**

- `class Mod extends shapez.Mod`: inicializa modificaciones y mecánicas.
- `replaceMethod(metaClass, methodName, newFunction)`: método recomendado de la API oficial para reemplazar comportamientos.
  - Precaución: puede interferir con otros mods o mecánicas existentes.
- `unlockBuilding(metaClass)`: permite desbloquear los edificios para el juego normal.
- `addNewBuildingToToolbar()`: agrega los edificios modificados a la toolbar estándar.

**Ideas de uso de mecánicas del DLC**

- Integración con sistemas de desbloqueo o logros.
- Ajustes de velocidad de producción, extensión de túneles o desbloqueo de hubs.
- Sirven como inspiración para aprovechar los edificios expuestos de forma progresiva y creativa.