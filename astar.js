(function () {
  "use strict";

  function heuristicDistance(a, b, type) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);

    if (type === "manhattan") return dx + dy;
    if (type === "chebyshev") return Math.max(dx, dy);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function edgeAllowed(edge, heuristicType) {
    if (heuristicType === "manhattan" && edge.mode === "diagonal") return false;
    return true;
  }

  function runAStar(graph, startId, goalId, options = {}) {
    const heuristicType = options.heuristic || "euclidean";
    const start = graph.getNode(startId);
    const goal = graph.getNode(goalId);
    const t0 = performance.now();

    if (!start || !goal) {
      return buildResult(
        false,
        [],
        [],
        0,
        performance.now() - t0,
        0,
        "Gagal menemukan jalur",
        "Start node atau goal node tidak valid."
      );
    }

    if (start.blocked || goal.blocked) {
      return buildResult(
        false,
        [],
        [],
        0,
        performance.now() - t0,
        0,
        "Gagal menemukan jalur",
        "Start atau goal berada pada area obstacle / area tertutup."
      );
    }

    if (startId === goalId) {
      return buildResult(
        true,
        [startId],
        [startId],
        0,
        performance.now() - t0,
        1,
        "Berhasil",
        "Start dan goal berada pada node yang sama."
      );
    }

    const open = [startId];
    const openSet = new Set(open);
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const visitedOrder = [];

    graph.nodes.forEach((_, nodeId) => {
      gScore.set(nodeId, Infinity);
      fScore.set(nodeId, Infinity);
    });

    gScore.set(startId, 0);
    fScore.set(startId, heuristicDistance(start, goal, heuristicType));

    while (open.length > 0) {
      const currentId = extractLowest(open, fScore);
      openSet.delete(currentId);
      const current = graph.getNode(currentId);

      if (!current || current.blocked) continue;
      visitedOrder.push(currentId);

      if (currentId === goalId) {
        const path = reconstructPath(cameFrom, currentId);
        const elapsed = performance.now() - t0;
        return buildResult(
          true,
          path,
          visitedOrder,
          gScore.get(goalId),
          elapsed,
          closedSet.size,
          "Berhasil",
          "Jalur berhasil ditemukan dari start ke goal."
        );
      }

      closedSet.add(currentId);

      for (const edge of current.edges) {
        if (edge.disabled || !edgeAllowed(edge, heuristicType)) continue;

        const neighbor = graph.getNode(edge.to);
        if (!neighbor || neighbor.blocked || closedSet.has(edge.to)) continue;

        const tentativeG = gScore.get(currentId) + edge.weight;
        if (tentativeG < gScore.get(edge.to)) {
          cameFrom.set(edge.to, currentId);
          gScore.set(edge.to, tentativeG);
          fScore.set(edge.to, tentativeG + heuristicDistance(neighbor, goal, heuristicType));

          if (!openSet.has(edge.to)) {
            open.push(edge.to);
            openSet.add(edge.to);
          }
        }
      }
    }

    const elapsed = performance.now() - t0;

    let reason = "Tidak ada jalur yang menghubungkan start ke goal.";
    if (heuristicType === "manhattan") {
      reason = "Jalur gagal ditemukan karena koneksi yang tersedia tidak memenuhi batas gerak 4 arah Manhattan, atau terhalang obstacle.";
    } else {
      reason = "Jalur gagal ditemukan karena node-node penghubung terputus oleh obstacle atau tidak ada koneksi yang mencapai goal.";
    }

    return buildResult(
      false,
      [],
      visitedOrder,
      0,
      elapsed,
      closedSet.size,
      "Gagal menemukan jalur",
      reason
    );
  }

  function extractLowest(open, fScore) {
    let bestIndex = 0;
    let bestValue = fScore.get(open[0]) ?? Infinity;

    for (let i = 1; i < open.length; i += 1) {
      const score = fScore.get(open[i]) ?? Infinity;
      if (score < bestValue) {
        bestValue = score;
        bestIndex = i;
      }
    }

    const [bestId] = open.splice(bestIndex, 1);
    return bestId;
  }

  function reconstructPath(cameFrom, currentId) {
    const path = [currentId];
    while (cameFrom.has(currentId)) {
      currentId = cameFrom.get(currentId);
      path.unshift(currentId);
    }
    return path;
  }

  function buildResult(success, path, visitedOrder, pathCost, timeMs, expandedCount, message, reason) {
    return {
      success,
      path,
      visitedOrder,
      pathCost,
      timeMs,
      expandedCount,
      steps: path.length > 0 ? path.length - 1 : 0,
      message,
      reason,
    };
  }

  window.AStar = {
    runAStar,
    heuristicDistance,
  };
})();