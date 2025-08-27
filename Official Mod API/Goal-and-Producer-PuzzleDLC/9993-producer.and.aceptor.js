// @ts-nocheck
const METADATA = {
    website: "https://github.com/aimc6594/Shapez-and-Mods", // Web del proyecto
    author: "aimc6594",
    name: "Goal Acceptor & Puzzle Producer (Removibles)",
    version: "1.3.0",
    id: "goal_acceptor_producer_removable", // ID único, claro y descriptivo
    description: "Hace que el Goal Acceptor y el Puzzle Producer puedan colocarse en el modo normal y que sean removibles y desbloqueables. / Makes the Goal Acceptor and Puzzle Producer placeable in normal mode, removable, and unlockable.",
    minimumGameVersion: ">=1.5.0",
    settings: {
        enabledAtLevel1: true, // True = disponible en nivel 1 / False = desbloqueo normal
        outputGoalShape: true // True = habilita salida de forma para wire output
    }
};

// Clase principal del mod / Main mod class
class Mod extends shapez.Mod {
    init() {
        // =============================
        // Reemplazo de métodos existentes
        // =============================
        // Usamos replaceMethod para modificar comportamientos de los edificios del DLC
        // Precaución: puede afectar a otros mods o mecánicas existentes
        this.modInterface.replaceMethod(shapez.MetaGoalAcceptorBuilding, "getIsRemovable", () => true);
        this.modInterface.replaceMethod(shapez.MetaConstantProducerBuilding, "getIsRemovable", () => true);
        this.modInterface.replaceMethod(shapez.MetaBlockBuilding, "getIsRemovable", () => true);

        // =============================
        // Desbloqueo de edificios
        // =============================
        const unlockBuilding = (metaClass) => {
            this.modInterface.replaceMethod(metaClass, "getIsUnlocked", function() {
                if (METADATA.settings.enabledAtLevel1) return true;
                // Llamamos al método original si no está habilitado por configuración
                return shapez.ModInterface.prototype.getIsUnlocked.call(this);
            });
        };

        unlockBuilding(shapez.MetaGoalAcceptorBuilding);
        unlockBuilding(shapez.MetaConstantProducerBuilding);

        // =============================
        // Agregar edificios a la toolbar normal
        // =============================
        [shapez.MetaGoalAcceptorBuilding, shapez.MetaConstantProducerBuilding, shapez.MetaBlockBuilding].forEach(metaClass => {
            this.modInterface.addNewBuildingToToolbar({
                toolbar: "secundary",
                location: "primary",
                metaClass: metaClass
            });
        });

// =============================
// Propuestas adicionales
// Sistema de logros secundarios u objetivos secundarios
// =============================

// 1. Sistema de logros secundarios:
//    - Goal Acceptor podría registrar acciones especiales o eventos específicos del jugador.
//    - Al completarse un objetivo secundario, se podrían otorgar recompensas:
//      - Items especiales
//      - Desbloqueo de edificios alternativos
//      - Aumento temporal de velocidad o alcance de ciertos edificios
//    - Permite un progreso paralelo al juego original sin afectar la progresión principal.

// 2. Objetivos secundarios para mecánicas alternativas:
//    - Los edificios expuestos podrían actuar como metas locales:
//      - Recolección de un tipo de item concreto
//      - Alimentación de blueprints específicos
//      - Combinación de recursos en ciertas ubicaciones
//    - Esto habilita sistemas de misiones o retos opcionales, fomentando creatividad y experimentación.

// 3. Integración con otros mods:
//    - Tanto Goal Acceptor como Puzzle/Constant Producer pueden interactuar con recursos o
//      items introducidos por otros mods.
//    - Permite crear logros secundarios que dependen de varios mods instalados, aumentando
//      la rejugabilidad y el dinamismo.

    }
}
