const debug = false;

const astar = {
  search: function({ graph, start, end }) {
    graph.cleanDirty();

    const openedList = [];
    const dirtyList = []; // Been calculated & marked list. It's for the clean the map in order to restart.

    openedList.push(start);

    while(openedList.length > 0) {
      const current = openedList.pop();

      if (current.x === end.x && current.y === end.y) {
        let path = [];
        let _n = current;
        path.push({ x: _n.x, y: _n.y });
        while(_n.parent) {
          _n = _n.parent;

          path.unshift({ x: _n.x, y: _n.y });

          if (_n.start) {
            _n.start = false;
            break;
          }
        }

        path.forEach((item, idx) => {
          // Mark Goal
          const cell = document.querySelector(`[x='${item.x}'][y='${item.y}']`);
          cell.style.background = "RGBA(55, 154, 214, 1.00)";
          cell.setAttribute("end", 1);

          // Mark Path
          if (path.length === idx + 1) {
            const cell = document.querySelector(`[x='${item.x}'][y='${item.y}']`);
            cell.style.background = "RGBA(12, 166, 120, 1.00)";
          }
        });

        if (debug) console.log(`### Goal: ${path.map(item => (`(${item.x}, ${item.y})`))}`);

        // Init Map Array in order to restart
        graph.map[start.x][start.y] = 0;
        graph.map[end.x][end.y] = 's';

        break;
      }

      current.closed = true;

      const neighbors = graph.neighbors(current);
      for (let i=0; i<neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.wall) {
          continue;
        }

        const gScore = current.g + neighbor.getCost(current);

        if (!neighbor.visited || gScore < neighbor.g) {
          neighbor.visited = true;
          neighbor.parent = current;
          neighbor.h = astar.heuristics.diagonal(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.h + neighbor.g;
          dirtyList.push(neighbor);

          openedList.push(neighbor);

          // Mark Visited
          if (debug) {
            const currentCell = document.querySelector(`[x='${neighbor.x}'][y='${neighbor.y}']`);
            currentCell.querySelector("#g").innerText = neighbor.g;
            currentCell.querySelector("#h").innerText = neighbor.h;
            currentCell.querySelector("#f").innerText = neighbor.f;
            currentCell.style.background = "green"
          }
        }

        openedList.sort((a, b) => {
          if (a.f < b.f) return 1;
          if (a.f > b.f) return -1;
          return 0;
        });
      }
    }

    return [];
  },
  heuristics: {
    diagonal: function(pos0, pos1) {
      var D = 10;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      const value = (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
      return Number(value.toFixed(0));
    }
  },
};

function Graph(nodes) {
  this.map = nodes;
  this.nodes = [];
  this.grid = [];

  for (let x=0; x<nodes.length; x++) {
    this.grid[x] = [];
    for (let y=0, row = nodes[x]; y<row.length; y++) {
      const node = new Node({ x, y, row });
      this.grid[x][y] = node;
      this.nodes.push(node);
    }
  }
}

Graph.prototype.initialize = function() {
  this.dirtyNodes = [];
};

Graph.prototype.neighbors = function(node) {
  const _neighbors = [];
  const x = node.x;
  const y = node.y;
  const grid = this.grid;
  let _node;

  // West
  _node = grid[x - 1] && grid[x - 1][y];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x - 1][y]);
  }

  // East
  _node = grid[x + 1] && grid[x + 1][y]
  if (_node && !_node.wall) {
    _neighbors.push(grid[x + 1][y]);
  }

  // South
  _node = grid[x] && grid[x][y - 1];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x][y - 1]);
  }

  // North
  _node = grid[x] && grid[x][y + 1];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x][y + 1]);
  }

  // Southwest
  _node = grid[x - 1] && grid[x - 1][y - 1];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x - 1][y - 1]);
  }

  // Southeast
  _node = grid[x + 1] && grid[x + 1][y - 1];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x + 1][y - 1]);
  }

  // Northwest
  _node = grid[x - 1] && grid[x - 1][y + 1];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x - 1][y + 1]);
  }

  // Northeast
  _node = grid[x + 1] && grid[x + 1][y + 1];
  if (_node && !_node.wall) {
    _neighbors.push(grid[x + 1][y + 1]);
  }

  return _neighbors;
};

Graph.prototype.cleanDirty = function() {
  this.nodes.forEach(node => {
    if (!node.start && !node.wall) {
      const cell = document.querySelector(`[x='${node.x}'][y='${node.y}']`);
      cell.style.background = '#fff';
      cell.querySelector('#g').innerText = '';
      cell.querySelector('#h').innerText = '';
      cell.querySelector('#f').innerText = '';
      node.clean();
    }
  });
};

function Node({ x, y, row }) {
  this.x = x;
  this.y = y;
  this.g = 0;
  this.h = 0;
  this.f = 0;
  this.start = false;
  this.end = false;
  this.visited = false;
  this.parent = null;
  this.closed = false;
  this.wall = false;

  if (row[y] === "s")
    this.start = true;
  if (row[y] === "e")
    this.end = true;
  if (row[y] === "w")
    this.wall = true;
}

Node.prototype.getCost = function(node) {
  if (node && node.x != this.x && node.y != this.y) {
    return 14;
  }
  return 10;
};
Node.prototype.clean = function() {
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.start = false;
  this.end = false;
  this.visited = false;
  this.closed = false;
  this.parent = null;
}
