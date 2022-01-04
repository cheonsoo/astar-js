////////////////////////////////////////////////////////////////////////////////////////////////////
// DEMO
// - Costs
// 직선: 10
// 대각선(Diagonal): 14
// G: 시작노드에서부터의 거리
// H (Heuristic): 도착(끝) 노드에서부터의 거리 (장애물 고려하지 않고)
// F: G + H
////////////////////////////////////////////////////////////////////////////////////////////////////
(function() {
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
    keepTrackingPath: false, // Make the path remains marked
    pathAnimationDelay: 500,
    pathTrailingDelay: 50,
    debug: true,

    // Search Options
    allowDiagonal: false
  };

  function MapSearch({ map, options }) {
    this.map = map;
    this.generateMap();
    this.initialize();
  }

  MapSearch.prototype.initialize = function() {
    const self = this;
    this.map.innerText = "";

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
      if (self.nodes[x][y] === "s") {
        nodeTpye = "s";
        _cell.classList.add("start");
      } else if (self.nodes[x][y] === "e") {
        nodeType = "e";
        _cell.classList.add("end");
      } else if (self.nodes[x][y] === "w") {
        nodeType = "w";
        _cell.classList.add("wall");
      }

      _cell.addEventListener("click", () => {
        const started = new Date();
        if (options.debug) console.log(`### clicked: nodeType: ${nodeTypeDef[nodeType]}, x: ${x}, y: ${y}`);

        const ASTAR = new Astar(self.nodes, options);
        ASTAR.search({ x, y });
        self.animatePath(ASTAR);

        if(options.debug) console.log(`### Took: ${new Date() - started}ms`);
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

    const generateGrid = () => {
      for (let x=0; x<options.mapSizeX; x++) {
        const row = new Row({ x });

        const nodeRow = [];
        const gridRow = [];

        for (let y=0; y<options.mapSizeY; y++) {
          const cell = new Cell({ x, y});
          row.append(cell.element());
        }

        this.map.appendChild(row.element());
      }
    }

    generateGrid();
  };

  /**
   * Generate Map with Walls
   * s: Start
   * e: End
   * w: Wall
   */
  MapSearch.prototype.generateMap = function() {
    const nodes = [];

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

  MapSearch.prototype.animatePath = async function(ASTAR) {
    if (!ASTAR.path || !ASTAR.path.length) return;

    function delay(delay) {
      const promise = new Promise((resolve, reject) => {
        setTimeout(function() {
          resolve(true);
        }, delay);
      });
      return promise;
    }

    const markNode = (x, y, type) => {
      const cell = this.findCell(x, y);

      if (type === 'goal') { // Mark Goal
        cell.style.background = 'RGBA(55, 154, 214, 1.00)';
      } else if (type === 'start') {
        cell.style.background = '#ffffff';
      } else { // Mark Path
        const prevColor = cell.style.background;
        cell.style.background = 'RGBA(55, 154, 214, 1.00)';

        // if keepTrackingPath is false, removes marked cell after the delay
        if (!options.keepTrackingPath) {
          setTimeout(function() {
            cell.style.background = prevColor;
          }, options.pathAnimationDelay);
        }
      }
    };

    markNode(ASTAR.path[0].x, ASTAR.path[0].y, 'start');

    if (options.debug) {
      // Mark Green: Cost evaluated
      ASTAR.dirtyList.forEach(item => {
        const cell = this.findCell(item.x, item.y);
        cell.querySelector("#g").innerText = item.g;
        cell.querySelector("#h").innerText = item.h;
        cell.querySelector("#f").innerText = item.f;
        cell.style.background = "green"
      });

      ASTAR.closedList.forEach(item => {
        const cell = this.findCell(item.x, item.y);
        cell.style.background = "red"
      });

      console.log(`### Goal: ${ASTAR.path.map(item => (`(${item.x}, ${item.y})`))}`);
    }

    // Mark Blue: Shortest path to the goal
    for (let i=0; i<ASTAR.path.length; i++) {
      const item = ASTAR.path[i];
      await delay(options.pathTrailingDelay);
      markNode(item.x, item.y, (i + 1) === ASTAR.path.length ? 'goal' : 'path');
    }
  };

  MapSearch.prototype.findCell = function(x, y) {
    return document.querySelector(`[x='${x}'][y='${y}']`)
  };

  function run() {
    const start = new Date();
    if (options.debug) console.log(`### AstarMap Start [${start}]`);

    const astarMap = document.querySelector("#astar-map");
    new MapSearch({ map: astarMap });

    if (options.debug) console.log(`### AstarMap End [${new Date().getTime() - start.getTime()}ms]`);
  }

  run();
 }());
