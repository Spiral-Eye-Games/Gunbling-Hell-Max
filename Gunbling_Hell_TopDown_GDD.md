# GDD — Gunbling Hell: Versión Top-Down 2D

**Documento:** Game Design Document / Registro de diseño  
**Versión:** Prototipo top-down navegador  
**Estado:** En proceso  
**Formato objetivo:** Juego 2D top-down para navegador, hecho en Phaser  
**Fecha:** 2026-06-22  

---

## 1. Resumen del juego

**Gunbling Hell** es un juego de acción roguelite top-down ambientado en un casino demoníaco. El jugador controla a un personaje armado con un revólver tragaperras capaz de modificar sus disparos mediante un sistema de ruletas personalizables.

La experiencia se centra en moverse constantemente, disparar, esquivar enemigos, mantener el combo, ganar fichas, comprar mejoras y construir progresivamente la propia máquina tragaperras para llegar a la ronda 66 y enfrentar a Satanás.

La versión top-down adapta la idea original de FPS a una cámara superior, priorizando la lectura de patrones, el posicionamiento, la evasión, la gestión del espacio y la construcción estratégica de ruletas.

---

## 2. Fantasía principal

El jugador desciende por un casino infernal, sobreviviendo ronda tras ronda, mientras convierte su arma en una máquina de azar cada vez más poderosa.

La fantasía central es:

> “No controlo exactamente qué me va a salir, pero sí diseño la máquina que decide qué puede salir.”

Esto convierte al azar en un sistema parcialmente controlable por el jugador. La suerte existe, pero la build define qué tan favorable o caótica puede ser esa suerte.

---

## 3. Pilares de diseño

### 3.1 Acción constante

El jugador debe estar en movimiento, disparando, esquivando y tomando decisiones rápidas. El combate debe sentirse fluido, agresivo y arcade.

### 3.2 Azar construido por el jugador

La ruleta no es puro RNG. El jugador compra tokens y los coloca en sus propias ruletas, modificando las probabilidades de los cargadores que puede obtener.

### 3.3 Dopamina visual y numérica

El juego debe reforzar constantemente la sensación de recompensa mediante números que suben, multiplicadores, fichas, efectos visuales, impactos, explosiones y mensajes como “JACKPOT” o “COMBINACIÓN”.

### 3.4 Build progresiva

Durante la run, el jugador mejora sus pasivas y sus ruletas. La build no solo aumenta estadísticas, sino que modifica directamente el comportamiento del arma.

### 3.5 Riesgo / recompensa

Los modificadores fuertes suelen reducir munición o exigir mejor posicionamiento. Los slots vacíos, en cambio, dan más balas, pero no agregan efectos especiales.

---

## 4. Cámara y perspectiva

La versión top-down usa una cámara superior 2D. El jugador se ve desde arriba y apunta con el mouse.

### Diferencia con la versión FPS

En FPS, la experiencia se centra más en la puntería, el arma en primera persona y la inmersión directa.

En top-down, la experiencia se centra más en:

- Posicionamiento.
- Control de masas.
- Lectura de enemigos.
- Esquivar zonas peligrosas.
- Aprovechar patrones de disparo.
- Mantener distancia.
- Crear rutas de movimiento dentro de la arena.

---

## 5. Controles

### Combate

| Acción | Control |
|---|---|
| Movimiento | WASD |
| Apuntar | Mouse |
| Disparar | Click izquierdo |
| Dash | Shift / Space |
| Reiniciar luego de derrota/victoria | F |

### Tienda

| Acción | Control |
|---|---|
| Cambiar sección Tokens / Pasivas | TAB |
| Mover selección | A / D |
| Comprar / elegir | E |
| Reroll | R |
| Avanzar a la siguiente ronda | F |

### Colocación de tokens

| Acción | Control |
|---|---|
| Cambiar ruleta | Flecha arriba / abajo |
| Cambiar slot | Flecha izquierda / derecha |
| Colocar token | E |

---

## 6. Estructura de run

La run está pensada como una progresión larga.

```text
Ronda 1 → inicio de la run
Rondas intermedias → combate + tienda + construcción de ruletas
Ronda 66 → boss final: Satanás
```

### Estado actual del prototipo

- Satanás aparece en la ronda 66.
- Cada ronda exige matar una cantidad determinada de enemigos.
- Al limpiar la ronda, aparece la tienda.
- Luego de la tienda, el jugador avanza a la siguiente ronda.
- La dificultad escala gradualmente con la ronda.

---

## 7. Core loop

```text
Comenzar run
↓
Tienda inicial gratuita
↓
Elegir 2 tokens iniciales
↓
Colocar tokens en las ruletas
↓
Entrar a combate
↓
Moverse, disparar y esquivar
↓
Impactar enemigos
↓
Girar ruletas
↓
Crear cargador modificado
↓
Matar enemigos
↓
Subir combo, puntuación y fichas
↓
Limpiar ronda
↓
Comprar pasivas o tokens
↓
Modificar ruletas
↓
Avanzar a la siguiente ronda
↓
Repetir hasta ronda 66
↓
Boss final: Satanás
```

---

## 8. Sistema de ruletas

El jugador tiene **3 ruletas**. Cada ruleta tiene **6 slots**.

```text
Ruleta 1: [slot, slot, slot, slot, slot, slot]
Ruleta 2: [slot, slot, slot, slot, slot, slot]
Ruleta 3: [slot, slot, slot, slot, slot, slot]
```

Cada slot puede estar vacío o contener un token.

Cuando el jugador consigue 3 impactos, el juego tira una vez en cada ruleta:

```text
Impacto 1 → tira Ruleta 1
Impacto 2 → tira Ruleta 2
Impacto 3 → tira Ruleta 3
```

El resultado de las tres ruletas construye el siguiente cargador.

---

## 9. Slots vacíos

Los slots vacíos no son fallos. En esta versión, los slots vacíos aportan munición.

```text
Slot vacío = +3 balas al cargador
```

Esto permite que los primeros cargadores de la run no se sientan inútiles. También crea una tensión estratégica:

- Más tokens = más efectos especiales.
- Más vacíos = más balas disponibles.

Ejemplo:

```text
Resultado:
Ruleta 1 → Vacío
Ruleta 2 → Escopeta
Ruleta 3 → Vacío

Cargador:
Base 5 balas
+3 por vacío
+3 por vacío
-1 por escopeta
= 10 balas con efecto de escopeta
```

---

## 10. Sistema de tokens

Los tokens representan modificadores que se colocan en los slots de las ruletas.

### Token Escopeta

```text
Efecto:
+2 proyectiles por disparo por cada token de Escopeta.

Costo:
-1 bala en el cargador por cada token de Escopeta.
```

Ejemplos:

```text
1 Escopeta = +2 proyectiles, -1 bala
2 Escopetas = +4 proyectiles, -2 balas
3 Escopetas = +6 proyectiles, -3 balas
```

Función de diseño:

- Excelente contra grupos cercanos.
- Aumenta la cobertura.
- Reduce munición, por lo que exige aprovechar cada disparo.

---

### Token Metralleta

```text
Efecto:
Aumenta la velocidad de disparo.

Bonus:
+5 balas en el cargador por cada token de Metralleta.
```

Ejemplos:

```text
1 Metralleta = más cadencia, +5 balas
2 Metralletas = mucha cadencia, +10 balas
3 Metralletas = cadencia extrema, +15 balas
```

Función de diseño:

- Mantiene el flow.
- Facilita sostener el combo.
- Da más oportunidades de impactar y volver a activar la ruleta.

---

### Token Misil

```text
Efecto:
Las balas explotan al impactar.

Escalado:
Más tokens de Misil aumentan el área de explosión.

Costo:
-2 balas en el cargador por cada token de Misil.
```

Ejemplos:

```text
1 Misil = explosión chica, -2 balas
2 Misiles = explosión mediana, -4 balas
3 Misiles = explosión grande, -6 balas
```

Función de diseño:

- Alto impacto contra grupos.
- Recompensa juntar enemigos.
- Puede dejar muy poca munición, por lo que funciona como apuesta fuerte.

---

### Token 7 / Láser

```text
Efecto:
Las balas atraviesan enemigos.

Escalado:
Más tokens de Láser aumentan el ancho/hitbox del láser.

Costo:
-1 bala en el cargador por cada token de Láser.
```

Ejemplos:

```text
1 Láser = atraviesa enemigos, -1 bala
2 Láseres = láser más ancho, -2 balas
3 Láseres = láser muy ancho, -3 balas
```

Función de diseño:

- Recompensa alinear enemigos.
- Excelente contra hordas en línea.
- Potente contra enemigos grandes o boss.

---

## 11. Construcción de cargador

Cada vez que las 3 ruletas dan resultado, se construye un cargador.

### Base

```text
Cargador base: 5 balas
Mínimo absoluto: 1 bala
```

### Modificadores actuales

```text
Vacío: +3 balas
Escopeta: +2 proyectiles, -1 bala
Metralleta: +cadencia, +5 balas
Misil: explosión, +área, -2 balas
7 / Láser: atraviesa, +ancho, -1 bala
```

### Ejemplo 1

```text
Resultado:
Vacío + Vacío + Metralleta

Cálculo:
5 balas base
+3 por vacío
+3 por vacío
+5 por metralleta
= 16 balas

Efecto:
Cargador largo con alta cadencia.
```

### Ejemplo 2

```text
Resultado:
Escopeta + Misil + 7

Cálculo:
5 balas base
-1 por escopeta
-2 por misil
-1 por láser
= 1 bala

Efecto:
Una bala con múltiples proyectiles, explosión y piercing.
```

### Ejemplo 3

```text
Resultado:
Misil + Misil + Misil

Cálculo:
5 balas base
-6 por misiles
mínimo 1 bala
= 1 bala

Efecto:
Una bala explosiva de gran área.
```

---

## 12. Tienda inicial

Antes de empezar la run, aparece una tienda inicial gratuita.

### Estado actual

```text
Tokens gratuitos iniciales: 2
```

El jugador elige tokens entre un set aleatorio y los coloca en cualquier slot de cualquiera de sus 3 ruletas.

Objetivo de diseño:

- Evitar que el inicio sea totalmente vacío.
- Dar una primera decisión estratégica.
- Permitir que cada run empiece con una identidad distinta.
- Introducir al jugador al sistema de construcción de ruletas.

---

## 13. Tienda entre rondas

Luego de limpiar una ronda, el jugador accede a la tienda.

La tienda tiene dos secciones:

```text
Tokens de ruleta
Pasivas
```

### Tokens de ruleta

Permiten comprar nuevos tokens para colocarlos en las ruletas.

Ejemplos:

```text
Token Escopeta
Token Metralleta
Token Misil
Token Láser
```

Luego de comprar un token, el jugador debe colocarlo manualmente en un slot.

Puede colocarlo en un slot vacío o reemplazar un token anterior.

### Pasivas

Son mejoras generales de la run.

Ejemplos actuales:

```text
Cargador +1
Daño +
Vida máxima
Botas del pecado
Curación
Combo pegado
```

---

## 14. Estrategias de construcción de ruletas

### Build segura

Prioriza vacíos y metralleta.

```text
Objetivo:
Muchos disparos, mucha cadencia, buena estabilidad.

Ventaja:
Mantiene combo fácilmente.

Desventaja:
Menos burst damage.
```

### Build explosiva

Prioriza misil y escopeta.

```text
Objetivo:
Eliminar grupos de enemigos con pocos disparos.

Ventaja:
Muchísimo daño en área.

Desventaja:
Muy poca munición, requiere precisión y buen timing.
```

### Build láser

Prioriza el token 7 / Láser.

```text
Objetivo:
Alinear enemigos y atravesarlos.

Ventaja:
Muy fuerte contra hordas y enemigos grandes.

Desventaja:
Depende del posicionamiento.
```

### Build jackpot

Coloca el mismo token en varias ruletas para aumentar la probabilidad de triples.

```text
Objetivo:
Forzar resultados consistentes y cargadores especializados.

Ventaja:
Mayor control sobre el azar.

Desventaja:
Menos versatilidad.
```

### Build híbrida

Distribuye tokens distintos.

```text
Objetivo:
Crear cargadores variados y adaptativos.

Ventaja:
Muchas combinaciones posibles.

Desventaja:
Menos consistencia.
```

---

## 15. Combo

El combo aumenta al matar enemigos y al obtener cargadores con resultados interesantes.

### Funciones del combo

- Multiplica puntuación.
- Incentiva jugar rápido.
- Castiga recibir daño.
- Mantiene la tensión del combate.
- Alimenta la fantasía arcade de números subiendo.

### Reglas actuales

```text
Matar enemigos sube combo.
Obtener cargadores también puede subir combo.
Recibir daño reinicia el combo.
Si no hay acción, el combo cae gradualmente.
```

---

## 16. Puntuación y fichas

### Puntuación

Representa performance. Es el número grande de la run.

Sirve para:

- Recompensa visual.
- Competencia personal.
- Rejugabilidad.
- Medición de dominio.

### Fichas

Son la moneda de la run.

Sirven para:

- Comprar tokens.
- Comprar pasivas.
- Hacer reroll de tienda.

---

## 17. Enemigos

### Demonio básico

Enemigo directo que persigue al jugador.

Función:

- Presionar movimiento.
- Alimentar el combo.
- Generar hordas.

### Venenante / Spitter

Enemigo que genera charcos peligrosos cerca del jugador.

Función:

- Controlar espacio.
- Romper rutas cómodas.
- Obligar al jugador a reposicionarse.

---

## 18. Hazards

### Veneno

Zona en el suelo que daña al jugador al contacto.

Función:

- Castigar quedarse quieto.
- Forzar movimiento.
- Crear presión espacial.

### Ataques de Satanás

Durante el boss final, Satanás crea zonas peligrosas alrededor de la arena.

Función:

- Aumentar la intensidad final.
- Probar la movilidad del jugador.
- Obligar a usar dash y posicionamiento.

---

## 19. Boss final: Satanás

Satanás aparece en la ronda 66.

### Función de diseño

Satanás es la prueba final de la build.

El jugador llega con:

- Ruletas personalizadas.
- Pasivas acumuladas.
- Un estilo de juego definido.
- Experiencia con su propia máquina.

### Estado actual del prototipo

- Satanás tiene mucha vida.
- Persigue al jugador.
- Genera hazards en anillo.
- La victoria termina la run.

### Objetivo futuro

Satanás debería tener fases que interactúen con la build del jugador.

Ideas posibles:

```text
Fase 1: presión directa y hazards.
Fase 2: invoca enemigos.
Fase 3: altera temporalmente las ruletas.
Fase 4: castiga builds demasiado repetidas.
```

---

## 20. UI actual

### HUD de combate

Elementos principales:

```text
HP
Dash
Resultado de ruleta
Balas del cargador
Modificadores activos del cargador
Combo
Puntuación
Fichas
Ronda actual
```

### Panel de ruletas

Muestra las 3 ruletas del jugador y sus 6 slots.

Cada slot puede mostrar:

```text
□ = vacío
☰ = Escopeta
● = Metralleta
✹ = Misil
7 = Láser
```

### UI de tienda

Muestra:

```text
Sección actual: Tokens / Pasivas
Ofertas disponibles
Costo
Descripción
Cursor de selección
Panel de colocación de tokens
```

---

## 21. MDA

### Mecánicas

- Movimiento top-down.
- Disparo con mouse.
- Dash.
- Ruletas editables.
- Tokens comprables.
- Cargadores modificados.
- Combo.
- Puntuación.
- Fichas.
- Tienda.
- Progresión por rondas.
- Boss final.

### Dinámicas

- El jugador construye su propia probabilidad.
- El jugador alterna entre combate frenético y planificación en tienda.
- Las ruletas generan resultados variables, pero influenciados por la build.
- El jugador decide si priorizar consistencia, burst damage, munición, área o piercing.
- La presión del combo empuja a jugar agresivamente.
- Las fichas empujan a limpiar rondas y sostener performance.

### Estéticas

Principales:

```text
Challenge
Sensation
Discovery
Expression
```

Secundarias:

```text
Submission
Fantasy
```

### Lectura MDA

**Challenge** aparece en el combate, el posicionamiento, el dash, el mantenimiento del combo y el boss final.

**Sensation** aparece en el feedback visual, disparos, explosiones, números, jackpots y efectos de casino.

**Discovery** aparece al probar nuevas combinaciones de tokens.

**Expression** aparece al construir una slot machine propia, eligiendo dónde colocar cada token.

**Fantasy** aparece en la temática de casino infernal y descenso hacia Satanás.

---

## 22. Sistemas de condicionamiento

### Refuerzo variable

La ruleta funciona como un sistema de recompensa variable. El jugador no sabe exactamente qué cargador obtendrá, pero sí sabe que puede influir en las probabilidades mediante sus decisiones de tienda.

### Refuerzo positivo

El juego refuerza acciones exitosas con:

```text
Puntos
Fichas
Combo
Mensajes visuales
Cargadores modificados
Efectos de impacto
```

### Castigo suave

El juego castiga errores con:

```text
Pérdida de vida
Reinicio de combo
Pérdida de posición
Riesgo de muerte
```

### Control indirecto

El jugador no controla el resultado exacto de la ruleta, pero controla su composición.

Esto es importante porque transforma el azar en estrategia.

---

## 23. Estado actual del prototipo

Implementado:

```text
Movimiento WASD
Apuntado con mouse
Disparo con click
Dash
Sistema de ruletas editables
3 ruletas de 6 slots
Slots vacíos que dan +3 balas
Tokens: Escopeta, Metralleta, Misil, Láser
Cargadores modificados
Tienda inicial con 2 tokens gratis
Tienda con tokens y pasivas
Colocación manual de tokens
Combo
Puntuación
Fichas
Enemigos básicos
Enemigos con veneno
Hazards
Ronda 66
Boss final Satanás
HUD básico
```

---

## 24. Pendientes / ideas futuras

### Gameplay

```text
Agregar más enemigos.
Agregar mini-bosses.
Agregar eventos especiales cada ciertas rondas.
Agregar salas con objetivos distintos.
Agregar obstáculos y trampas.
Agregar más tipos de tokens.
Agregar tokens raros o corruptos.
Agregar sinergias entre tokens.
```

### Ruletas

```text
Permitir mover tokens ya colocados.
Permitir vender tokens.
Agregar rarezas de tokens.
Agregar tokens con efectos negativos pero poderosos.
Agregar locks de slots.
Agregar ruletas especiales.
Agregar tokens que modifican otras ruletas.
```

### Tienda

```text
Mejorar interfaz visual.
Agregar tienda especial cada 10 rondas.
Agregar descuentos.
Agregar sacrificios: vida por token.
Agregar reroll más caro cada vez.
Agregar elección entre recompensa inmediata o mejora de ruleta.
```

### Boss

```text
Agregar fases a Satanás.
Agregar ataques telegrafiados.
Agregar invocación de enemigos.
Agregar interacción con la slot machine.
Agregar fase final basada en jackpot.
```

### Visual

```text
Sprites reales.
Animaciones de disparo.
Partículas.
Feedback de impacto.
Iluminación infernal.
UI más cercana a casino demoníaco.
```

### Audio

```text
Sonidos de ruleta.
Campana de jackpot.
Disparos diferenciados.
Explosiones.
Sonidos de fichas.
Música dinámica según combo.
Tema especial de Satanás.
```

---

## 25. Decisiones de diseño actuales

```text
La run termina en ronda 66.
La tienda inicial da 2 tokens gratuitos.
El jugador tiene 3 ruletas.
Cada ruleta tiene 6 slots.
Los slots vacíos dan +3 balas.
Los tokens se colocan manualmente.
La tienda vende pasivas y tokens.
El cargador se construye con el resultado de las 3 ruletas.
```

---

## 26. Preguntas abiertas

```text
¿La tienda debería aparecer cada ronda o cada cierta cantidad de rondas?
¿Los tokens deberían tener rareza?
¿Conviene que los slots vacíos siempre den +3 balas o debería escalar?
¿Se deberían poder mover tokens ya colocados?
¿Los tokens reemplazados se pierden o vuelven al inventario?
¿Satanás debería copiar parte de la build del jugador?
¿Debería haber mini-bosses antes de ronda 66?
¿El jugador debería poder elegir entre varias arenas?
¿La tienda inicial debería dar 2 tokens o 3?
```

---

## 27. Resumen de una run ideal

El jugador entra a la tienda inicial y elige dos tokens. Los coloca en sus ruletas para definir una primera inclinación de build. Empieza la ronda 1 y combate contra demonios básicos. Cada impacto activa una ruleta y cada tres impactos se genera un nuevo cargador. A veces salen muchos vacíos y recibe muchas balas; a veces salen tokens y obtiene efectos más poderosos pero con menor munición.

Al limpiar rondas, compra pasivas o nuevos tokens. Cada token comprado se coloca estratégicamente en alguna de las tres ruletas. Con el avance de la run, el arma deja de ser aleatoria y pasa a expresar la estrategia del jugador. Puede construir una ruleta segura, explosiva, rápida, láser o híbrida.

El combo empuja a jugar rápido y agresivo. Las fichas recompensan matar enemigos y sostener el flow. La tienda ofrece pausas de planificación. Finalmente, en la ronda 66, el jugador enfrenta a Satanás con la build que fue construyendo durante toda la run.

---

## 28. Próximo objetivo recomendado

El próximo paso de diseño debería ser mejorar la tienda y la manipulación de tokens.

Prioridad sugerida:

```text
1. Hacer que la tienda aparezca cada X rondas en lugar de todas las rondas.
2. Permitir mover tokens ya colocados.
3. Agregar rarezas de tokens.
4. Agregar un mini-boss cada 10 rondas.
5. Agregar nuevas arenas para evitar repetición.
```

---

Fin del documento.
