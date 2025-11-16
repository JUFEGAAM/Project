# Proyecto

Voy a hacer un "spike" con todas las cosas que quiero que mi juego tenga, la idea es pensar por ejemplo: 
- *Quiero un mundo por el que me pueda mover y que tenga recursos.
Pues para hacer eso pensare que necesito ya sea como hacer que se muestre solo una parte del mapa y que al moverme vaya apareciendo lo demas o como hacer que se dibujen esos recursos fijos en una coordenada y asi tendre una base de la cual partir con las cosas que se que funcionan y cumplen mis necesidades.*

## Mundo

#### Como hago que el mundo tenga un tamaño pero solo muestre una parte para dar esa sensacion de que estas en un mundo por el cual puedes moverte y encontrar cosas?

Vale, primeramente creo que lo que mas se adapta a lo que quiero es un "canvas" es un elemento de html que se usa para pintar graficos, para ello necesitas tambien JavaScript que es el encargado de pintar las cosas que quieres.

1. Primero creo el canvas con **`<canvas></canvas>`**
2. Y le doy los parametros necesarios para empezar a configurarlo con JavaScript (importante el ID y declarar el width y el height si no pondra los default que es 300x150).

**Quedaria asi:**
```html
<canvas id="world" height="400" width="800"></canvas>
```

***Importante declarar el width y el height en el elemento `<canvas>` porque si lo haces con CSS dara problemas ha sido uno de los primeros errores que me he encontrado

Ahora hay varias cosas que serian interesantes implementar para que el mundo tenga mas sentido que un rectangulo en blanco. Por ejemplo empezaria por hacer que el mundo tenga un grid basicamente recuadros de una medida fija como un tablero de ajedrez que ayudaran a diferenciar las partes del mapa ya que moverte en un fondo blanco digamos que es como si no hicieras nada, despues estaria bien pintar cuadrados o cualquier figura sencilla que demomento seran las menas de recursos o arboles por ejemplo y como ultimo habria que hacer que nos podamos mover por el mundo que hemos creado asi que vamos paso por paso:

### Cuadricula del mundo (Grid)

Vale para empezar tendriamos que hacer la configuracion inicial del canvas como ya he dicho antes y a partir de ahi seguiremos con JavaScript:

```html
<canvas id="world" height="500" width="500"></canvas>
```

Ahora no veremos nada porque el canvas esta en blanco por defecto, ahora pasamos con el JavaScript:

primero le damos los parametros iniciales para que identifique el canvas y entienda que queremos que pinte cosas en 2D:
  
```html
<script>
  let world = document.getElementByID("world"); // Creamos el valor "world" que apunta al ID del canvas
  const ctx = world.getContext("2d"); // Le decimos que el contexto del canvas queremos que sea en 2D
</script>
```

Con esta funcion que vamos hacer lo que conseguimos es ya crear nuestra primer cuadricula, basicamente estamos diciendole desde donde queremos que dibuje las lineas, con que espacio y que tamaño con tal de que formemos una cuadricula en todo el canvas.

```javascript
function drawGrid(lineWidth, cellWidth, cellHeight, color) {
  // Propiedas de las lineas
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Obtener tamaño
  let width = world.width;
  let height = world.height;

  // Dibujar lineas verticales
  for (let x = 0; x <= width; x += cellWidth) {
    ctx.beginPath(); // Desde aqui se dibujara la linea
    ctx.moveTo(x, 0); // Movemos el punto de inicio al 0 en los ejes x y
    ctx.lineTo(x, height); // Nos quedamos en la x y vamos hasta donde le pongamos al valor "height"
    ctx.stroke(); // Con esto hacemos que cada vez que se dibuja una linea tenga la separacion que hemos puesto  en el valor "cellWidth"
  }

  // Dibujar lineas horizontales
  for (let y = 0; y <= height; y += cellHeight) {
    ctx.beginPath();
    ctx.moveTo(y, 0);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
drawGrid(1, 20, 20, "#000");
```

Bueno una vez hemos hecho esto ya vemos nuestra primera cuadricula pero hay un problema, si te fijas por alguna razon las lineas se ven borrosas, eso se debe a que el elemento canvas de por si usa un ajuste de DPI (pixeles por pulgada) muy bajo que para pantallas antiguas seria perfecto pero hoy en dia las pantallas son mucho mas potentes. Lo que hacen las pantallas se llama Down Sampling y es lo que pasa cuando una pantalla con una resolucion mayor renderiza algo con unos graficos muy bajos, para solucionar eso hacemos esto.

```javascript
function accountForDPI() {
  const dpr = window.devicePixelRatio || 1; // Con esto conseguimos cuantos pixeles se dibujan por cada pixel fisico, si no se obtiene nada el valor sera 1
  const rect = world.getBoundingClientRect(); // Conseguimos el tamaño del canvas en CSS porque al parecer el tamaño que vemos puede ser diferente al registrado por CSS

// Con esto hacemos que el tamaño interno del canvas se adapte a el valor que obtengamos del dpr de cada pantalla
  world.width = rect.width * dpr;
  world.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

// Ahora manteniendo el escalado para el dpr que toca le ponemos el tamaño real del canvas ya que sin esto se veria todo demasiado grande
  world.style.width = `${rect.width}px`;
  world.style.height = `${rect.height}px`;
}
accountForDPI();
```
