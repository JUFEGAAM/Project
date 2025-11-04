Aquí tens la taula completa en markdown:

---

# PLANIFICACIÓ DETALLADA - DIVINE TRIBUTE

## Desglòs Complet d'Activitats

| # | Descripció de la Tasca | Temps Estimat | Dificultat | Prioritat |
|---|------------------------|---------------|------------|-----------|
| **0** | **Aprendre Canvas Basics** - Estudiar tutorials MDN + YouTube sobre canvas API, com dibuixar formes bàsiques (rectangles, cercles), colors, detectar clicks a coordenades | **8h** (2h MDN + 1h vídeo + 2h pràctica + 3h experimentar) | **Alta** | **CRÍTICA** |
| **1** | **Setup del projecte** - Crear estructura de carpetes, index.html amb element canvas, style.css bàsic, game.js, connectar tot correctament, inicialitzar Git repository | **2h** | **Baixa** | **Alta** |
| **2** | **Canvas amb fons bàsic** - Canvas a pantalla completa o mida fixa, fons de color (cel fosc, verd, el que vulguis), centrat a la pàgina | **1h** | **Baixa** | **Alta** |
| **3** | **Sistema de coordenades del mapa** - Definir mida total del mapa (ex: 3000x3000px), variables globals mapX/mapY per gestionar posició de la càmera/viewport | **2h** (1h codi + 1h investigar offset) | **Mitjana** | **Alta** |
| **4** | **Dibuixar primer node de recurs (fusta)** - Funció drawResource(x, y, type), dibuixar cercle verd en posició fixa del mapa virtual, provar que es veu | **2h** | **Baixa-Mitjana** | **Alta** |
| **5** | **Detectar clicks als recursos** - addEventListener('click') al canvas, calcular coordenades reals al mapa considerant offset càmera, detectar si click està dins del cercle d'un recurs | **4h** (2h implementar + 2h debug coordenades) | **Mitjana-Alta** | **CRÍTICA** |
| **6** | **Contador de recursos** - Objecte JavaScript resources = {wood: 0, stone: 0, ...}, mostrar valors amb DOM (div fora del canvas), +1 quan fas click a un recurs | **2h** | **Baixa** | **Alta** |
| **7** | **Dibuixar el Nexe/Déu al centre** - Rectangle o cercle gran al centre del mapa, color distintiu (porpra, negre, etc.), funció drawNexus(), és l'objectiu visual principal | **1h** | **Baixa** | **Alta** |
| **8** | **Sistema "dipositar recursos" bàsic** - Botó DOM "Dipositar al Nexe", quan cliques resta els recursos que tens i suma punts (faithPoints), missatge feedback | **3h** (1h lògica + 1h investigar + 1h testejar) | **Mitjana** | **Alta** |
| **9** | **Game Loop amb requestAnimationFrame** - Crear funció gameLoop() que es crida cada frame (~60 FPS), redibuixa tot el canvas constantment, base essencial per animacions | **4h** (2h aprendre requestAnimationFrame + 2h implementar) | **Mitjana-Alta** | **CRÍTICA** |
| **10** | **Moviment de càmera amb drag** - Detectar mousedown + mousemove per arrossegar el mapa, actualitzar mapX/mapY segons moviment ratolí, mouseup per parar | **5h** (2h investigar + 3h implementar/debug) | **Alta** | **Mitjana** |
| **11** | **Afegir més tipus de recursos** - Pedra (cercle gris), ferro (cercle marró fosc), or (cercle groc), posicionar-los en diferents zones del mapa per varietat | **2h** | **Baixa** | **Mitjana** |
| **12** | **Panel lateral UI** - Crear div fix a la dreta de la pantalla amb llista de recursos actuals, punts totals, nivell, estil CSS decent | **3h** (1h HTML estructura + 2h CSS per fer-ho bonic) | **Mitjana** | **Mitjana** |
| **13** | **Primera màquina: Extractor** - Botó "Comprar Extractor (cost: 10 punts)", crear objecte Machine {type, x, y, producing}, dibuixar rectangle o forma al mapa | **4h** (2h lògica compra + 2h renderitzar) | **Mitjana** | **Alta** |
| **14** | **Sistema col·locar màquina al mapa** - Després de comprar, mode "placement", cursor canvia, click al mapa per col·locar, validar que no estigui sobre altre cosa | **5h** (3h lògica placement + 2h UX/feedback visual) | **Alta** | **Alta** |
| **15** | **Extracció automàtica de màquines** - setInterval o lògica al gameLoop, cada X segons màquina extreu 1 recurs si està a prop d'un node de recurs corresponent | **4h** (2h lògica proximitat + 1h investigar + 1h debug) | **Mitjana-Alta** | **CRÍTICA** |
| **16** | **Dibuixar cintes transportadores bàsiques** - Línia des de posició màquina fins al Nexe, funció drawConveyor(from, to), color diferent per veure-les | **2h** | **Baixa-Mitjana** | **Mitjana** |
| **17** | **Animació recursos movent-se per cinta** - Crear objecte ResourceInTransit {x, y, targetX, targetY, type}, cada frame actualitzar posició cap al target, dibuixar al canvas | **8h** (3h dissenyar sistema + 4h implementar moviment + 1h debug) | **ALTA** | **Mitjana-Alta** |
| **18** | **Recursos arriben al Nexe** - Detectar quan ResourceInTransit arriba a coordenades del Nexe, sumar punts automàticament, eliminar objecte, efecte visual opcional | **3h** (2h lògica + 1h testejar diferents casos) | **Mitjana** | **Alta** |
| **19** | **Zoom in/out del mapa** - Event listener mousewheel, canviar variable zoomLevel, aplicar scale al context canvas, ajustar coordenades clicks | **4h** (2h investigar canvas scaling + 2h implementar) | **Mitjana-Alta** | **Baixa** |
| **20** | **Sistema de grid/graella** - Dibuixar línies de grid al mapa (cada 50px per exemple), snap de màquines a grid, validar no overlap entre màquines | **3h** (1h dibuixar grid + 2h snap logic) | **Mitjana** | **Mitjana** |
| **21** | **Més tipus de màquines** - Implementar Mina (extreu pedra/ferro), Processadora (combina 2 recursos per fer 1 nou), diferents costos i funcionalitats | **5h** (≈2-3h per cada màquina nova) | **Mitjana** | **Mitjana** |
| **22** | **Sistema de nivells i progressió** - Variable playerLevel, acumular experiència, pujar nivell quan arribes a threshold, desbloquetjar màquines/recursos nous per nivell | **4h** (2h lògica XP + 2h UI mostrar nivell/barra) | **Mitjana** | **Alta** |
| **23** | **Expansió progressiva del mapa** - Quan puges de nivell, augmentar límits mapWidth/mapHeight, fer aparèixer nous nodes de recursos a zones noves | **3h** (1h lògica expansió + 2h spawn recursos nous) | **Mitjana** | **Mitjana** |
| **24** | **Treballadors/Robots automàtics** - Comprar robot (cost punts), objecte que es mou pel mapa (punt animat), detecta màquines trencades, va cap allà i les repara | **6h** (3h pathfinding/moviment + 3h lògica reparació) | **Alta** | **Baixa** |
| **25** | **Màquines es poden trencar** - Random chance cada X temps una màquina "es trenca" (isBroken=true), canvia color (vermell), deixa de produir fins que es repari | **2h** | **Baixa-Mitjana** | **Mitjana** |
| **26** | **Sistema del Déu - Diàlegs** - Escriure mínim 30 diàlegs diferents (sarcàstic, enfadat, content, etc.), sistema per mostrar-los (div flotant/modal), aleatoris quan diposites | **6h** (4h escriure diàlegs + 2h implementar UI diàlegs) | **Baixa** | **Alta** |
| **27** | **Sistema humor dinàmic del Déu** - Variable godMood (calm, angry, playful, neutral), canvia segons tipus de recursos que li dones (gemmes afecten diferent), mood afecta bonificacions punts | **4h** (2h lògica mood + 2h testejar comportaments) | **Mitjana** | **Mitjana** |
| **28** | **Events aleatoris** - Sistema random events amb setInterval, exemple: meteorit cau (animació), impacta zona, trenca màquines properes, deixa Meteor Fragments (valuós) | **5h** (2h sistema events + 3h animació/efecte meteorit) | **Mitjana-Alta** | **Baixa** |
| **29** | **Sistema Save/Load amb localStorage** - Serialitzar tot l'estat del joc (màquines + posicions, recursos, nivell, etc.) a JSON, localStorage.setItem, botó Load que recupera tot | **6h** (3h implementar save/load + 2h testejar + 1h debug edge cases) | **Mitjana-Alta** | **Alta** |
| **30** | **Auto-save periòdic** - setInterval cada 30-60 segons, cridar funció saveGame() automàticament, mostrar missatge temporal "Game Saved" | **2h** | **Baixa** | **Mitjana** |
| **31** | **Tutorial inicial interactiu** - Overlay/modal que apareix primer cop, guia pas a pas: "Click aquí per recollir fusta", "Ara diposita al Nexe", "Compra primera màquina", etc. | **4h** (2h dissenyar flux tutorial + 2h implementar) | **Mitjana** | **Mitjana** |
| **32** | **Millores visuals: Pixel art** - Crear sprites 16x16 (o 32x32) per cada recurs, màquines, Nexe amb Aseprite/Piskel, carregar imatges i reemplaçar formes bàsiques | **12h** (8h aprendre i fer sprites + 4h implementar al codi) | **Mitjana** (depèn experiència pixel art) | **BAIXA** |
| **33** | **Animacions de màquines** - Sprite sheets per màquines funcionant (girant, fumejant), animar frame a frame al canvas, visual feedback que estan produint | **6h** (3h crear sprite sheets + 3h implementar animació) | **Alta** | **BAIXA** |
| **34** | **Sistema de partícules i efectes** - Quan màquina extreu: mini partícules surten, quan robot repara: espurnes, click recurs: efecte visual, millora feedback | **4h** | **Mitjana** | **BAIXA** |
| **35** | **So i música** - Buscar/crear efectes sonors (click, màquina funcionant, dipositar), música ambient, implementar amb Web Audio API o etiquetes audio | **8h** (4h buscar/fer sons + 4h implementar) | **Mitjana** | **MOLT BAIXA** |
| **36** | **Optimització rendiment** - Si amb moltes màquines hi ha lag, implementar culling (no dibuixar fora viewport), optimitzar draw calls, object pooling per resources in transit | **4h** | **Alta** | **Variable** |
| **37** | **Testing complet i ajustament** - Jugar intensivament, anotar tots els bugs, fer que amics/família provin, recollir feedback, ajustar dificultat/balanç del joc | **8h** | **Baixa** | **Alta** |
| **38** | **Documentació del codi** - Comentar bé tot el codi JavaScript, escriure README.md explicant projecte i com jugar, documentar estructura de fitxers | **4h** | **Baixa** | **Alta** |
| **39** | **Preparar presentació final** - Crear slides o vídeo demostració, preparar explicació oral pel professor, assajar, publicar a GitHub Pages | **4h** | **Baixa** | **Alta** |

---

## Resum per Nivell de Prioritat

### 🔴 CRÍTICA (sense això el joc no funciona)
**Tasques:** 0, 5, 9, 15  
**Total:** 21 hores

### 🟠 ALTA (joc mínim viable funcional)
**Tasques:** 1, 2, 3, 4, 6, 7, 8, 13, 14, 18, 22, 26, 29, 37, 38, 39  
**Total:** 67 hores

### 🟡 MITJANA (profunditat i varietat)
**Tasques:** 10, 11, 12, 16, 17, 19, 20, 21, 23, 25, 27, 30, 31  
**Total:** 56 hores

### 🟢 BAIXA (polish i nice-to-have)
**Tasques:** 24, 28, 32, 33, 34, 36  
**Total:** 42 hores

### ⚪ MOLT BAIXA (només si sobra molt temps)
**Tasques:** 35  
**Total:** 8 hores

---

## Càlcul Total d'Hores

| Categoria | Hores |
|-----------|-------|
| **CRÍTICA + ALTA** (Mínim viable) | **88h** |
| **+ MITJANA** (Joc complet amb profunditat) | **144h** |
| **+ BAIXA** (Joc polit i professional) | **186h** |
| **+ MOLT BAIXA** (Amb tots els extres) | **194h** |

---

## Recomanació de Planning

**Objectiu realista:** Arribar a **144 hores** (CRÍTICA + ALTA + MITJANA)

Amb **15h/setmana** → **~10 setmanes** (2.5 mesos)  
Amb **12h/setmana** → **~12 setmanes** (3 mesos)  
Amb **10h/setmana** → **~14 setmanes** (3.5 mesos)

Així tens marge pel polish (tasques BAIXA) si vas bé de temps! 🚀

---
