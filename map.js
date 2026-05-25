(function () {
  "use strict";

  const VIEWBOX = { width: 440, height: 415 };
  const ISLAND_PATH_D = "M 110.0,409.5 L 103.5,404.0 L 125.5,377.0 L 118.0,364.5 L 112.0,364.5 L 95.0,373.5 L 82.0,374.5 L 42.0,367.5 L 28.0,358.5 L 14.5,341.0 L 7.5,326.0 L 5.5,312.0 L 8.5,295.0 L 19.5,277.0 L 145.5,124.0 L 145.5,117.0 L 140.0,113.5 L 94.0,112.5 L 91.5,109.0 L 95.5,103.0 L 94.5,99.0 L 84.5,91.0 L 88.0,87.5 L 146.0,88.5 L 150.5,92.0 L 139.5,102.0 L 147.0,110.5 L 153.0,110.5 L 180.5,77.0 L 181.5,71.0 L 175.0,64.5 L 152.0,64.5 L 147.5,50.0 L 155.0,38.5 L 181.0,38.5 L 185.0,42.5 L 191.0,42.5 L 200.5,26.0 L 196.5,20.0 L 199.0,16.5 L 209.0,15.5 L 214.0,18.5 L 234.0,15.5 L 243.0,21.5 L 334.0,11.5 L 348.0,17.5 L 401.0,56.5 L 407.0,56.5 L 414.0,50.5 L 422.0,50.5 L 429.5,58.0 L 427.5,67.0 L 419.5,79.0 L 431.5,108.0 L 430.5,138.0 L 418.5,181.0 L 396.5,221.0 L 329.0,262.5 L 324.5,269.0 L 332.5,277.0 L 330.0,280.5 L 290.0,285.5 L 266.0,319.5 L 261.5,317.0 L 262.5,313.0 L 283.5,280.0 L 280.5,273.0 L 274.0,268.5 L 187.0,318.5 L 183.5,324.0 L 190.0,333.5 L 196.0,333.5 L 209.0,325.5 L 213.5,328.0 L 210.0,333.5 L 197.0,341.5 L 170.0,354.5 L 167.5,352.0 L 183.5,337.0 L 181.5,331.0 L 175.0,326.5 L 138.0,347.5 L 127.5,362.0 L 134.5,372.0 L 135.5,381.0 L 110.0,409.5 Z";

  const ROAD_DEFINITIONS = [
    {
      id: "mainSpine",
      name: "Jalan Utama Pulau",
      type: "primary",
      mode: "cardinal",
      points: [[80, 345], [115, 320], [150, 285], [185, 250], [220, 210], [260, 170], [305, 125], [350, 82], [385, 65]],
    },
    {
      id: "westHarborLoop",
      name: "Loop Barat",
      type: "secondary",
      mode: "cardinal",
      points: [[75, 346], [52, 336], [44, 310], [67, 285], [105, 250], [145, 225]],
    },
    {
      id: "westConnector",
      name: "Konektor Barat",
      type: "tertiary",
      mode: "cardinal",
      points: [[115, 320], [95, 300], [91, 275], [113, 245], [145, 225]],
    },
    {
      id: "southLoop",
      name: "Loop Selatan",
      type: "secondary",
      mode: "cardinal",
      points: [[95, 348], [125, 338], [150, 318], [150, 285]],
    },
    {
      id: "centralBend",
      name: "Jalan Tengah Selatan",
      type: "secondary",
      mode: "cardinal",
      points: [[150, 285], [178, 302], [211, 286], [252, 260], [300, 232], [345, 205]],
    },
    {
      id: "centralEast",
      name: "Jalan Tengah Timur",
      type: "secondary",
      mode: "cardinal",
      points: [[185, 250], [217, 230], [250, 228], [285, 215], [325, 185], [370, 160]],
    },
    {
      id: "northArc",
      name: "Lengkung Utara",
      type: "secondary",
      mode: "cardinal",
      points: [[260, 170], [284, 145], [310, 140], [348, 126], [386, 108]],
    },
    {
      id: "upperLoop",
      name: "Loop Pesisir Utara",
      type: "tertiary",
      mode: "cardinal",
      points: [[305, 125], [292, 96], [320, 68], [350, 46], [382, 57], [397, 85]],
    },
    {
      id: "eastCoast",
      name: "Pesisir Timur",
      type: "secondary",
      mode: "cardinal",
      points: [[350, 82], [380, 93], [405, 122], [405, 155], [385, 188], [348, 212]],
    },
    {
      id: "midWest",
      name: "Jalan Budaya Barat",
      type: "tertiary",
      mode: "cardinal",
      points: [[185, 250], [156, 230], [142, 204], [160, 170], [194, 130]],
    },
    {
      id: "northWestConnector",
      name: "Konektor Utara Barat",
      type: "tertiary",
      mode: "cardinal",
      points: [[194, 130], [235, 116], [280, 120], [305, 125]],
    },
    {
      id: "centerCross",
      name: "Konektor Pusat",
      type: "tertiary",
      mode: "diagonal",
      points: [[220, 210], [243, 193], [270, 188], [303, 178], [325, 185]],
    },
    {
      id: "lowerConnector",
      name: "Konektor Selatan",
      type: "tertiary",
      mode: "diagonal",
      points: [[130, 315], [165, 300], [190, 278], [225, 255]],
    },
    {
      id: "diagWestCenter",
      name: "Diagonal Barat-Tengah",
      type: "tertiary",
      mode: "diagonal",
      points: [[145, 225], [165, 235], [185, 250]],
    },
    {
      id: "diagCenterEast",
      name: "Diagonal Tengah-Timur",
      type: "tertiary",
      mode: "diagonal",
      points: [[252, 260], [265, 238], [285, 215]],
    },
    {
      id: "diagNorthEast",
      name: "Diagonal Utara-Timur",
      type: "tertiary",
      mode: "diagonal",
      points: [[310, 140], [320, 162], [325, 185]],
    },
  ];

  const OBSTACLES = [
    {
      id: "centralGarden",
      label: "Taman Pusat",
      type: "park",
      polygon: [[210, 190], [245, 170], [272, 188], [260, 222], [225, 232], [205, 215]],
    },
    {
      id: "heritageBlock",
      label: "Blok Bangunan Utara",
      type: "building",
      polygon: [[315, 110], [345, 90], [367, 105], [350, 135], [320, 137], [305, 125]],
    },
    {
      id: "southGreen",
      label: "Area Tertutup Selatan",
      type: "park",
      polygon: [[103, 320], [130, 300], [158, 310], [145, 337], [115, 345], [94, 335]],
    },
    {
      id: "eastPark",
      label: "Taman Timur",
      type: "park",
      polygon: [[280, 220], [320, 205], [338, 226], [310, 248], [285, 240]],
    },
    {
      id: "westWaterGate",
      label: "Dermaga Tertutup",
      type: "building",
      polygon: [[72, 292], [100, 276], [118, 291], [101, 314], [72, 314]],
    },
  ];

  const DEFAULT_OBSTACLES = ["centralGarden"];
  let lastTransform = { scale: 1, offsetX: 0, offsetY: 0, dpr: 1 };

  function createMapModel(gridSize, activeObstacleIds) {
    const sampleStep = gridSize <= 10 ? 34 : gridSize <= 20 ? 23 : 16;
    const mergeRadius = gridSize <= 10 ? 12 : gridSize <= 20 ? 8 : 6;
    const graph = new window.RoadGraph.Graph();
    const nodeRefs = [];
    const activeIds = activeObstacleIds && activeObstacleIds.length ? activeObstacleIds : [];
    const activeObstacles = OBSTACLES.filter((obstacle) => activeIds.includes(obstacle.id));
    let nodeCounter = 0;

    function getOrCreateNode(x, y, roadId) {
      for (const ref of nodeRefs) {
        const dx = ref.x - x;
        const dy = ref.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= mergeRadius) {
          return ref.id;
        }
      }

      const id = `N${nodeCounter++}`;
      graph.addNode(id, x, y, {
        roadId,
        gridX: Math.round((x / VIEWBOX.width) * gridSize),
        gridY: Math.round((y / VIEWBOX.height) * gridSize),
      });
      nodeRefs.push({ id, x, y });
      return id;
    }

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

    applyObstacles(graph, activeObstacles);

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

  function applyObstacles(graph, activeObstacles) {
    graph.resetBlocks();
    if (!activeObstacles.length) return;

    graph.nodes.forEach((node) => {
      if (activeObstacles.some((obstacle) => pointInPolygon([node.x, node.y], obstacle.polygon))) {
        node.blocked = true;
      }
    });

    graph.nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        const target = graph.getNode(edge.to);
        if (!target) return;
        const mid = [(node.x + target.x) / 2, (node.y + target.y) / 2];
        if (activeObstacles.some((obstacle) => pointInPolygon(mid, obstacle.polygon))) {
          edge.disabled = true;
        }
      });
    });
  }

  function sampleRoad(points, step) {
    const samples = [];

    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = i === 0 ? points[i] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;
      const segmentDistance = distance2D(p1, p2);
      const localSteps = Math.max(3, Math.ceil(segmentDistance / step));

      for (let s = 0; s < localSteps; s += 1) {
        const t = s / localSteps;
        const point = catmullRomPoint(p0, p1, p2, p3, t);
        samples.push(point);
      }
    }

    samples.push(points[points.length - 1]);
    return samples;
  }

  function catmullRomPoint(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    const x = 0.5 * (
      (2 * p1[0]) +
      (-p0[0] + p2[0]) * t +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
    );
    const y = 0.5 * (
      (2 * p1[1]) +
      (-p0[1] + p2[1]) * t +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
    );
    return [x, y];
  }

  function render(canvas, mapData, state) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawWater(ctx, rect.width, rect.height);

    const scale = Math.min((rect.width * 0.92) / VIEWBOX.width, (rect.height * 0.92) / VIEWBOX.height);
    const offsetX = (rect.width - VIEWBOX.width * scale) / 2;
    const offsetY = (rect.height - VIEWBOX.height * scale) / 2;
    lastTransform = { scale, offsetX, offsetY, dpr };

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const islandPath = new Path2D(ISLAND_PATH_D);
    drawIslandBase(ctx, islandPath);

    ctx.save();
    ctx.clip(islandPath);
    drawLandTexture(ctx);
    drawAllRoads(ctx, mapData.roads);
    drawObstacleAreas(ctx, mapData.obstacles, mapData.activeObstacleIds);
    drawExploration(ctx, mapData.graph, state.visitedIds || []);
    drawFinalRoute(ctx, mapData.graph, state.pathIds || []);
    drawGraphDots(ctx, mapData.graph, state.showNodes);
    ctx.restore();

    drawOutline(ctx, islandPath);
    drawMarkerIfExists(ctx, mapData.graph, state.startId, "Start", "#16a34a");
    drawMarkerIfExists(ctx, mapData.graph, state.goalId, "Goal", "#dc2626");
    drawMapBadge(ctx, mapData);

    ctx.restore();
  }

  function drawWater(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 1.2;

  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.arc(
      width * (0.12 + i * 0.10),
      height * (0.20 + (i % 4) * 0.16),
      70 + (i % 3) * 18,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  ctx.restore();
}

  function drawIslandBase(ctx, islandPath) {
    ctx.save();
    ctx.shadowColor = "rgba(38, 73, 84, 0.30)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#d8ecd1";
    ctx.fill(islandPath);
    ctx.restore();
  }

  function drawLandTexture(ctx) {
    const landGradient = ctx.createLinearGradient(20, 20, 420, 390);
    landGradient.addColorStop(0, "#dbeed3");
    landGradient.addColorStop(0.5, "#eef0c8");
    landGradient.addColorStop(1, "#cce2bc");
    ctx.fillStyle = landGradient;
    ctx.fillRect(0, 0, VIEWBOX.width, VIEWBOX.height);

    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#6aae61";
    for (let i = 0; i < 36; i += 1) {
      const x = 40 + ((i * 59) % 350);
      const y = 45 + ((i * 83) % 320);
      ctx.beginPath();
      ctx.ellipse(x, y, 18 + (i % 4) * 4, 10 + (i % 3) * 5, (i % 6) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawAllRoads(ctx, roads) {
    const ordered = ["tertiary", "secondary", "primary"];

    for (const type of ordered) {
      for (const road of roads.filter((item) => item.type === type)) {
        const width = roadWidth(road.type);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        drawSmoothPolyline(ctx, road.points, "#f8fbfa", width + 6);
        drawSmoothPolyline(ctx, road.points, roadColor(road.type), width);

        if (road.type === "primary") {
          drawSmoothPolyline(ctx, road.points, "rgba(255,255,255,0.42)", Math.max(1.2, width * 0.18));
        }
      }
    }
  }

  function drawObstacleAreas(ctx, obstacles, activeIds) {
    for (const obstacle of obstacles) {
      const active = activeIds.includes(obstacle.id);
      ctx.beginPath();
      obstacle.polygon.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point[0], point[1]);
        else ctx.lineTo(point[0], point[1]);
      });
      ctx.closePath();

      if (active) {
        ctx.fillStyle = obstacle.type === "building" ? "rgba(144, 94, 64, 0.70)" : "rgba(92, 138, 87, 0.72)";
        ctx.strokeStyle = "rgba(85, 62, 40, 0.72)";
        ctx.lineWidth = 1.6;
      } else {
        ctx.fillStyle = obstacle.type === "building" ? "rgba(190, 170, 140, 0.34)" : "rgba(93, 155, 94, 0.28)";
        ctx.strokeStyle = "rgba(92, 124, 84, 0.30)";
        ctx.lineWidth = 1;
      }

      ctx.fill();
      ctx.stroke();

      if (active) {
        const center = polygonCenter(obstacle.polygon);
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.font = "700 7px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Obstacle", center[0], center[1] + 2);
      }
    }
  }

  function drawExploration(ctx, graph, visitedIds) {
    if (!visitedIds.length) return;
    ctx.save();
    ctx.globalAlpha = 0.84;
    for (const id of visitedIds) {
      const node = graph.getNode(id);
      if (!node) continue;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFinalRoute(ctx, graph, pathIds) {
    if (!pathIds || pathIds.length < 2) return;
    const points = pathIds
      .map((id) => graph.getNode(id))
      .filter(Boolean)
      .map((node) => [node.x, node.y]);

    drawSmoothPolyline(ctx, points, "rgba(10, 62, 148, 0.28)", 10);
    drawSmoothPolyline(ctx, points, "#1769ff", 5.3);
    drawSmoothPolyline(ctx, points, "rgba(255,255,255,0.9)", 1.3);
  }

  function drawGraphDots(ctx, graph, showNodes) {
    if (!showNodes) return;
    ctx.save();
    graph.nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = node.blocked ? "#7f1d1d" : "rgba(28, 60, 70, 0.4)";
      ctx.fill();
    });
    ctx.restore();
  }

  function drawOutline(ctx, islandPath) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.lineWidth = 4.5;
    ctx.stroke(islandPath);
    ctx.strokeStyle = "rgba(33, 83, 72, 0.52)";
    ctx.lineWidth = 1.5;
    ctx.stroke(islandPath);
    ctx.restore();
  }

  function drawMarkerIfExists(ctx, graph, nodeId, label, color) {
    const node = graph.getNode(nodeId);
    if (!node) return;

    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-8, -2, -9, -15, 0, -19);
    ctx.bezierCurveTo(9, -15, 8, -2, 0, 8);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -8, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#1f2933";
    ctx.font = "800 8px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, -24);
    ctx.restore();
  }

  function drawMapBadge(ctx, mapData) {
    const text = `Internal ${mapData.gridSize}×${mapData.gridSize} · ${mapData.graph.nodes.size} node graph`;
    ctx.save();
    ctx.font = "800 8px system-ui, sans-serif";
    const w = ctx.measureText(text).width + 16;
    const x = 14;
    const y = 18;
    roundRect(ctx, x, y, w, 20, 8);
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fill();
    ctx.fillStyle = "#35515f";
    ctx.fillText(text, x + 8, y + 13);
    ctx.restore();
  }

  function drawSmoothPolyline(ctx, points, color, width) {
    if (!points || points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = i === 0 ? points[i] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;
      const cp1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const cp2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], p2[0], p2[1]);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function roadWidth(type) {
    if (type === "primary") return 9.5;
    if (type === "secondary") return 6.7;
    return 4.4;
  }

  function roadColor(type) {
    if (type === "primary") return "#f4cf70";
    if (type === "secondary") return "#fff3c4";
    return "#ffffff";
  }

  function findNearestAvailableNode(graph, x, y, minDegree = 1) {
    let best = null;
    let bestDistance = Infinity;

    graph.nodes.forEach((node) => {
      if (node.blocked) return;
      const availableEdgeCount = node.edges.filter((edge) => !edge.disabled).length;
      if (availableEdgeCount < minDegree) return;
      const d = Math.hypot(node.x - x, node.y - y);
      if (d < bestDistance) {
        best = node;
        bestDistance = d;
      }
    });

    return best;
  }

  function pickRandomPair(graph) {
    const nodes = graph.availableNodes();
    if (nodes.length < 2) return { startId: null, goalId: null };

    let start = nodes[Math.floor(Math.random() * nodes.length)];
    let goal = nodes[Math.floor(Math.random() * nodes.length)];
    let attempts = 0;

    while (attempts < 120 && (start.id === goal.id || distance2D([start.x, start.y], [goal.x, goal.y]) < 170)) {
      start = nodes[Math.floor(Math.random() * nodes.length)];
      goal = nodes[Math.floor(Math.random() * nodes.length)];
      attempts += 1;
    }

    return { startId: start.id, goalId: goal.id };
  }

  function randomObstacleIds() {
    const shuffled = OBSTACLES.map((item) => item.id).sort(() => Math.random() - 0.5);
    const count = 1 + Math.floor(Math.random() * 3);
    return shuffled.slice(0, count);
  }

  function pointInPolygon(point, polygon) {
    const x = point[0];
    const y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  function screenToMap(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - lastTransform.offsetX) / lastTransform.scale;
    const y = (clientY - rect.top - lastTransform.offsetY) / lastTransform.scale;
    return [x, y];
  }

  function distance2D(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function polygonCenter(polygon) {
    const total = polygon.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
    return [total[0] / polygon.length, total[1] / polygon.length];
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  window.MapRenderer = {
    VIEWBOX,
    ISLAND_PATH_D,
    ROAD_DEFINITIONS,
    OBSTACLES,
    DEFAULT_OBSTACLES,
    createMapModel,
    render,
    findNearestAvailableNode,
    pickRandomPair,
    randomObstacleIds,
    screenToMap,
  };
})();
