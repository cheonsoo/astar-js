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

  // Default options
  const options = {
    // Map Options
    mapSizeX: 40,
    mapSizeY: 40,
    wallFrequency: 10, // Walls are the lower, the more
    keepTrackingPath: false, // Make the path remains marked
    pathHideDelay: 500,
    pathTrailingDelay: 10,
    debug: false,

    // Search Options
    allowDiagonal: false
  };

  function MapSearch({ map, options }) {
    this.map = map;
    this.options = options;
    // this.generateMap();
    this.getMap();
    this.initialize();

    const ASTAR = new Astar(this.nodes, this.options);
    this.ASTAR = ASTAR;
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
      if (self.options.mapSizeX <= 10) {
        _cell.style.width = '80px';
        _cell.style.height = '80px';
      } else if (self.options.mapSizeX <= 20) {
        _cell.style.width = '40px';
        _cell.style.height = '40px';
      } else {
        _cell.style.width = '20px';
        _cell.style.height = '20px';
      }

      let nodeType = "n";
      if (self.nodes[x][y] === "s") {
        nodeTpye = "s";
        _cell.classList.add("start");
        self.start = { x, y };
      } else if (self.nodes[x][y] === "e") {
        nodeType = "e";
        _cell.classList.add("end");
      } else if (self.nodes[x][y] === "w") {
        nodeType = "w";
        _cell.classList.add("wall");
      }

      _cell.addEventListener("click", () => {
        const started = new Date();
        if (self.options.debug) console.log(`### clicked: nodeType: ${nodeTypeDef[nodeType]}, x: ${x}, y: ${y}`);

        // const ASTAR = new Astar(self.nodes, self.options);
        const start = self.start;
        const end = { x, y };

        if (self.nodes[x][y] === 'w') {
          console.log('wall');
          return;
        }

        const result = self.ASTAR.search({ start, end, map: self.nodes });

        // self.animatePath(JSON.parse(JSON.stringify(result)));
        if (!result || !result.path) {
          console.log('no path');
          return;
        }

        self.animatePath(result);

        // const _end = path[path.length - 1];
        self.start = { x: end.x, y: end.y };
        /*
        const path = result.path;
        console.log(path);
        const s = path[0];
        const e = path[path.length - 1];
        self.nodes[s.x][s.y] = 0;
        self.nodes[e.x][e.y] = 's';
        self.start = { x: e.x, y: e.y };
        */
        // self.ASTAR.initStart(s, e, self.nodes);

        if(self.options.debug) console.log(`### Took: ${new Date() - started}ms`);
      });
    }

    function Row({ x }) {
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
      this.attr("x", x);
    }

    const generateGrid = () => {
      for (let x=0; x<this.options.mapSizeX; x++) {
        const row = new Row({ x });

        const nodeRow = [];
        const gridRow = [];

        for (let y=0; y<this.options.mapSizeY; y++) {
          const cell = new Cell({ x, y});
          row.append(cell.element());
        }

        this.map.appendChild(row.element());
      }
    }

    generateGrid();
  };

  MapSearch.prototype.initOptions = function() {
    this.options.debug = document.querySelector("#options-container #option-debug").value;
  };

  /**
   * Generate Map with Walls
   * s: Start
   * e: End
   * w: Wall
   */
  MapSearch.prototype.generateMap = function() {
    const nodes = [];

    for (let x=0; x<this.options.mapSizeX; x++) {
      nodes[x] = [];
      for (let y=0, row=nodes[x]; y<this.options.mapSizeY; y++) {
        const isWall = Math.floor(Math.random()*(this.options.wallFrequency)) === 0;
        row[y] = isWall ? 'w' : 0;
      }
    }

    // Set Start Point
    const x = Math.floor(Math.random() * this.options.mapSizeX);
    const y = Math.floor(Math.random() * this.options.mapSizeY);
    nodes[x][y] = 's';

    this.nodes = nodes;
  };

  MapSearch.prototype.getMap = function() {
    this.nodes = map3;
  };

  MapSearch.prototype.animatePath = async function(result) {
    if (!result.path || !result.path.length) return;

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
        if (!this.options.keepTrackingPath) {
          setTimeout(function() {
            cell.style.background = prevColor;
          }, this.options.pathHideDelay);
        }
      }
    };

    markNode(result.path[0].x, result.path[0].y, 'start');

    if (this.options.debug) {
      // Mark Green: Cost evaluated
      result.dirtyList.forEach(item => {
        const cell = this.findCell(item.x, item.y);
        cell.querySelector("#g").innerText = item.g;
        cell.querySelector("#h").innerText = item.h;
        cell.querySelector("#f").innerText = item.f;
        cell.style.background = "green"
      });

      result.closedList.forEach(item => {
        const cell = this.findCell(item.x, item.y);
        cell.style.background = "red";
      });

      console.log(`### Goal: ${result.path.map(item => (`(${item.x}, ${item.y})`))}`);
    }

    // Mark Blue: Shortest path to the goal
    for (let i=0; i<result.path.length; i++) {
      const item = result.path[i];
      await delay(this.options.pathTrailingDelay);
      markNode(item.x, item.y, (i + 1) === result.path.length ? 'goal' : 'path');
    }

    // const path = result.path;
    // const start = path[0];
    // const end = path[path.length - 1];
    // this.ASTAR.initStart({ start, end, map: this.nodes });
    // this.ASTAR.initStart();
  };

  MapSearch.prototype.findCell = function(x, y) {
    return document.querySelector(`[x='${x}'][y='${y}']`)
  };

  function run() {
    const start = new Date();
    if (options.debug) console.log(`### AstarMap Start [${start}]`);

    const astarMap = document.querySelector("#astar-map");
    const _MapSearch = new MapSearch({ map: astarMap, options });
    window.MapSearch = _MapSearch;

    if (options.debug) console.log(`### AstarMap End [${new Date().getTime() - start.getTime()}ms]`);
  }
  window.run = run;
  window.run();
}());

function handleChangeOptions(evt) {
  const id = evt.target.id;
  let value = evt.target.value;
  if (!value) {
    alert('no value');
    return;
  }

  if (typeof value === 'boolean')
    value = JSON.parse(value);
  if (!isNaN(value))
    value = parseInt(value);

  console.log(`### id: ${id}, value: ${value}`);
  window.MapSearch.options[id] = value;
}

let isHideOptions = true;
function handleClickHideOptions(evt) {
  isHideOptions = !isHideOptions;
  document.querySelector("#options-container #options").style.display = isHideOptions ? 'none' : 'block';
}

function resetWalls(event) {
  const value = event.target.value;
  window.MapSearch.options.wallFrequency = value;
  window.run();
}

function redrawMap(event) {
  console.log(event);
  const x = document.querySelector("#mapSizeX").value;
  const y = document.querySelector("#mapSizeY").value;
  window.MapSearch.options.mapSizeX = parseInt(x);
  window.MapSearch.options.mapSizeY = parseInt(y);
  window.run();
}
