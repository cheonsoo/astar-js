const astar = {
  search: function({ graph, start, end }) {
    graph.cleanDirty();

    const openedList = [];
    graph.dirtyList = []; // Been calculated & marked list. It's for the clean the map in order to restart. !!! Not using right now. find the way

    openedList.push(start);

    const endNode = graph.nodes.find(item => item.x === end.x && item.y === end.y);
    if (endNode.wall) { // When the goal is wall
      if(this.options.debug) console.log('You cannot move to a wall.');
      return [];
    }

    while(openedList.length > 0) {
      const current = openedList.pop(); // Get the node that has least F cost.
      graph.closedList.push(current);

      // When it reaches the goal
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

        // Init Map Array in order to restart
        graph.map[start.x][start.y] = 0;
        graph.map[end.x][end.y] = 's';

        graph.path = path;

        return path;
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
          neighbor.h = astar.heuristics.pythagoras(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.h + neighbor.g;

          openedList.push(neighbor);
          graph.dirtyList.push(neighbor);
        }

        if (neighbor.visited) {
          // graph.rescore(neighbor);
        }

        // Sorting opendList in order to pop the least F cost in the next loop.
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
    pythagoras: function(neighbor, end) {
      const xDistance = Math.abs(end.x - neighbor.x);
      const yDistance = Math.abs(end.y - neighbor.y);
      const targetDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2)) * 10;
      return Number(targetDistance.toFixed(0));
    },
    diagonal: function(pos0, pos1) { // pos0: neighbor, pos1: end
      const D = 10;
      const D2 = Math.sqrt(20);
      const d1 = Math.abs(pos1.x - pos0.x);
      const d2 = Math.abs(pos1.y - pos0.y);st
      const value = (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
      return Number(value.toFixed(0));
    }
  },
};

function Graph(nodes, options) {
  this.map = nodes;
  this.nodes = [];
  this.grid = [];
  this.dirtyList = []; // All the evaluated nodes, to be marked as green
  this.closedList = []; // All the visited nodes, to be marked as red
  this.path = [];
  this.options = options;

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
  if (_node && !_node.wall && !_node.visited) {
    _neighbors.push(grid[x - 1][y]);
  }

  // East
  _node = grid[x + 1] && grid[x + 1][y]
  if (_node && !_node.wall && !_node.visited) {
    _neighbors.push(grid[x + 1][y]);
  }

  // South
  _node = grid[x] && grid[x][y - 1];
  if (_node && !_node.wall && !_node.visited) {
    _neighbors.push(grid[x][y - 1]);
  }

  // North
  _node = grid[x] && grid[x][y + 1];
  if (_node && !_node.wall && !_node.visited) {
    _neighbors.push(grid[x][y + 1]);
  }

  if (this.options.allowDiagonal) {
    // Southwest
    _node = grid[x - 1] && grid[x - 1][y - 1];
    if (_node && !_node.wall && !_node.visited) {
      _neighbors.push(grid[x - 1][y - 1]);
    }

    // Southeast
    _node = grid[x + 1] && grid[x + 1][y - 1];
    if (_node && !_node.wall && !_node.visited) {
      _neighbors.push(grid[x + 1][y - 1]);
    }

    // Northwest
    _node = grid[x - 1] && grid[x - 1][y + 1];
    if (_node && !_node.wall && !_node.visited) {
      _neighbors.push(grid[x - 1][y + 1]);
    }

    // Northeast
    _node = grid[x + 1] && grid[x + 1][y + 1];
    if (_node && !_node.wall && !_node.visited) {
      _neighbors.push(grid[x + 1][y + 1]);
    }
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

Graph.prototype.rescore = function(n) {};

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
  // if (row[y] === "e")
  //   this.end = true;
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
