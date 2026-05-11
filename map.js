function createMapModel(gridSize, activeObstacleIds) {
    const sampleStep = gridSize <= 10 ? 34 : gridSize <= 20 ? 23 : 16;
    const mergeRadius = gridSize <= 10 ? 12 : gridSize <= 20 ? 8 : 6;
    
    // 1. Inisialisasi struktur data Graph
    const graph = new window.RoadGraph.Graph();
    const nodeRefs = [];
    const activeIds = activeObstacleIds && activeObstacleIds.length ? activeObstacleIds : [];
    const activeObstacles = OBSTACLES.filter((obstacle) => activeIds.includes(obstacle.id));
    let nodeCounter = 0;

    // 2. Fungsi krusial untuk menggabungkan titik terdekat (mencegah duplikasi node)
    function getOrCreateNode(x, y, roadId) {
      for (const ref of nodeRefs) {
        const dx = ref.x - x;
        const dy = ref.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= mergeRadius) {
          return ref.id;
        }
      }

      const id = N${nodeCounter++};
      graph.addNode(id, x, y, {
        roadId,
        gridX: Math.round((x / VIEWBOX.width) * gridSize),
        gridY: Math.round((y / VIEWBOX.height) * gridSize),
      });
      nodeRefs.push({ id, x, y });
      return id;
    }

    // 3. Proses pengisian Adjacency List (Edges)
    const roads = ROAD_DEFINITIONS.map((road) => {
      const samples = sampleRoad(road.points, sampleStep);
      let previousId = null;

      for (const point of samples) {
        const currentId = getOrCreateNode(point[0], point[1], road.id);
        if (previousId && previousId !== currentId) {
          const a = graph.getNode(previousId);
          const b = graph.getNode(currentId);
          graph.addEdge(previousId, currentId, window.RoadGraph.distance(a, b), {
            roadId: road.id,
            roadType: road.type,
            mode: road.mode,
          });
        }
        previousId = currentId;
      }

      return {
        ...road,
        samples,
      };
    });

    // (Fungsi applyObstacles ini nanti akan dilanjutkan/dibuat oleh Anggota 4)
    if (typeof applyObstacles === "function") {
      applyObstacles(graph, activeObstacles);
    }

    return {
      gridSize,
      graph,
      roads,
      obstacles: OBSTACLES,
      activeObstacleIds: activeIds,
      activeObstacles,
      viewBox: VIEWBOX,
    };
  }
