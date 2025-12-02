# Project

I'm gonna do a "spike" with all the things I want my game to have. The idea is to think like: 
- *I want a world where I can move around and that has resources.
So to do that I'll think that I need either a way to show only a part of the map and make the rest appear as I move, or how to make those fixed resources draw at a coordinate, and that way I'll have a base to start from with things I know work and meet my needs.*

## World

#### How do I make the world have a size but only show a part to give that feeling that you are in a world where you can move and find things?

Ok, first I think what fits best is a "canvas", it's an html element used to paint graphics, for that you also need JavaScript which is in charge of painting the things you want.

1. First I create the canvas with **`<canvas></canvas>`**
2. And I give it the necessary parameters to start configuring it with JavaScript (important the ID and declaring the width and height, otherwise it puts the default ones which is 300x150).

**It would look like this:**
```html
<canvas id="world" height="400" width="800"></canvas>
```

***Important to declare the width and height in the `<canvas>` element because if you do it with CSS it will give problems, it was one of the first errors I encountered.***

Now there are several things that would be interesting to implement so the world makes more sense than just a blank rectangle. For example I would start by making the world have a grid, basically boxes of a fixed size like a chess board that will help differentiate the parts of the map since moving on a white background is kinda like doing nothing. Then it would be good to paint squares or any simple shape that for now will be the resource ores or trees for example, and lastly make it so we can move around the world we created, so let's go step by step:

### World Grid

Ok so to start we would have to do the initial canvas config like I said before and from there we continue with JavaScript:

```html
<canvas id="world" height="500" width="500"></canvas>
```

Now we won't see anything because the canvas is blank by default, now let's go with the JavaScript:

First we give it the initial parameters so it identifies the canvas and understands that we want it to paint things in 2D:
  
```html
<script>
  let world = document.getElementByID("world"); // We create the value "world" that points to the ID of the canvas
  const ctx = world.getContext("2d"); // We tell it that we want the canvas context to be 2D
</script>
```

With this function we are gonna do, what we achieve is creating our first grid, basically we are telling it where we want it to draw the lines from, with what spacing and what size so we form a grid across the whole canvas.

```javascript
function drawGrid(lineWidth, cellWidth, cellHeight, color) {
  // Line properties
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Get size
  let width = world.width;
  let height = world.height;

  // Draw vertical lines
  for (let x = 0; x <= width; x += cellWidth) {
    ctx.beginPath(); // From here the line will be drawn
    ctx.moveTo(x, 0); // We move the starting point to 0 on the x and y axes
    ctx.lineTo(x, height); // We stay on x and go up to where we put the "height" value
    ctx.stroke(); // With this we make sure that every time a line is drawn it has the separation we put in the "cellWidth" value
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += cellHeight) {
    ctx.beginPath();
    ctx.moveTo(y, 0);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
drawGrid(1, 20, 20, "#000");
```

Well once we've done this we already see our first grid but there is a problem, if you look closely for some reason the lines look blurry, that is because the canvas element itself uses a very low DPI (dots per inch) setting which for old screens would be perfect but nowadays screens are much more powerful. What screens do is called Down Sampling and it's what happens when a screen with a higher resolution renders something with very low graphics, to fix that we do this.

```javascript
function accountForDPI() {
  const dpr = window.devicePixelRatio || 1; // With this we get how many pixels are drawn for each physical pixel, if nothing is obtained the value will be 1
  const rect = world.getBoundingClientRect(); // We get the canvas size in CSS because apparently the size we see can be different from the one registered by CSS

// With this we make the internal size of the canvas adapt to the value we get from the dpr of each screen
  world.width = rect.width * dpr;
  world.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

// Now keeping the scaling for the dpr that touches it we put the real size of the canvas since without this everything would look too big
  world.style.width = `${rect.width}px`;
  world.style.height = `${rect.height}px`;
}
accountForDPI();
```

Ok, I've identified 2 problems that were making the grid not draw correctly.

To start I changed the place where I was calling the `drawGrid` function making it so `accountForDPI` is called first and then the grid is drawn with `drawGrid`. This way we manage to actually draw the grid because before it wasn't doing it because for some reason if logically getting the DPI was painted first and then physically painted with the `drawGrid` function it stayed blank.

Then I realized that the lines looked like too thick and kinda blurry, turns out if you paint the lines from 0 0 a mathematical problem comes up between the canvas and your monitor, if the instruction is paint a line at coordinate 10 10 if it were for the canvas it would be fine but the problem is that monitors are made of pixels that in the end are "little lightbulbs" that turn on and off but can't turn on halfway so the logic applied is painting the line at coordinate 9.5 and at 10.5 applying something called Anti-aliasing, it makes the 2 lines that want to form 1 black line paint with a grey so that makes it thicker and blurrier since it's not pure black. With this context change called `ctx.translate(0.5, 0.5);` we get everything to start drawing at 0.5 so when it's trying to paint at coordinate 10.5 what it's gonna do is paint from 10 to 11 and this way it doesn't look blurry because they are 100% black and are in the same place, before they were painted on each side of the invisible dividing line that exists and that generated that problem.

**The code for now would look like this:**

```javascript
<script>
  let world = document.getElementById("world"); // We create the value "world" that points to the ID of the canvas
  const ctx = world.getContext("2d"); // We tell it that we want the canvas context to be 2D

  function drawGrid(lineWidth, cellWidth, cellHeight, color) {
  // Line properties
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Get size
  let width = world.width;
  let height = world.height;

  // Draw vertical lines
  for (let x = 0; x <= width; x += cellWidth) {
    ctx.beginPath(); // From here the line will be drawn
    ctx.moveTo(x, 0); // We move the starting point to 0 on the x and y axes
    ctx.lineTo(x, height); // We stay on x and go up to where we put the "height" value
    ctx.stroke(); // With this we make sure that every time a line is drawn it has the separation we put in the "cellWidth" value
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += cellHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
// Formerly here was the drawGrid function that gave problems
function accountForDPI() {
  const dpr = window.devicePixelRatio || 1; // With this we get how many pixels are drawn for each physical pixel, if nothing is obtained the value will be 1
  const rect = world.getBoundingClientRect(); // We get the canvas size in CSS because apparently the size we see can be different from the one registered by CSS

// With this we make the internal size of the canvas adapt to the value we get from the dpr of each screen
  world.width = rect.width * dpr;
  world.height = rect.height * dpr;

  ctx.scale(dpr, dpr);

  ctx.translate(0.5, 0.5); /* With this we get the lines to paint at coordinate 0.5 instead of 0, this helps the lines paint the correct way because otherwise there comes a point where they overlap since they stay right in the middle of 2 coordinates for example it stays between 10.5 and 11.5 and what it does is paint two lines together which makes all lines look fatter and blurrier, but putting this simple variable fixes it. */

// Now keeping the scaling for the dpr that touches it we put the real size of the canvas since without this everything would look too big
  world.style.width = `${rect.width}px`;
  world.style.height = `${rect.height}px`;
}
accountForDPI();
drawGrid(1, 50, 50, "#000"); // By moving the function here we get the accountForDPI function to run first which is in charge of getting the monitor DPI rendering the page and then the grid is drawn, otherwise it corrupted and lines were not drawn
</script>
```

Now what we have to do is add something that fixes the last problem for this first challenge of painting a grid, what happens is that the lines start, paint correctly respecting size and separation until it reaches the end and the grid boxes get cut off which looks really bad, so we would have to make it adjust correctly that's why we are going to investigate how.

Proof of misaligned lines:

<img src="./images/gridLines-misaligned.png" alt="Grid image with lines misaligned" width="300">

Ok, after some time researching about this problem i've found what was making those rows and columns look cutted lets take a look:

1. First we have something that wasn't the main problem but could make me go crazy if i didnt find out of it, its the css declaration "flex-shrink", by default is set to "1" which translates to "true" and that makes the grid to shrink when properties of the browser change like opening the browser console or zooming in or out, with "flex-shrink: 0;" we make the grid unshrinkable so it wont affect to our grid rows and columns.

```css
#world {
  border: 2px solid black;
  flex-shrink: 0; /*Makes the grid unshrinkable by the browser"*/
  }
```

2. Second we deleted the function "world.getBoundingClientRect()", this function was calculating the size of the canvas at that moment so if you had zoom on your browser or just by the flexbox, the browser would get the result with decimals so you wont gent 700 but 699.6 or something like that, so what i made was create 2 const that where getting the widht and height directly from the canvas properties so now its a fixed number.

```javascript
const WORLD_WIDTH = parseInt(world.getAttribute("width"));
const WORLD_HEIGHT = parseInt(world.getAttribute("height"));
```

I added these new values to all the places where i was calling width and height.

Ok now it's almost perfect but now the variable we added before, the one that made so the starting point wasnt 0 but 0.5, its making the grid to be displaced 0.5 in both x and y axes so now i tried deleting that and now i finally got the PERFECT Grid.

Grid with `ctx.translate(0.5, 0.5)`:

<img src="./images/Starting-at-0.5.png" alt="Grid image with starting point at 0.5 in x and y axes" width="300">

Grid without `ctx.translate(0.5, 0.5)`:

<img src="./images/Full-Perfect-Drawn-Grid.png" alt="The Perfect Square Grid" width="300">
