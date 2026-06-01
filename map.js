(function () {
  "use strict";

  const VIEWBOX = { width: 440, height: 415 };
  const ISLAND_PATH_D = "M 110.0,409.5 L 103.5,404.0 L 125.5,377.0 L 118.0,364.5 L 112.0,364.5 L 95.0,373.5 L 82.0,374.5 L 42.0,367.5 L 28.0,358.5 L 14.5,341.0 L 7.5,326.0 L 5.5,312.0 L 8.5,295.0 L 19.5,277.0 L 145.5,124.0 L 145.5,117.0 L 140.0,113.5 L 94.0,112.5 L 91.5,109.0 L 95.5,103.0 L 94.5,99.0 L 84.5,91.0 L 88.0,87.5 L 146.0,88.5 L 150.5,92.0 L 139.5,102.0 L 147.0,110.5 L 153.0,110.5 L 180.5,77.0 L 181.5,71.0 L 175.0,64.5 L 152.0,64.5 L 147.5,50.0 L 155.0,38.5 L 181.0,38.5 L 185.0,42.5 L 191.0,42.5 L 200.5,26.0 L 196.5,20.0 L 199.0,16.5 L 209.0,15.5 L 214.0,18.5 L 234.0,15.5 L 243.0,21.5 L 334.0,11.5 L 348.0,17.5 L 401.0,56.5 L 407.0,56.5 L 414.0,50.5 L 422.0,50.5 L 429.5,58.0 L 427.5,67.0 L 419.5,79.0 L 431.5,108.0 L 430.5,138.0 L 418.5,181.0 L 396.5,221.0 L 329.0,262.5 L 324.5,269.0 L 332.5,277.0 L 330.0,280.5 L 290.0,285.5 L 266.0,319.5 L 261.5,317.0 L 262.5,313.0 L 283.5,280.0 L 280.5,273.0 L 274.0,268.5 L 187.0,318.5 L 183.5,324.0 L 190.0,333.5 L 196.0,333.5 L 209.0,325.5 L 213.5,328.0 L 210.0,333.5 L 197.0,341.5 L 170.0,354.5 L 167.5,352.0 L 183.5,337.0 L 181.5,331.0 L 175.0,326.5 L 138.0,347.5 L 127.5,362.0 L 134.5,372.0 L 135.5,381.0 L 110.0,409.5 Z";

  const ROAD_DEFINITIONS = [
    { id: "mainSpine", type: "primary",   points: [[80,345],[115,315],[150,285],[190,255],[230,218],[268,178],[305,140],[345,105],[385,68]] },
    { id: "westLoop",  type: "secondary", points: [[80,345],[60,330],[55,308],[60,285],[80,268],[110,252],[145,238],[190,255]] },
    { id: "southRing", type: "secondary", points: [[80,345],[100,345],[130,340],[155,335],[175,320],[190,300],[210,280],[230,265],[230,218]] },
    { id: "centralEast", type: "secondary", points: [[190,255],[220,240],[252,228],[285,215],[315,200],[345,185],[370,165],[385,68]] },
    { id: "northArc",  type: "secondary", points: [[305,140],[318,120],[340,108],[360,112],[375,128],[370,155],[355,170],[335,180],[315,200]] },
    { id: "upperLoop", type: "tertiary",  points: [[345,105],[360,90],[378,90],[390,100],[392,120],[380,136],[365,140],[345,140],[330,138],[305,140]] },
    { id: "eastCoast", type: "secondary", points: [[385,68],[395,90],[400,115],[395,145],[385,160],[370,165]] },
    { id: "midConnector", type: "tertiary", points: [[150,285],[168,270],[190,255]] },
    { id: "swConnector", type: "tertiary", points: [[110,252],[125,268],[138,278],[150,285]] },
    { id: "lowerBypass", type: "tertiary", points: [[150,285],[165,290],[185,295],[210,295],[230,290],[252,285],[268,270],[268,178]] },
    { id: "centerCross", type: "tertiary", points: [[230,218],[252,200],[268,178]] },
    { id: "eastLower", type: "tertiary", points: [[315,200],[305,230],[290,250],[268,270]] },
    { id: "westSpine", type: "tertiary",  points: [[80,268],[95,258],[115,250],[145,238]] },
    { id: "seRing", type: "tertiary",   points: [[230,265],[250,265],[268,270]] },
  ];

  const OBSTACLES = [
    { id: "blokNorth",  label: "BLOK",   type: "building", polygon: [[352,112],[370,112],[370,128],[352,128]] },
    { id: "blokSouth",  label: "BLOK",   type: "building", polygon: [[105,325],[125,325],[125,340],[105,340]] },
    { id: "blokCenter", label: "BLOK",   type: "building", polygon: [[275,225],[295,225],[295,240],[275,240]] },
    { id: "buildA",     label: "BLOK A", type: "building", polygon: [[205,225],[225,225],[225,240],[205,240]] },
    { id: "buildB",     label: "BLOK B", type: "building", polygon: [[165,175],[185,175],[185,190],[165,190]] },
  ];

  const DEFAULT_OBSTACLES = ["blokNorth", "blokSouth"];
  let lastTransform = { scale: 1, offsetX: 0, offsetY: 0, dpr: 1 };

  const TREES = [
    [28, 300, 9],[38, 318, 7],[22, 330, 8],[45, 295, 6],[30, 275, 9],[50, 265, 7],
    [38, 358, 8],[55, 375, 9],[70, 382, 7],[90, 388, 10],[110, 392, 8],[135, 385, 7],[155, 375, 9],
    [88, 370, 8],[100, 378, 6],[62, 240, 9],[48, 252, 7],[75, 228, 8],[90, 218, 10],
    [215, 85, 8],[228, 72, 7],[242, 60, 9],[260, 52, 8],[278, 44, 7],[300, 35, 8],[318, 28, 9],[335, 22, 7],
    [412, 68, 8],[420, 88, 7],[425, 110, 9],[422, 132, 7],[395, 60, 8],[408, 48, 9],[418, 42, 7],
    [135, 230, 8],[120, 225, 7],[108, 238, 9],[245, 145, 7],[258, 135, 9],[272, 125, 8],
    [325, 165, 7],[340, 158, 9],[178, 200, 7],[165, 212, 8],[210, 165, 9],[198, 155, 7],
    [125, 188, 8],[110, 200, 9],[396, 152, 7],[400, 165, 9],[55, 340, 7],[45, 352, 8],
    [290, 310, 7],[302, 318, 9],[315, 310, 7],[245, 330, 8],[258, 340, 7],[268, 348, 9],
    [178, 330, 7],[165, 345, 8],
  ];

  const VEHICLES = [
    { x: 170, y: 130, a: 0.35, type: 'car', color: '#ef4444' }, 
    { x: 190, y: 135, a: 0.35, type: 'car', color: '#3b82f6' }, 
    { x: 210, y: 140, a: 0.35, type: 'car', color: '#22c55e' }, 
    { x: 165, y: 155, a: 0.35, type: 'bus', color: '#f59e0b' }, 
    { x: 185, y: 160, a: 0.35, type: 'bus', color: '#8b5cf6' }, 
    { x: 205, y: 165, a: 0.35, type: 'car', color: '#ec4899' }  
  ];

  const TRAFFIC_LIGHTS = [
    [178, 240], [135, 275], [215, 205], [255, 165],
    [290, 128], [100, 305], [385, 150], [65, 335]
  ];

  const CROSSWALKS = [
    { x: 190, y: 255, angle: -0.7 }, { x: 150, y: 285, angle: -0.7 },
    { x: 230, y: 218, angle: -0.7 }, { x: 268, y: 178, angle: -0.75 },
    { x: 305, y: 140, angle: -0.75 }, { x: 115, y: 315, angle: -0.65 },
  ];

  // =============================================
  // SVG DINAMIS: MOTOR KEMBALI MENGGUNAKAN DESAIN AWAL (HELM MERAH & BOX)
  // =============================================
  const SVG_VAN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="6" y="16" width="34" height="32" fill="#f8fafc" rx="2" stroke="#94a3b8" stroke-width="2"/><rect x="40" y="20" width="16" height="24" fill="#3b82f6" rx="4" stroke="#1d4ed8" stroke-width="2"/><path d="M46 22 L54 24 L54 40 L46 42 Z" fill="#0f172a"/><circle cx="56" cy="24" r="3" fill="#fef08a"/><circle cx="56" cy="40" r="3" fill="#fef08a"/><path d="M40 22 L36 22 M40 42 L36 42" stroke="#ef4444" stroke-width="2"/></svg>`;
  const SVG_CAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="10" y="16" width="44" height="32" fill="#2563eb" rx="6" stroke="#1e3a8a" stroke-width="2"/><rect x="22" y="20" width="20" height="24" fill="#1d4ed8" rx="4"/><path d="M42 22 L48 24 L48 40 L42 42 Z" fill="#0f172a"/><path d="M22 22 L16 24 L16 40 L22 42 Z" fill="#0f172a"/><circle cx="54" cy="22" r="3" fill="#fef08a"/><circle cx="54" cy="42" r="3" fill="#fef08a"/><path d="M10 20 L6 20 M10 44 L6 44" stroke="#ef4444" stroke-width="2"/></svg>`;
  const SVG_MOTORCYCLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="16" width="24" height="32" fill="#ea580c" rx="4" stroke="#9a3412" stroke-width="2"/><path d="M28 22 L46 22 A8 8 0 0 1 54 30 L54 34 A8 8 0 0 1 46 42 L28 42 Z" fill="#334155"/><circle cx="54" cy="32" r="4" fill="#fef08a"/><path d="M46 14 L46 50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="14" r="3.5" fill="#eab308"/><circle cx="46" cy="50" r="3.5" fill="#eab308"/><ellipse cx="32" cy="32" rx="10" ry="16" fill="#0284c7" stroke="#0369a1" stroke-width="2"/><circle cx="36" cy="32" r="9" fill="#dc2626" stroke="#991b1b" stroke-width="2"/><path d="M39 25 A 9 9 0 0 1 39 39 L35 32 Z" fill="#cbd5e1"/></svg>`;
  const SVG_BICYCLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="14" y="30" width="12" height="4" fill="#334155" rx="1"/><rect x="42" y="30" width="12" height="4" fill="#334155" rx="1"/><path d="M 24 32 L 44 32" stroke="#0ea5e9" stroke-width="2"/><path d="M44 24 L46 32 L44 40" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"/><ellipse cx="30" cy="32" rx="4" ry="7" fill="#16a34a"/><circle cx="34" cy="32" r="4" fill="#fca5a5"/></svg>`;
  const SVG_PERSON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="6" ry="12" fill="#eab308"/><circle cx="36" cy="32" r="5" fill="#fca5a5"/></svg>`;

  const COURIER_ICONS = {
    van: new Image(),
    car: new Image(),
    motorcycle: new Image(),
    bicycle: new Image(),
    person: new Image()
  };

  COURIER_ICONS.van.src = "data:image/svg+xml;base64," + btoa(SVG_VAN);
  COURIER_ICONS.car.src = "data:image/svg+xml;base64," + btoa(SVG_CAR);
  COURIER_ICONS.motorcycle.src = "data:image/svg+xml;base64," + btoa(SVG_MOTORCYCLE);
  COURIER_ICONS.bicycle.src = "data:image/svg+xml;base64," + btoa(SVG_BICYCLE);
  COURIER_ICONS.person.src = "data:image/svg+xml;base64," + btoa(SVG_PERSON);

  function getRandomRoads() {
    const PRESETS = [
      ROAD_DEFINITIONS.map(r => r.id),
      ["mainSpine", "westLoop", "southRing", "centralEast", "upperLoop", "centerCross"],
      ["mainSpine", "westLoop", "upperLoop", "midConnector", "lowerBypass"],
      ["mainSpine", "lowerBypass", "southRing", "centralEast", "northArc", "eastCoast"],
      ["mainSpine", "westLoop", "swConnector", "westSpine", "southRing", "upperLoop", "midConnector"],
      ["mainSpine", "southRing", "lowerBypass", "seRing", "centralEast", "eastLower"]
    ];

    const selectedPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    return ROAD_DEFINITIONS.filter(r => selectedPreset.includes(r.id));
  }

  function createMapModel(gridSize, activeObstacleIds, activeRoads) {
    const sampleStep = gridSize <= 10 ? 34 : gridSize <= 20 ? 23 : 16;
    const mergeRadius = gridSize <= 10 ? 12 : gridSize <= 20 ? 8 : 6;
    const graph = new window.RoadGraph.Graph();
    const nodeRefs = [];
    const activeIds = activeObstacleIds && activeObstacleIds.length ? activeObstacleIds : [];
    const activeObstacles = OBSTACLES.filter((o) => activeIds.includes(o.id));
    let nodeCounter = 0;

    function getOrCreateNode(x, y, roadId) {
      for (const ref of nodeRefs) {
        if (Math.hypot(ref.x - x, ref.y - y) <= mergeRadius) return ref.id;
      }
      const id = `N${nodeCounter++}`;
      graph.addNode(id, x, y, { roadId, gridX: Math.round((x / VIEWBOX.width) * gridSize), gridY: Math.round((y / VIEWBOX.height) * gridSize) });
      nodeRefs.push({ id, x, y });
      return id;
    }

    const roadsToProcess = activeRoads || ROAD_DEFINITIONS;

    const roads = roadsToProcess.map((road) => {
      const samples = sampleRoad(road.points, sampleStep);
      let previousId = null;
      for (const point of samples) {
        const currentId = getOrCreateNode(point[0], point[1], road.id);
        if (previousId && previousId !== currentId) {
          const a = graph.getNode(previousId);
          const b = graph.getNode(currentId);
          graph.addEdge(previousId, currentId, Math.hypot(a.x - b.x, a.y - b.y), { roadId: road.id, roadType: road.type, mode: road.mode || "cardinal" });
        }
        previousId = currentId;
      }
      return { ...road, samples };
    });

    applyObstacles(graph, activeObstacles);
    return { gridSize, graph, roads, obstacles: OBSTACLES, activeObstacleIds: activeIds, activeObstacles, viewBox: VIEWBOX };
  }

  function applyObstacles(graph, activeObstacles) {
    graph.resetBlocks();
    if (!activeObstacles.length) return;
    graph.nodes.forEach((node) => {
      if (activeObstacles.some((o) => pointInPolygon([node.x, node.y], o.polygon))) node.blocked = true;
    });
    graph.nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        const target = graph.getNode(edge.to);
        if (!target) return;
        const mid = [(node.x + target.x) / 2, (node.y + target.y) / 2];
        if (activeObstacles.some((o) => pointInPolygon(mid, o.polygon))) edge.disabled = true;
      });
    });
  }

  function sampleRoad(points, step) {
    const samples = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[i] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;
      const segmentDistance = dist2D(p1, p2);
      const localSteps = Math.max(3, Math.ceil(segmentDistance / step));
      for (let s = 0; s < localSteps; s++) {
        samples.push(catmullRom(p0, p1, p2, p3, s / localSteps));
      }
    }
    samples.push(points[points.length - 1]);
    return samples;
  }

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    const x = 0.5 * ((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3);
    const y = 0.5 * ((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3);
    return [x, y];
  }

  function render(canvas, mapData, state) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const waterGrad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    waterGrad.addColorStop(0, "#b8e4f7");
    waterGrad.addColorStop(0.5, "#cceef8");
    waterGrad.addColorStop(1, "#ddf3fb");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const baseScale = Math.min((rect.width * 0.92) / VIEWBOX.width, (rect.height * 0.92) / VIEWBOX.height);
    const scale = baseScale * (state.zoom || 1);
    const offsetX = (rect.width - VIEWBOX.width * baseScale) / 2 + (state.panX || 0);
    const offsetY = (rect.height - VIEWBOX.height * baseScale) / 2 + (state.panY || 0);

    lastTransform = { scale, offsetX, offsetY, dpr };

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const islandPath = new Path2D(ISLAND_PATH_D);

    ctx.save();
    ctx.shadowColor = "rgba(30,80,110,0.28)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "#b5d49a";
    ctx.fill(islandPath);
    ctx.restore();
    ctx.shadowColor = "transparent";

    const landGrad = ctx.createLinearGradient(0, 0, VIEWBOX.width, VIEWBOX.height);
    landGrad.addColorStop(0, "#c8e6a0");
    landGrad.addColorStop(0.5, "#b8dc8c");
    landGrad.addColorStop(1, "#a8d27c");
    ctx.fillStyle = landGrad;
    ctx.fill(islandPath);

    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 5 / (state.zoom || 1);
    ctx.stroke(islandPath);

    ctx.save();
    ctx.clip(islandPath);
    drawTrees(ctx, mapData.roads); 
    ctx.restore();

    drawAllRoads(ctx, mapData.roads);
    drawCrosswalks(ctx);
    drawTrafficLights(ctx);
    drawVehicles(ctx);
    drawObstacleAreas(ctx, mapData.obstacles, mapData.activeObstacleIds);

    drawExploration(ctx, mapData.graph, state.visitedIds || []);
    drawFinalRoute(ctx, mapData.graph, state.pathIds || []);
    drawGraphDots(ctx, mapData.graph, state.showNodes);

    if (state.courierPos) drawSmartCourier(ctx, state.courierPos, state.courierType);
    ctx.restore();

    drawMarkerIfExists(ctx, mapData.graph, state.startId, "START", "#eab308", scale, offsetX, offsetY);
    drawMarkerIfExists(ctx, mapData.graph, state.goalId, "GOAL", "#dc2626", scale, offsetX, offsetY);
    drawMapBadge(ctx, mapData);
  }

  function drawTrees(ctx, roads) {
    const safeTrees = TREES.filter(t => {
      if (!roads) return true;
      for (const road of roads) {
        const roadW = roadWidth(road.type);
        const safeDistance = t[2] + (roadW / 2) + 3; 
        for (const pt of road.samples) {
          if (dist2D([t[0], t[1]], pt) < safeDistance) return false;
        }
      }
      return true;
    });

    for (const t of safeTrees) {
      drawTree(ctx, t[0], t[1], t[2]);
    }
  }

  function drawTree(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "rgba(0,60,0,0.22)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 4;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#2d7a3a"; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.22, r * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = "#4aad5a"; ctx.fill();
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "#6ecc7e"; ctx.fill();
    ctx.restore();
  }

  function roadWidth(type) {
    if (type === "primary")   return 12;
    if (type === "secondary") return 9;
    return 6.5;
  }

  function drawAllRoads(ctx, roads) {
    const order = ["tertiary", "secondary", "primary"];
    for (const type of order) {
      for (const road of roads.filter(r => r.type === type)) {
        drawSmoothPolyline(ctx, road.points, "#d0d8e0", roadWidth(road.type) + 5);
      }
    }
    for (const type of order) {
      for (const road of roads.filter(r => r.type === type)) {
        const color = type === "primary" ? "#3a4455" : type === "secondary" ? "#4a5568" : "#5a6478";
        drawSmoothPolyline(ctx, road.points, color, roadWidth(road.type));
      }
    }
    for (const type of order) {
      for (const road of roads.filter(r => r.type === type)) {
        if (type === "primary") drawSmoothPolyline(ctx, road.points, "#f5c842", 1.8, [10, 10]);
        else if (type === "secondary") drawSmoothPolyline(ctx, road.points, "rgba(255,255,255,0.7)", 1.2, [7, 8]);
      }
    }
  }

  function drawCrosswalks(ctx) {
    for (const cw of CROSSWALKS) {
      ctx.save(); ctx.translate(cw.x, cw.y); ctx.rotate(cw.angle);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      for (let i = -3; i <= 3; i++) ctx.fillRect(i * 3 - 1, -8, 2, 16);
      ctx.restore();
    }
  }

  function drawTrafficLights(ctx) {
    for (const tl of TRAFFIC_LIGHTS) {
      ctx.save(); ctx.translate(tl[0] - 6, tl[1] - 6);
      ctx.fillStyle = "#2d3748"; ctx.fillRect(0.5, 0, 2.5, 9);
      ctx.fillStyle = "#1a202c"; ctx.beginPath(); roundRect(ctx, -1, -1, 5, 11, 1.5); ctx.fill();
      ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(1.5, 1.5, 1.1, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(1.5, 4.5, 1.1, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(1.5, 7.5, 1.1, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function drawVehicles(ctx) {
    for (const v of VEHICLES) {
      ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.a);
      ctx.shadowColor = "rgba(0,0,0,0.32)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
      if (v.type === 'bus') {
        ctx.fillStyle = v.color; ctx.beginPath(); roundRect(ctx, -5, -14, 10, 28, 2.5); ctx.fill();
        ctx.shadowColor = "transparent"; ctx.fillStyle = "#1e293b";
        ctx.fillRect(-3.5, -12, 7, 5); ctx.fillRect(-3.5, 10, 7, 3);
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fillRect(-5, -2, 10, 2);
      } else {
        ctx.fillStyle = v.color; ctx.beginPath(); roundRect(ctx, -4, -8, 8, 16, 2); ctx.fill();
        ctx.shadowColor = "transparent"; ctx.fillStyle = "#1e293b";
        ctx.fillRect(-3, -5, 6, 4); ctx.fillRect(-3, 5, 6, 2.5);
      }
      ctx.fillStyle = "rgba(255,255,240,0.75)";
      ctx.beginPath(); ctx.arc(-2.5, v.type==='bus'?-14:-8, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc( 2.5, v.type==='bus'?-14:-8, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function drawObstacleAreas(ctx, obstacles, activeIds) {
    for (const obs of obstacles) {
      const active = activeIds.includes(obs.id);
      ctx.beginPath();
      obs.polygon.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
      ctx.closePath();

      if (active) {
        ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 14;
        ctx.fillStyle = "#1e2d3d"; ctx.fill();
        ctx.shadowColor = "transparent"; ctx.strokeStyle = "rgba(100,140,180,0.2)";
        ctx.lineWidth = 1; ctx.stroke();

        const c = polygonCenter(obs.polygon);
        const hw = 10, hh = 10;
        ctx.fillStyle = "#141e28"; ctx.fillRect(c[0]-hw, c[1]-hh, hw*2, hh*2);
        ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "bold 7px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(obs.label || "BLOK", c[0], c[1] + hh + 8);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.04)"; ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1; ctx.stroke();
      }
    }
  }

  function drawExploration(ctx, graph, visitedIds) {
    if (!visitedIds.length) return;
    ctx.save(); ctx.globalAlpha = 0.8;
    for (const id of visitedIds) {
      const node = graph.getNode(id);
      if (!node) continue;
      ctx.beginPath(); ctx.arc(node.x, node.y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24"; ctx.fill();
    }
    ctx.restore();
  }

  function drawFinalRoute(ctx, graph, pathIds) {
    if (!pathIds || pathIds.length < 2) return;
    const points = pathIds.map(id => graph.getNode(id)).filter(Boolean).map(n => [n.x, n.y]);
    drawSmoothPolyline(ctx, points, "rgba(56,189,248,0.35)", 14);
    drawSmoothPolyline(ctx, points, "#0ea5e9", 5.5);
    drawSmoothPolyline(ctx, points, "#ffffff", 2);
  }

  function drawGraphDots(ctx, graph, showNodes) {
    if (!showNodes) return;
    ctx.save();
    graph.nodes.forEach((node) => {
      ctx.beginPath(); ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = node.blocked ? "#b91c1c" : "rgba(255,255,255,0.5)"; ctx.fill();
    });
    ctx.restore();
  }

  function drawMarkerIfExists(ctx, graph, nodeId, label, color, scale, offsetX, offsetY) {
    const node = graph.getNode(nodeId);
    if (!node) return;
    const sx = offsetX + node.x * scale;
    const sy = offsetY + node.y * scale;

    ctx.save(); ctx.translate(sx, sy);
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
    ctx.beginPath(); ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-11, -2, -13, -20, 0, -24); ctx.bezierCurveTo(13, -20, 11, -2, 0, 9);
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.shadowColor = "transparent"; ctx.fillStyle = "#0f172a";
    ctx.font = "900 8.5px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(label, 0, -28); ctx.restore();
  }

  function drawMapBadge(ctx, mapData) {
    const text = `SMART COURIER ENGINE · ${mapData.gridSize}×${mapData.gridSize}`;
    ctx.save(); ctx.font = "800 8px system-ui, sans-serif";
    const w = ctx.measureText(text).width + 16;
    roundRect(ctx, 14, 18, w, 20, 8);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.fillStyle = "#0f172a"; ctx.fillText(text, 22, 31);
    ctx.restore();
  }

  function drawSmartCourier(ctx, pos, type = 'van') {
    const img = COURIER_ICONS[type] || COURIER_ICONS.van;
    if (!img.complete) return;
    
    ctx.save(); 
    ctx.translate(pos.x, pos.y);
    if (pos.angle !== undefined) ctx.rotate(pos.angle);
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
    
    // Motor diubah menjadi ukuran 30 agar desain helm/box nya terlihat sama seperti kode awal
    let size = 30; 
    if (type === 'car') size = 26;
    else if (type === 'motorcycle') size = 30;
    else if (type === 'bicycle') size = 18;
    else if (type === 'person') size = 14;

    ctx.drawImage(img, -size/2, -size/2, size, size); 
    ctx.restore();
  }

  function drawSmoothPolyline(ctx, points, color, width, dash = []) {
    if (!points || points.length < 2) return;
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[i] : points[i-1];
      const p1 = points[i]; const p2 = points[i+1];
      const p3 = i+2 < points.length ? points[i+2] : p2;
      const cp1 = [p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6];
      const cp2 = [p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6];
      ctx.bezierCurveTo(cp1[0],cp1[1],cp2[0],cp2[1],p2[0],p2[1]);
    }
    ctx.setLineDash(dash); ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); ctx.setLineDash([]);
  }

  function findNearestAvailableNode(graph, x, y, minDegree = 1) {
    let best = null, bestDist = Infinity;
    graph.nodes.forEach((n) => {
      if (n.blocked) return;
      if (n.edges.filter(e => !e.disabled).length < minDegree) return;
      const d = Math.hypot(n.x-x, n.y-y);
      if (d < bestDist) { best = n; bestDist = d; }
    });
    return best;
  }

  function pickRandomPair(graph) {
    const nodes = graph.availableNodes();
    if (nodes.length < 2) return { startId: null, goalId: null };
    let start = nodes[Math.floor(Math.random()*nodes.length)];
    let goal  = nodes[Math.floor(Math.random()*nodes.length)];
    let tries = 0;
    while (tries < 120 && (start.id===goal.id || dist2D([start.x,start.y],[goal.x,goal.y])<150)) {
      start = nodes[Math.floor(Math.random()*nodes.length)];
      goal  = nodes[Math.floor(Math.random()*nodes.length)];
      tries++;
    }
    return { startId: start.id, goalId: goal.id };
  }

  function randomObstacleIds() {
    return OBSTACLES.map(o=>o.id).sort(()=>Math.random()-0.5).slice(0,1+Math.floor(Math.random()*2));
  }

  function pointInPolygon(point, polygon) {
    const x=point[0], y=point[1]; let inside=false;
    for (let i=0,j=polygon.length-1;i<polygon.length;j=i,i++) {
      if (polygon[i][1]>y!==polygon[j][1]>y && x<((polygon[j][0]-polygon[i][0])*(y-polygon[i][1]))/(polygon[j][1]-polygon[i][1])+polygon[i][0]) inside=!inside;
    }
    return inside;
  }

  function screenToMap(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - lastTransform.offsetX) / lastTransform.scale;
    const y = (clientY - rect.top  - lastTransform.offsetY) / lastTransform.scale;
    return [x, y];
  }

  function dist2D(a, b) { return Math.hypot(a[0]-b[0], a[1]-b[1]); }

  function polygonCenter(polygon) {
    const t = polygon.reduce((acc,p)=>[acc[0]+p[0],acc[1]+p[1]],[0,0]);
    return [t[0]/polygon.length, t[1]/polygon.length];
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }

  window.MapRenderer = {
    VIEWBOX, ISLAND_PATH_D, ROAD_DEFINITIONS, OBSTACLES, DEFAULT_OBSTACLES,
    createMapModel, render, findNearestAvailableNode, pickRandomPair, randomObstacleIds, screenToMap, getRandomRoads
  };
})();