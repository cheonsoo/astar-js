////////////////////////////////////////////////////////////////////////////////////////////////////
// DEMO
// - Costs
// 직선: 10
// 대각선(Diagonal): 14
// G: 시작노드에서부터의 거리
// H (Heuristic): 도착(끝) 노드에서부터의 거리 (장애물 고려하지 않고)
// F: G + H
////////////////////////////////////////////////////////////////////////////////////////////////////

const nodeTypeDef = {
  s: "Start",
  e: "End",
  w: "Wall",
  n: "Node"
};

const options = {
  // Map Options
  mapSizeX: 20,
  mapSizeY: 20,
  wallFrequency: 10, // Walls are the lower, the more
  keepTrackingPath: false,
  debug: true,

  // Search Options
  allowDiagonal: false
};

function GraphSearch({ map, options, implementation}) {
  this.astarMap = map;
  this.search = implementation;
  this.generateMap();
  this.initialize();
}

 GraphSearch.prototype.initialize = function() {
   const _astarMap = this;
   this.astarMap.innerText = "";

   this.grid = [];
   const node = [];

   function Cell({ x, y }) {
     Cell.prototype.attr = (id, val) => {
       _cell.setAttribute(id, val);
       return this;
     }

     Cell.prototype.element = () => {
       return _cell;
     };

     const _cell = document.importNode(document.querySelector("#template-cell").content, true).querySelector(".cell");
     _cell.className = "cell";
     this.attr("id", `cell_${x}_${y}`).attr("x", x).attr("y", y).attr("title", `x: ${x}, y: ${y}`);

     let nodeType = "n";
     if (_astarMap.nodes[x][y] === "s") {
       nodeTpye = "s";
       _cell.classList.add("start");
     } else if (_astarMap.nodes[x][y] === "e") {
       nodeType = "e";
       _cell.classList.add("end");
     } else if (_astarMap.nodes[x][y] === "w") {
       nodeType = "w";
       _cell.classList.add("wall");
     }

     _cell.addEventListener("click", async () => {
        if (options.debug) console.log(`### clicked: nodeType: ${nodeTypeDef[nodeType]}, x: ${x}, y: ${y}`);

        const _nodes = _astarMap.nodes;
        _astarMap.graph = new Graph(_nodes, options);

        let start = null;
        for (let x2=0; x2<_nodes.length; x2++) {
          for (let y2=0, row = _nodes[x2]; y2<row.length; y2++) {
            if (row[y2] === "s") {
              start = _astarMap.graph.nodes.find(n => n.x === x2 && n.y === y2);
              break;
            }
          }
        }
        let end = await _astarMap.graph.nodes.find(n => n.x === x && n.y === y);

        const path = _astarMap.search({ graph: _astarMap.graph, start, end });
        _astarMap.animatePath(_astarMap.graph);
        // _astarMap.animatePath(path);
     });
   }

   function Row({ y }) {
     Row.prototype.attr = (id, val) => {
       _row.setAttribute(id, val);
       return this;
     }

     Row.prototype.append = (el) => {
       _row.appendChild(el);
     };

     Row.prototype.element = () => {
       return _row;
     };

     const _row = document.createElement("div");
     _row.className = "row";
     this.attr("y", y);
   }

   for (let x=0; x<options.mapSizeX; x++) {
     const row = new Row({ x });

     const nodeRow = [];
     const gridRow = [];

     for (let y=0; y<options.mapSizeY; y++) {
       const cell = new Cell({ x, y});
       row.append(cell.element());
     }

     this.astarMap.appendChild(row.element());
   }

  //  this.graph = new Graph(this.nodes);
 };

 GraphSearch.prototype.generateMap = function() {
   /**
    * s: Start
    * e: End
    * w: Wall
    */
   /*
   const nodes = [
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
     [0, "s", "w", 3, 4, 5, 6, 7, 8, 9],
     [0, 1, 2, 3, 4, "w", 6, 7, 8, 9],
     [0, 1, 2, 3, 4, "w", 6, 7, 8, 9],
     [0, 1, 2, 3, 4, "w", 6, 7, 8, 9],
     [0, 1, 2, "w", 4, "w", 6, 7, 8, 9],
     [0, 1, 2, 3, 4, "w", 6, 7, 8, 9],
     [0, 1, 2, 3, 4, "w", 6, 7, 8, 9],
     [0, 1, 2, 3, 4, 5, 6, "w", 8, 9],
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   ];
   */
  /*
  const nodes = [
    [0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 's', 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  */
  const nodes = [];
  // Generate Map with Walls
  for (let x=0; x<options.mapSizeX; x++) {
    nodes[x] = [];
    for (let y=0, row=nodes[x]; y<options.mapSizeY; y++) {
      const isWall = Math.floor(Math.random()*(options.wallFrequency)) === 0;
      row[y] = isWall ? 'w' : 0;
    }
  }

  // Set Start Point
  const x = Math.floor(Math.random() * options.mapSizeX);
  const y = Math.floor(Math.random() * options.mapSizeY);
  nodes[x][y] = 's';

   this.nodes = nodes;
 };

GraphSearch.prototype.animatePath = async function(graph) {
  function delay(delay) {
    const promise = new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve(true);
      }, delay);
    });
    return promise;
  }

  const markNode = (x, y, type) => {
    const cell = document.querySelector(`[x='${x}'][y='${y}']`);

    if (type === 'goal') { // Mark Goal
      cell.style.background = 'RGBA(55, 154, 214, 1.00)';
    } else if (type === 'start') {
      cell.style.background = '#ffffff';
    } else { // Mark Path
      const prevColor = cell.style.background;
      cell.style.background = 'RGBA(55, 154, 214, 1.00)';
      if (!options.keepTrackingPath) {
        setTimeout(function() {
          cell.style.background = prevColor;
        }, 500);
      }
    }
  };

  markNode(graph.path[0].x, graph.path[0].y, 'start');

  if (options.debug) {
    // Mark Green: Cost evaluated
    graph.dirtyList.forEach(item => {
      const cell = document.querySelector(`[x='${item.x}'][y='${item.y}']`);
      cell.querySelector("#g").innerText = item.g;
      cell.querySelector("#h").innerText = item.h;
      cell.querySelector("#f").innerText = item.f;
      cell.style.background = "green"
    });

    // graph.closedList.filter(item => (graph.path.findIndex(n => item.x === n.x && item.y === n.y) === -1)).forEach(item => {
    graph.closedList.forEach(item => {
      const cell = document.querySelector(`[x='${item.x}'][y='${item.y}']`);
      cell.style.background = "red"
    });

    console.log(`### Goal: ${graph.path.map(item => (`(${item.x}, ${item.y})`))}`);
  }

  // Mark Blue: Shortest path to the goal
  for (let i=0; i<graph.path.length; i++) {
    const item = graph.path[i];
    await delay(15);
    markNode(item.x, item.y, (i + 1) === graph.path.length ? 'goal' : 'path');
  }
};

 (function() {
   const start = new Date();
   if (options.debug) console.log(`### AstarMap Start [${start}]`);

   const astarMap = document.querySelector("#astar-map");
   const map = new GraphSearch({ map: astarMap, implementation: astar.search });

   if (options.debug) console.log(`### AstarMap End [${new Date().getTime() - start.getTime()}ms]`);
 }());