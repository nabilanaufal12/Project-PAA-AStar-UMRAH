(function () {
  "use strict";

  class GraphNode {
    constructor(id, x, y, meta = {}) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.gridX = meta.gridX || 0;
      this.gridY = meta.gridY || 0;
      this.roadId = meta.roadId || "";
      this.blocked = false;
      this.edges = [];
    }
  }

  class Edge {
    constructor(from, to, weight, meta = {}) {
      this.from = from;
      this.to = to;
      this.weight = weight;
      this.roadId = meta.roadId || "";
      this.roadType = meta.roadType || "secondary";
      this.mode = meta.mode || "cardinal";
      this.disabled = false;
    }
  }

  class Graph {
    constructor() {
      this.nodes = new Map();
    }

    addNode(id, x, y, meta = {}) {
      if (!this.nodes.has(id)) {
        this.nodes.set(id, new GraphNode(id, x, y, meta));
      }
      return this.nodes.get(id);
    }

    getNode(id) {
      return this.nodes.get(id) || null;
    }

    addEdge(fromId, toId, weight, meta = {}) {
      const from = this.getNode(fromId);
      const to = this.getNode(toId);
      if (!from || !to || fromId === toId) return;

      const finalWeight = typeof weight === "number" ? weight : distance(from, to);
      if (!from.edges.some((edge) => edge.to === toId && edge.roadId === meta.roadId)) {
        from.edges.push(new Edge(fromId, toId, finalWeight, meta));
      }
      if (!to.edges.some((edge) => edge.to === fromId && edge.roadId === meta.roadId)) {
        to.edges.push(new Edge(toId, fromId, finalWeight, meta));
      }
    }

    nodeArray() {
      return Array.from(this.nodes.values());
    }

    availableNodes() {
      return this.nodeArray().filter((node) => !node.blocked && node.edges.some((edge) => !edge.disabled));
    }

    resetBlocks() {
      this.nodes.forEach((node) => {
        node.blocked = false;
        node.edges.forEach((edge) => {
          edge.disabled = false;
        });
      });
    }
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  window.RoadGraph = {
    Graph,
    GraphNode,
    Edge,
    distance,
  };
})();
