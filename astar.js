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

  // 1. Fungsi Kalkulasi Heuristik (The Greedy Component)
  // Menghitung perkiraan jarak tersisa dari node saat ini ke tujuan
  function heuristicDistance(a, b, type) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);

    // Manhattan: Cocok untuk pergerakan grid 4 arah (horizontal/vertikal)
    if (type === "manhattan") return dx + dy;
    
    // Chebyshev: Cocok jika pergerakan diagonal biayanya sama dengan lurus
    if (type === "chebyshev") return Math.max(dx, dy);
    
    // Euclidean (Default): Jarak garis lurus nyata (Pythagoras)
    return Math.sqrt(dx * dx + dy * dy); 
  }

  // 2. Fungsi Pengambilan Keputusan (Greedy Choice)
  // Mengambil node dengan nilai f-score paling kecil dari Open List
  function extractLowest(open, fScore) {
    let bestIndex = 0;
    let bestValue = fScore.get(open[0]) ?? Infinity;

    for (let i = 1; i < open.length; i += 1) {
      const score = fScore.get(open[i]) ?? Infinity;
      // Selalu "rakus" (greedy) mengambil nilai terendah
      if (score < bestValue) {
        bestValue = score;
        bestIndex = i;
      }
    }

    // Mengeluarkan node terbaik dari array open list dan mengembalikannya
    const [bestId] = open.splice(bestIndex, 1);
    return bestId;
  }