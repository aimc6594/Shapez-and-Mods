# Textura oscura para las cintas transportadoras / Dark Texture for Conveyor Belts

Este mod reemplaza los sprites de las cintas transportadoras por una variante oscura y muestra cómo crear animaciones dinámicas usando los sprites principales del juego.

------

## Descripción

- **Nombre del mod / Mod Name:** Textura oscura para las cintas transportadoras / Dark Texture for Conveyor Belts
- **Autor / Author:** aimc6594
- **Versión / Version:** 1
- **ID único / Unique ID:** dark-belts
- **Compatibilidad / Minimum Game Version:** >= 1.5.0
- **Impacto en partidas guardadas / Savegame impact:** Ninguno / None
- **Página del proyecto / Project website:** [GitHub](https://github.com/aimc6594/Shapez-and-Mods)

------

## Estructura del mod

### METADATA

Contiene información que Shapez utiliza para identificar el mod en el juego:

- `name` / `description`: nombre y descripción visibles.
- `version`: versión del mod.
- `id`: identificador único (recomendado sin espacios ni caracteres especiales).
- `minimumGameVersion`: versión mínima del juego requerida.
- `doesNotAffectSavegame`: indica si el mod afecta o no las partidas guardadas.

### RESOURCES

Objeto que contiene los sprites del mod codificados en **Base64**.

Ejemplo:

```
const RESOURCES = {
  "belt_top.png": "data:image/png;base64,...",
  "belt_left.png": "data:image/png;base64,...",
  "belt_right.png": "data:image/png;base64,...",
  "forward_0.png": "data:image/png;base64,...",
  // ...
};
```

- Cada clave corresponde a un sprite que se usará para reemplazar los existentes.
- Puede incluir sprites adicionales para animaciones dinámicas.

### Clase Mod

```
class Mod extends shapez.Mod {
    init() {
        // Registro de sprites principales
        this.modInterface.registerSprite("sprites/buildings/belt_top.png", RESOURCES["belt_top.png"]);
        this.modInterface.registerSprite("sprites/buildings/belt_left.png", RESOURCES["belt_left.png"]);
        this.modInterface.registerSprite("sprites/buildings/belt_right.png", RESOURCES["belt_right.png"]);

        // Animaciones dinámicas
        const directions = ["forward", "left", "right"];
        directions.forEach(direction => {
            for (let i = 0; i <= 13; i++) {
                const spriteName = `${direction}_${i}.png`;
                const spritePath = `sprites/belt/built/${spriteName}`;
                this.modInterface.registerSprite(spritePath, RESOURCES[spriteName]);
            }
        });
    }
}
```

- `class Mod extends shapez.Mod`: clase principal necesaria para inicializar modificaciones y mecánicas del juego.
- `init()`: función que se ejecuta al cargar el mod, donde se registran sprites y animaciones.
- `modInterface.registerSprite(ruta, recurso)`: reemplaza sprites existentes o registra nuevos. El efecto es inmediato en el juego.

------

## Animaciones dinámicas

- El ejemplo anterior reemplaza los sprites principales y luego genera las animaciones de las cintas usando un bucle.
- Esto permite **crear animaciones completas sin registrar cada frame manualmente**.

### Ejemplo adicional: animación de máquina giratoria

```
const directions = ["up", "right", "down", "left"];
directions.forEach(dir => {
    for (let i = 0; i < 8; i++) {
        const frameName = `machine_${dir}_${i}.png`;
        const spritePath = `sprites/machines/${frameName}`;
        this.modInterface.registerSprite(spritePath, RESOURCES[frameName]);
    }
});
```

- Aquí se generan 8 frames de animación por dirección, usando los sprites definidos en `RESOURCES`.
- Permite que la animación se vea fluida sin necesidad de registrar cada sprite de forma individual.

### Ejemplo: animación de conveyor con colores alternos

```
const colors = ["red", "blue", "green"];
colors.forEach(color => {
    for (let i = 0; i <= 13; i++) {
        const spriteName = `forward_${color}_${i}.png`;
        const spritePath = `sprites/belt/built/${spriteName}`;
        this.modInterface.registerSprite(spritePath, RESOURCES[spriteName]);
    }
});
```

- Permite tener variaciones de color en la animación de las cintas usando los sprites base.

------

## Cómo usar el mod

1. Colocar los archivos del mod y la constante `RESOURCES` en la carpeta de mods de Shapez.
2. Iniciar el juego y activar el mod en el menú correspondiente.
3. El juego reemplazará los sprites y aplicará las animaciones dinámicas automáticamente.

------

## Traducción / English Documentation (Resumen)

- **METADATA**: defines mod information (name, version, id, description, etc.).
- **RESOURCES**: contains sprites encoded in Base64 for replacement or animations.
- **class Mod**: main class, required to initialize modifications and mechanics.
- **modInterface.registerSprite**: registers or replaces a sprite in the game immediately.
- **Dynamic animations**: create full animations by looping over the main sprites instead of registering each frame manually.