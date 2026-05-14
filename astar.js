// astar.js - Bagian Kontribusi Anggota 2 (Nabil)
  function runAStar(graph, startId, goalId, options = {}) {
    const start = graph.getNode(startId);
    const goal = graph.getNode(goalId);
    const t0 = performance.now();

    // 1. Logika Validasi Awal (Branching Awal)
    if (!start || !goal || start.blocked || goal.blocked) {
      return buildResult(false, [], [], 0, performance.now() - t0, 0, "Gagal", "Start/Goal tidak valid.");
    }

    // 2. Inisialisasi Struktur Data Pencarian
    const open = [startId]; // Open List
    const openSet = new Set(open);
    const closedSet = new Set(); // Closed List
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const visitedOrder = [];

    graph.nodes.forEach((_, nodeId) => {
      gScore.set(nodeId, Infinity);
      fScore.set(nodeId, Infinity);
    });

    gScore.set(startId, 0);
    fScore.set(startId, heuristicDistance(start, goal, options.heuristic));

    // 3. CORE TRAVERSAL: Perulangan Utama Pencarian
    while (open.length > 0) {
      const currentId = extractLowest(open, fScore);
      openSet.delete(currentId);
      const current = graph.getNode(currentId);

      if (!current || current.blocked) continue;
      visitedOrder.push(currentId);

      // Kondisi Berhenti (Goal Reached)
      if (currentId === goalId) {
        const path = reconstructPath(cameFrom, currentId);
        return buildResult(true, path, visitedOrder, gScore.get(goalId), performance.now() - t0, closedSet.size, "Berhasil", "Jalur ditemukan.");
      }

      closedSet.add(currentId);

      // BRANCHING: Eksplorasi Tetangga
      for (const edge of current.edges) {
        if (edge.disabled) continue; 

        const neighbor = graph.getNode(edge.to);
        if (!neighbor || neighbor.blocked || closedSet.has(edge.to)) continue;

        const tentativeG = gScore.get(currentId) + edge.weight;
        if (tentativeG < gScore.get(edge.to)) {
          cameFrom.set(edge.to, currentId);
          gScore.set(edge.to, tentativeG);
          fScore.set(edge.to, tentativeG + heuristicDistance(neighbor, goal, options.heuristic));

          if (!openSet.has(edge.to)) {
            open.push(edge.to);
            openSet.add(edge.to);
          }
        }
      }
    }
    return buildResult(false, [], visitedOrder, 0, performance.now() - t0, closedSet.size, "Gagal", "Tidak ada jalur.");
  }

  // Fungsi untuk merangkai jalur balik
  function reconstructPath(cameFrom, currentId) {
    const path = [currentId];
    while (cameFrom.has(currentId)) {
      currentId = cameFrom.get(currentId);
      path.unshift(currentId);
    }
    return path;
  }