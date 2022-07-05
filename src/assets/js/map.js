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
    mapSizeX: 20,
    mapSizeY: 20,
    wallFrequency: 10, // Walls are the lower, the more
    keepTrackingPath: false, // Make the path remains marked
    pathHideDelay: 500,
    pathTrailingDelay: 100,
    animatedSearch: true,
    neighborSearchDelay: 200,
    debug: true,

    // Search Options
    allowDiagonal: true,
    customMap: ''
  };

  function MapSearch({ map, options }) {

    window.mobileCheck = function() {
      let check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };
    // console.log(window.mobileCheck());

    this.isMobile = window.mobileCheck();

    this.map = map;
    this.options = options;

    if (options.customMap) {
      this.getMap();
    } else {
      this.generateMap();
    }

    this.setCellSize();

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
      this.attr("id", `cell_${x}_${y}`).attr("x", x).attr("y", y).attr("title", `x: ${x}, y: ${y}`);

      _cell.style.width = self.cellWidth + 'px';
      _cell.style.height = self.cellHeight + 'px';

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

        const ASTAR = new Astar(self.nodes, self.options);
        const start = self.start;
        const end = { x, y };

        if (self.nodes[x][y] === 'w') {
          console.log('wall');
          return;
        }

        self.initialize();

        const result = ASTAR.search({ start, end, map: self.nodes });

        if (self.options.debug) {
          console.log('options: ', self.options);
          console.log(`start: x: ${start.x}, y: ${start.y}`);
          console.log(`end: x: ${end.x}, y: ${end.y}`);
          console.log('map', self.nodes);
          console.log(result.path);
        }

        // self.animatePath(JSON.parse(JSON.stringify(result)));
        if (!result || !result.path) {
          console.log('no path');
          return;
        }

        // console.log('result', result);
        if (self.options.animatedSearch)
          self.animatePath2(result);
        else
          self.animatePath(result);

        self.start = { x: end.x, y: end.y };

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

  MapSearch.prototype.setCellSize = function() {
    const padding = 20;
    const clientWidth = document.body.clientWidth - padding * 2;
    const cellSize = Math.floor(clientWidth / options.mapSizeX);
    this.cellWidth = cellSize;
    this.cellHeight = cellSize;

    /*
    if (this.isMobile) {
      const clientWidth = document.body.clientWidth;
      const cellSize = Math.floor(clientWidth / options.mapSizeX);
      this.cellWidth = cellSize;
      this.cellHeight = cellSize;
    } else {
      if (self.options.mapSizeX <= 10) {
        this.cellWidth = '80px';
        this.cellHeight = '80px';
      } else if (self.options.mapSizeX <= 20) {
        this.cellWidth = '40px';
        this.cellHeight = '40px';
      } else {
        this.cellWidth = '20px';
        this.cellHeight = '20px';
      }
    }
    */
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
    this.nodes = customMaps[options.customMap].map;
    this.options.mapSizeX = customMaps[options.customMap].size;
    this.options.mapSizeY = customMaps[options.customMap].size;
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
        cell.style.background = this.options.debug ? 'orange' : '#ffffff';
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

      markNode(result.path[0].x, result.path[0].y, 'start');

      console.log(`### Goal: ${result.path.map(item => (`(${item.x}, ${item.y})`))}`);
    }

    // Mark Blue: Shortest path to the goal
    for (let i=0; i<result.path.length; i++) {
      const item = result.path[i];
      await delay(this.options.pathTrailingDelay);
      markNode(item.x, item.y, (i + 1) === result.path.length ? 'goal' : 'path');
    }
  };

  MapSearch.prototype.animatePath2 = async function(result) {
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
        cell.style.background = this.options.debug ? 'orange' : '#ffffff';
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

    if (this.options.debug) {
      for (let a=0; a<result.animateList.length; a++) {
        const item = result.animateList[a];
        const node = item[0];
        const neighbors = item[1];

        const el = this.findCell(node.x, node.y);
        el.style.backgroundColor = 'red';

        neighbors.forEach(n => {
          const cell = this.findCell(n.x, n.y);
          cell.querySelector("#g").innerText = n.g;
          cell.querySelector("#h").innerText = n.h;
          cell.querySelector("#f").innerText = n.f;
          cell.style.backgroundColor = 'green';
        });

        await delay(this.options.neighborSearchDelay);
      }

      console.log(`### Goal: ${result.path.map(item => (`(${item.x}, ${item.y})`))}`);
    }

    // Mark Blue: Shortest path to the goal
    for (let i=0; i<result.path.length; i++) {
      const item = result.path[i];
      await delay(this.options.pathTrailingDelay);
      if (i === 0) {
        markNode(item.x, item.y, 'start');
      } else {
        markNode(item.x, item.y, (i + 1) === result.path.length ? 'goal' : 'path');
      }
    }
  };

  MapSearch.prototype.findCell = function(x, y) {
    return document.querySelector(`[x='${x}'][y='${y}']`)
  };

  function run() {
    const start = new Date();
    if (window.options.debug) console.log(`### AstarMap Start [${start}]`);

    const astarMap = document.querySelector("#astar-map");
    const _MapSearch = new MapSearch({ map: astarMap, options });
    window.MapSearch = _MapSearch;

    if (window.options.debug) console.log(`### AstarMap End [${new Date().getTime() - start.getTime()}ms]`);
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

  if (value === 'true' || value === 'false')
    value = JSON.parse(value);
  if (!isNaN(value))
    value = parseInt(value);

  console.log(`### id: ${id}, value: ${value}`);
  window.MapSearch.options[id] = value;
}

function handleChangeMapSize(evt) {
  let value = evt.target.value;

  if (value === '10x10') {
    window.MapSearch.options['mapSizeX'] = 10;
    window.MapSearch.options['mapSizeY'] = 10;
  } else if (value === '20x20') {
    window.MapSearch.options['mapSizeX'] = 20;
    window.MapSearch.options['mapSizeY'] = 20;
  } else if (value === '40x40') {
    window.MapSearch.options['mapSizeX'] = 40;
    window.MapSearch.options['mapSizeY'] = 40;
  }
}

function handleChangeCustomMap(evt) {
  let value = evt.target.value;
  window.MapSearch.options.customMap = value;
}

let isHideOptions = false;
function handleClickHideOptions(evt) {
  document.querySelector("#options-container #options").style.display = isHideOptions ? 'none' : 'block';
  isHideOptions = !isHideOptions;
}

function resetWalls(event) {
  const value = event.target.value;
  window.MapSearch.options.wallFrequency = value;
  window.run();
}

function redrawMap(event) {
  // console.log(event);
  // const x = document.querySelector("#mapSizeX").value;
  // const y = document.querySelector("#mapSizeY").value;
  // window.MapSearch.options.mapSizeX = parseInt(x);
  // window.MapSearch.options.mapSizeY = parseInt(y);
  run();
}
