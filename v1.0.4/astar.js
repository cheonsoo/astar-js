/**
 * V1.0.4
 * @author Chance
 */
function Astar(nodes, options) {
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

      if (node.start)
        this.startNode = node;
    }
  }
}

Astar.prototype.initialize = function() {
  this.cleanDirty();
};

Astar.prototype.search = function({ x, y }) {
  this.initialize();

  const openedList = [];
  this.dirtyList = []; // list been calculated & marked list. It's for the clean the map in order to restart. !!! Not using right now. find the way

  const startNode = this.getStartNode();
  openedList.push(startNode);
  const endNode = this.getEndNode(x, y);

  if (endNode.wall) { // When the goal is wall
    if(this.options.debug) console.log('You cannot move to a wall.');
    return [];
  }

  while(openedList.length > 0) {
    const currentNode = openedList.pop(); // Get the node that has least F cost.
    this.closedList.push(currentNode);

    // When it reaches the goal
    if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
      let _n = currentNode;
      this.path.push({ x: _n.x, y: _n.y });
      while(_n.parent) {
        _n = _n.parent;

        this.path.unshift({ x: _n.x, y: _n.y });

        if (_n.start) {
          _n.start = false;
          break;
        }
      }

      // Init Map Array in order to restart
      this.map[startNode.x][startNode.y] = 0;
      this.map[endNode.x][endNode.y] = 's';

      break;
    }

    currentNode.closed = true;

    const neighbors = this.neighbors(currentNode);
    for (let i=0; i<neighbors.length; i++) {
      const neighbor = neighbors[i];

      if (neighbor.wall) {
        continue;
      }

      const gScore = currentNode.g + neighbor.getCost(currentNode);

      if (!neighbor.visited || gScore < neighbor.g) {
        neighbor.visited = true;
        neighbor.parent = currentNode;
        neighbor.h = this.heuristics(neighbor, endNode, 'pythagoras');
        neighbor.g = gScore;
        neighbor.f = neighbor.h + neighbor.g;

        openedList.push(neighbor);
        this.dirtyList.push(neighbor);
      }

      if (neighbor.visited) {
        // this.rescore(neighbor);
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
}

Astar.prototype.getStartNode = function() {
  return this.startNode;
};

Astar.prototype.getEndNode = function(x, y) {
  return this.nodes.find(node => node.x === x && node.y === y);
};

Astar.prototype.neighbors = function(node) {
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

  // Allow diagonal search
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

Astar.prototype.heuristics = function(neighbor, end, method) {
  const algorithm = {
    pythagoras: function(pos0, pos1) { // pos0: neighbor, pos1: end
      const xDistance = Math.abs(pos1.x - pos0.x);
      const yDistance = Math.abs(pos1.y - pos0.y);
      const targetDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2)) * 10;
      return Number(targetDistance.toFixed(0));
    },
    diagonal: function(pos0, pos1) {
      const D = 10;
      const D2 = Math.sqrt(20);
      const d1 = Math.abs(pos1.x - pos0.x);
      const d2 = Math.abs(pos1.y - pos0.y);
      const value = (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
      return Number(value.toFixed(0));
    }
  };

  let value = 0;
  switch (method) {
    case 'pythagoras':
      value = algorithm.pythagoras(neighbor, end);
      break;
    case 'diagonal':
      value = algorithm.diagonal(neighbor, end);
      break;
    default:
      value = algorithm.pythagoras(neighbor, end);
      break;
  }
  return value;
};

Astar.prototype.cleanDirty = function() {
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

Astar.prototype.rescore = function(n) {}; // TODO

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
