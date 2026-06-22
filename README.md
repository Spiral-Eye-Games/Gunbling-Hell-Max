# Gunbling Hell — Top-down Phaser Prototype

Prototipo 2D top-down para navegador con ruletas editables, tokens comprables y boss en ronda 66.

## Correr (Vite + hot reload)

```bash
cd gunbling_hell_topdown_phaser
npm install
npm run dev
```

Abrí la URL que muestra Vite (por defecto http://localhost:5173). Los cambios en `src/` se recargan al guardar.

### Build de producción

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test        # modo watch
npm run test:run  # una sola pasada (CI)
```

Cubre `MagazineSystem` (cargadores, tokens, slots vacíos) y funciones de balance (`getRequiredKills`, `getWaveSize`, etc.).

## Controles

- **Combate:** WASD mover, mouse apuntar, click disparar, Shift/Space dash
- **Tienda:** TAB cambiar sección, A/D elegir, E comprar, R reroll, F avanzar
- **Colocar token:** flechas mover cursor, E colocar

## Estructura del proyecto

```text
src/
├── main.js              # Bootstrap Phaser
├── config/              # Constantes, colores, balance
├── data/                # Tokens y catálogo de pasivas
├── core/                # Estado de run y sistema de cargadores
├── systems/             # Lógica de combate, tienda, boss, etc.
├── rendering/           # Dibujo de arena, entidades y HUD
├── effects/             # Efectos visuales y mensajes flotantes
└── scenes/MainScene.js  # Orquestador principal
tests/                   # Vitest: balance + MagazineSystem
```

## Incluye

Ruletas de 3×6 slots, tienda inicial gratis, pasivas, combo, fichas, enemigos, charcos y boss final Satanás en ronda 66.
