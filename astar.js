
const astar = {
  search: function({ graph, start, end }) {
    graph.cleanDirty();
    console.log("### astar.search");
    console.log(graph);
    console.log(start);
    console.log(end);

    const openedList = [];
    const closedList = [];
    const dirtyList = [];

    openedList.push(start);

    while(openedList.length > 0) {
      const current = openedList.pop();
      closedList.push(current);

      if (current.x === end.x && current.y === end.y) {
        console.log("### Goal");
        console.log(current);

        let path = [];
        let _n = current;
        path.push({ x: _n.x, y: _n.y });
        while(_n.parent) {
          _n = _n.parent;

          path.unshift({ x: _n.x, y: _n.y });

          if (_n.x === start.x && _n.y === start.y) {
            break;
          }
        }
        console.log(path);

        path.forEach(item => {
          const cell = document.querySelector(`[x='${item.x}'][y='${item.y}']`);
          cell.style.background = "red";
        });

        break;
      }

      current.closed = true;

      const neighbors = graph.neighbors(current);
      console.log(neighbors);
      for (let i=0; i<neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.wall) {
          console.log("wall");
          console.log(neighbor);
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

          const currentCell = document.querySelector(`[x='${neighbor.x}'][y='${neighbor.y}']`);
          currentCell.querySelector("#g").innerText = neighbor.g;
          currentCell.querySelector("#h").innerText = neighbor.h;
          currentCell.querySelector("#f").innerText = neighbor.f;
          currentCell.style.background = "green"
          console.log(neighbor);
        } else {

        }

        openedList.sort((a, b) => {
          if (a.f > b.f) return -1;
          if (a.f < b.f) return 1;
          return 0;
        });
      }
    }

    return [];
  },
  heuristics: {
    diagonal: function(pos0, pos1) {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      const value = (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
      return Number(value.toFixed(0));
    }
  },
};

function Graph(nodes) {
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

/*
Graph.prototype.neighbors = function(node) {
  const _neighbors = [];
  const x = node.x;
  const y = node.y;
  const grid = this.grid;

  // West
  if (grid[x - 1] && grid[x - 1][y]) {
    _neighbors.push(grid[x - 1][y]);
  }

  // East
  if (grid[x + 1] && grid[x + 1][y]) {
    _neighbors.push(grid[x + 1][y]);
  }

  // South
  if (grid[x] && grid[x][y - 1]) {
    _neighbors.push(grid[x][y - 1]);
  }

  // North
  if (grid[x] && grid[x][y + 1]) {
    _neighbors.push(grid[x][y + 1]);
  }

  // Southwest
  if (grid[x - 1] && grid[x - 1][y - 1]) {
    _neighbors.push(grid[x - 1][y - 1]);
  }

  // Southeast
  if (grid[x + 1] && grid[x + 1][y - 1]) {
    _neighbors.push(grid[x + 1][y - 1]);
  }

  // Northwest
  if (grid[x - 1] && grid[x - 1][y + 1]) {
    _neighbors.push(grid[x - 1][y + 1]);
  }

  // Northeast
  if (grid[x + 1] && grid[x + 1][y + 1]) {
    _neighbors.push(grid[x + 1][y + 1]);
  }

  return _neighbors;
};
 */

Graph.prototype.cleanDirty = function() {
  // for (var i = 0; i < this.dirtyNodes.length; i++) {
  //   astar.cleanNode(this.dirtyNodes[i]);
  // }
  this.dirtyNodes = [];
};

function Node({ x, y, row }) {
  this.x = x;
  this.y = y;
  this.g = 0;
  this.h = 0;
  this.f = 0;
  this.visited = false;
  this.parent = null;
  this.closed = false;
  this.wall = false;

  if (row[y] === "w") {
    this.wall = true;
  }
}

Node.prototype.getCost = function(node) {
  if (node && node.x != this.x && node.y != this.y) {
    return 14;
  }
  return 10;
};

/*
Node.prototype.getCost = function(node) {
  if (node && node.x != this.x && node.y != this.y) {
    return 1.41421.toFixed(0);
  }
  return 1;
};
*/
