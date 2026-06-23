# Gunbling Hell — Godot 4

Top-down roguelike con ruletas editables, tienda de tokens/pasivas y boss en ronda 66.

El prototipo original en **Phaser + Vite** está en [`legacy/`](legacy/).

## Requisitos

- [Godot 4.3+](https://godotengine.org/download)

## Cómo correr

1. Instalá Godot 4.
2. Abrí Godot → **Import** → seleccioná esta carpeta (`project.godot`).
3. Presioná **F5** (Play).

## Controles

| Contexto | Controles |
|----------|-----------|
| Combate | WASD mover · mouse apuntar · click disparar · Shift/Space dash · **Q** colapsar ruletas |
| Tienda | Mouse · click tokens/pasivas · reroll · continuar |
| Colocar token | Click en slot de ruleta |
| Game over | **F** reiniciar |

## Estructura

```text
project.godot
scenes/main.tscn          Escena principal
scripts/
├── autoload/             Constantes, balance, datos
├── core/                 RunState, MagazineSystem
├── systems/              Combate, tienda, boss, ruletas
├── game/                 Dibujo de arena y entidades
└── ui/                   Tienda, ruletas, HUD
legacy/                   Prototipo Phaser (archivado)
```

## Web (GitHub Pages)

El build web vive en `builds/Web/`. Cada push a `main` lo publica vía GitHub Actions.

### Primera vez (en GitHub)

1. Subí el repo a GitHub.
2. **Settings → Pages → Build and deployment → Source:** elegí **GitHub Actions**.
3. Hacé push a `main` (incluye `builds/Web/` con el `.wasm`).

La URL queda en `https://<usuario>.github.io/<repo>/`.

### Actualizar el juego online

1. En Godot: **Project → Export → Web → Export Project** (preset apunta a `builds/Web/index.html`).
2. Commiteá los archivos nuevos en `builds/Web/`.
3. Push a `main` → el workflow **Deploy Web to GitHub Pages** publica solo.

`.nojekyll` en `builds/Web/` evita que Jekyll bloquee el `.wasm`.

## GDD

Ver [`Gunbling_Hell_TopDown_GDD.md`](Gunbling_Hell_TopDown_GDD.md).

## Notas de migración

- Lógica de juego portada desde `legacy/src/systems/` y `legacy/src/core/`.
- UI dibujada con `_draw()` en Controls (sin Lucide; labels de tokens como texto).
- Resolución fija: 1280×720.
