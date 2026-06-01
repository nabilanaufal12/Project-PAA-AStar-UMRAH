(function () {
  "use strict";

  const canvas = document.getElementById("mapCanvas");
  const gridSelect = document.getElementById("gridSize");
  const heuristicSelect = document.getElementById("heuristic");
  const courierTypeSelect = document.getElementById("courierType");
  const runBtn = document.getElementById("runBtn");
  const resetBtn = document.getElementById("resetBtn");
  const randomNodeBtn = document.getElementById("randomNodeBtn");
  const randomObstacleBtn = document.getElementById("randomObstacleBtn");
  const randomAllBtn = document.getElementById("randomAllBtn");
  const compareBtn = document.getElementById("compareBtn");

  const metricEls = {
    time: document.getElementById("timeMetric"),
    expanded: document.getElementById("expandedMetric"),
    distance: document.getElementById("distanceMetric"),
    steps: document.getElementById("stepsMetric"),
    status: document.getElementById("statusMetric"),
    reason: document.getElementById("reasonMetric"),
  };
  const compareBody = document.getElementById("compareBody");

  const state = {
    gridSize: Number(gridSelect.value),
    heuristic: heuristicSelect.value,
    courierType: courierTypeSelect ? courierTypeSelect.value : "van",
    activeObstacleIds: [], 
    activeRoads: null, 
    mapData: null,
    startId: null,
    goalId: null,
    visitedIds: [],
    pathIds: [],
    courierPos: null, 
    animationFrame: null,
    animating: false,
    
    // Zoom awal diatur ke 1 agar peta tampak semua fit-to-screen
    zoom: 1, 
    panX: 0,
    panY: 0,
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    clickStart: { x: 0, y: 0 }
  };

  init();

  function init() {
    rebuildMap(true);
    bindEvents();
    updateMetrics(null);
    draw();
  }

  function bindEvents() {
    gridSelect.addEventListener("change", () => {
      state.gridSize = Number(gridSelect.value);
      state.activeObstacleIds = [];
      rebuildMap(false);
      clearRunVisuals();
      updateMetrics(null);
      draw();
    });

    heuristicSelect.addEventListener("change", () => {
      state.heuristic = heuristicSelect.value;
      clearRunVisuals();
      updateMetrics(null);
      draw();
    });

    if (courierTypeSelect) {
      courierTypeSelect.addEventListener("change", () => {
        state.courierType = courierTypeSelect.value;
        if (state.pathIds && state.pathIds.length > 0) draw(); 
      });
    }

    runBtn.addEventListener("click", runAnimatedAStar);

    resetBtn.addEventListener("click", () => {
      clearRunVisuals();
      updateMetrics(null);
      state.activeObstacleIds = [];
      state.activeRoads = null; 
      rebuildMap(false);
      if(compareBody) compareBody.innerHTML = `<tr><td colspan="5">Klik “Bandingkan Heuristik”.</td></tr>`;
      
      // Kembalikan ke tampilan penuh saat reset
      state.zoom = 1;
      state.panX = 0;
      state.panY = 0;
      draw();
    });

    randomNodeBtn.addEventListener("click", () => {
      const pair = window.MapRenderer.pickRandomPair(state.mapData.graph);
      if (pair.startId && pair.goalId) {
        state.startId = pair.startId;
        state.goalId = pair.goalId;
      }
      clearRunVisuals();
      updateMetrics(null);
      draw();
    });

    if (randomObstacleBtn) {
        randomObstacleBtn.addEventListener("click", () => {
          state.activeObstacleIds = window.MapRenderer.randomObstacleIds(state.gridSize);
          rebuildMap(false);
          clearRunVisuals();
          updateMetrics(null);
          draw();
        });
    }

    if (randomAllBtn) {
      randomAllBtn.addEventListener("click", () => {
        state.activeRoads = window.MapRenderer.getRandomRoads();
        rebuildMap(false);
        const pair = window.MapRenderer.pickRandomPair(state.mapData.graph);
        if (pair.startId && pair.goalId) {
          state.startId = pair.startId;
          state.goalId = pair.goalId;
        }
        clearRunVisuals();
        updateMetrics(null);
        draw();
      });
    }

    if (compareBtn) compareBtn.addEventListener("click", compareHeuristics);

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault(); 
      const zoomFactor = 1.1;
      const oldZoom = state.zoom;
      
      if (e.deltaY < 0) state.zoom = Math.min(state.zoom * zoomFactor, 6); 
      else state.zoom = Math.max(state.zoom / zoomFactor, 0.4); 

      const scaleChange = state.zoom / oldZoom;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const baseScale = Math.min((rect.width * 0.92) / window.MapRenderer.VIEWBOX.width, (rect.height * 0.92) / window.MapRenderer.VIEWBOX.height);
      const baseOffsetX = (rect.width - window.MapRenderer.VIEWBOX.width * baseScale) / 2;
      const baseOffsetY = (rect.height - window.MapRenderer.VIEWBOX.height * baseScale) / 2;

      const currentMapX = baseOffsetX + state.panX;
      const currentMapY = baseOffsetY + state.panY;

      const relativeMouseX = mouseX - currentMapX;
      const relativeMouseY = mouseY - currentMapY;

      state.panX = (mouseX - (relativeMouseX * scaleChange)) - baseOffsetX;
      state.panY = (mouseY - (relativeMouseY * scaleChange)) - baseOffsetY;

      draw();
    }, { passive: false });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return; 
      state.isDragging = true;
      state.lastMouse = { x: e.clientX, y: e.clientY };
      state.clickStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      state.isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (state.isDragging) {
        state.panX += e.clientX - state.lastMouse.x;
        state.panY += e.clientY - state.lastMouse.y;
        state.lastMouse = { x: e.clientX, y: e.clientY };
        draw();
      }
    });

    canvas.addEventListener("click", (event) => {
      if (Math.abs(event.clientX - state.clickStart.x) > 5 || Math.abs(event.clientY - state.clickStart.y) > 5) {
        return; 
      }
      const [x, y] = window.MapRenderer.screenToMap(canvas, event.clientX, event.clientY);
      const nearest = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, x, y);
      if (!nearest) return;

      if (event.shiftKey) state.goalId = nearest.id;
      else state.startId = nearest.id;
      
      clearRunVisuals();
      updateMetrics(null);
      draw();
    });

    window.addEventListener("resize", draw);
  }

  function rebuildMap(firstLoad) {
    const previousStart = state.startId ? state.mapData?.graph.getNode(state.startId) : null;
    const previousGoal = state.goalId ? state.mapData?.graph.getNode(state.goalId) : null;

    state.mapData = window.MapRenderer.createMapModel(state.gridSize, state.activeObstacleIds, state.activeRoads);

    if (firstLoad || !previousStart || !previousGoal) {
      const pair = window.MapRenderer.pickRandomPair(state.mapData.graph);
      state.startId = pair.startId;
      state.goalId = pair.goalId;
      return;
    }

    const newStart = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, previousStart.x, previousStart.y);
    const newGoal = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, previousGoal.x, previousGoal.y);
    state.startId = newStart ? newStart.id : null;
    state.goalId = newGoal ? newGoal.id : null;
  }

  function runAnimatedAStar() {
    if (state.animating) return;
    clearAnimationOnly();

    const result = window.AStar.runAStar(state.mapData.graph, state.startId, state.goalId, {
      heuristic: state.heuristic,
    });

    updateMetrics(result);
    animateResult(result);
  }

  function animateResult(result) {
    state.animating = true;
    state.visitedIds = [];
    state.pathIds = [];
    state.courierPos = null;

    let index = 0;
    const batchSize = state.gridSize <= 8 ? 1 : 2;

    function step() {
      for (let i = 0; i < batchSize && index < result.visitedOrder.length; i += 1) {
        state.visitedIds.push(result.visitedOrder[index]);
        index += 1;
      }
      draw();

      if (index < result.visitedOrder.length) {
        state.animationFrame = requestAnimationFrame(step);
        return;
      }
      state.pathIds = result.path;
      draw();

      if (result.success && result.path.length > 1) animateCourier(result.path);
      else state.animating = false;
    }
    step();
  }

  function animateCourier(path) {
    const points = path.map(id => {
      const node = state.mapData.graph.getNode(id);
      return { x: node.x, y: node.y };
    });

    if (points.length < 2) {
      state.animating = false;
      return;
    }

    const speedMap = { 
      "person": 0.3,      
      "bicycle": 0.6,     
      "van": 1.0,         
      "car": 1.4,         
      "motorcycle": 1.7   
    };
    const speed = speedMap[state.courierType] || 1.0;

    let currentDistance = 0;
    const segments = [];
    let totalDistance = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
       const d = Math.hypot(points[i+1].x - points[i].x, points[i+1].y - points[i].y);
       segments.push({ p1: points[i], p2: points[i+1], dist: d, cumulative: totalDistance });
       totalDistance += d;
    }

    let currentAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    
    state.courierPos = { x: points[0].x, y: points[0].y, angle: currentAngle };

    const startTime = performance.now();
    let routeFinished = false;

    function moveStep() {
      const elapsed = performance.now() - startTime;

      // ==========================================
      // FASE 1: JEDA 1.5 DETIK (DIAM) - DIUBAH DARI 3 DETIK
      // ==========================================
      if (elapsed < 1500) {
        draw();
        state.animationFrame = requestAnimationFrame(moveStep);
        return; 
      }

      let currentX = state.courierPos.x;
      let currentY = state.courierPos.y;

      if (!routeFinished) {
        currentDistance += speed;

        if (currentDistance >= totalDistance) {
          routeFinished = true;
          currentDistance = totalDistance;
          currentX = points[points.length - 1].x;
          currentY = points[points.length - 1].y;
        } 
        else {
          let activeSegment = segments[0];
          for (let i = 0; i < segments.length; i++) {
            if (currentDistance >= segments[i].cumulative && currentDistance <= segments[i].cumulative + segments[i].dist) {
              activeSegment = segments[i];
              break;
            }
          }

          const localDist = currentDistance - activeSegment.cumulative;
          const progress = localDist / Math.max(activeSegment.dist, 1);

          currentX = activeSegment.p1.x + (activeSegment.p2.x - activeSegment.p1.x) * progress;
          currentY = activeSegment.p1.y + (activeSegment.p2.y - activeSegment.p1.y) * progress;

          let targetAngle = Math.atan2(activeSegment.p2.y - activeSegment.p1.y, activeSegment.p2.x - activeSegment.p1.x);
          let diff = targetAngle - currentAngle;
          
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          
          const rotationSpeed = (state.courierType === 'person' || state.courierType === 'bicycle') ? 0.3 : 0.12;
          currentAngle += diff * rotationSpeed;
        }

        state.courierPos = { x: currentX, y: currentY, angle: currentAngle };
      }

      if (!routeFinished) {
        const targetZoom = 3.0; 
        state.zoom += (targetZoom - state.zoom) * 0.04; 

        const rect = canvas.getBoundingClientRect();
        const baseScale = Math.min((rect.width * 0.92) / window.MapRenderer.VIEWBOX.width, (rect.height * 0.92) / window.MapRenderer.VIEWBOX.height);
        const scale = baseScale * state.zoom;
        const baseOffsetX = (rect.width - window.MapRenderer.VIEWBOX.width * baseScale) / 2;
        const baseOffsetY = (rect.height - window.MapRenderer.VIEWBOX.height * baseScale) / 2;

        const targetPanX = (rect.width / 2) - baseOffsetX - (currentX * scale);
        const targetPanY = (rect.height / 2) - baseOffsetY - (currentY * scale);

        state.panX += (targetPanX - state.panX) * 0.08;
        state.panY += (targetPanY - state.panY) * 0.08;
      } 
      else {
        // ==========================================
        // FASE 4: MUNDUR KE ZOOM 1.0 AGAR PETA TERLIHAT SEMUA
        // ==========================================
        const defaultZoom = 1; // Kembali fit ke layar 100%
        const targetPanX = 0;
        const targetPanY = 0;

        state.zoom += (defaultZoom - state.zoom) * 0.08;
        state.panX += (targetPanX - state.panX) * 0.08;
        state.panY += (targetPanY - state.panY) * 0.08;

        if (Math.abs(state.zoom - defaultZoom) < 0.01 && Math.abs(state.panX) < 1 && Math.abs(state.panY) < 1) {
            state.zoom = defaultZoom;
            state.panX = 0;
            state.panY = 0;
            state.animating = false; 
            draw();
            return; 
        }
      }

      draw();
      state.animationFrame = requestAnimationFrame(moveStep);
    }
    
    moveStep();
  }

  function compareHeuristics() {
    clearAnimationOnly();
    const heuristics = ["manhattan", "chebyshev", "euclidean"];
    const labels = { manhattan: "Manhattan", chebyshev: "Chebyshev", euclidean: "Euclidean" };

    const results = heuristics.map((heuristic) => {
      const result = window.AStar.runAStar(state.mapData.graph, state.startId, state.goalId, { heuristic });
      return { heuristic, label: labels[heuristic], result };
    });

    if(compareBody) {
        compareBody.innerHTML = results.map(({ label, result }) => `
          <tr>
            <td>${label}</td>
            <td>${result.timeMs.toFixed(3)} ms</td>
            <td>${result.expandedCount}</td>
            <td>${result.success ? result.pathCost.toFixed(1) : "-"}</td>
            <td>${result.message}</td>
          </tr>
        `).join("");
    }

    const selected = results.find((item) => item.heuristic === state.heuristic) || results[0];
    state.visitedIds = selected.result.visitedOrder;
    state.pathIds = selected.result.path;
    updateMetrics(selected.result);
    draw();
  }

  function clearRunVisuals() {
    clearAnimationOnly();
    state.visitedIds = [];
    state.pathIds = [];
    state.courierPos = null;
  }

  function clearAnimationOnly() {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
    state.animating = false;
  }

  function updateMetrics(result) {
    if (!result) {
      if(metricEls.time) metricEls.time.textContent = "-";
      if(metricEls.expanded) metricEls.expanded.textContent = "-";
      if(metricEls.distance) metricEls.distance.textContent = "-";
      if(metricEls.steps) metricEls.steps.textContent = "-";
      if(metricEls.status) {
          metricEls.status.textContent = "Belum dijalankan";
          metricEls.status.style.color = "#1666d8";
      }
      if(metricEls.reason) metricEls.reason.textContent = "-";
      return;
    }
    if(metricEls.time) metricEls.time.textContent = `${result.timeMs.toFixed(3)} ms`;
    if(metricEls.expanded) metricEls.expanded.textContent = result.expandedCount;
    if(metricEls.distance) metricEls.distance.textContent = result.success ? `${result.pathCost.toFixed(1)} px` : "-";
    if(metricEls.steps) metricEls.steps.textContent = result.steps;
    
    if(metricEls.status) {
        metricEls.status.textContent = result.message;
        metricEls.status.style.color = result.success ? "#18a85b" : "#d93232";
    }
    if(metricEls.reason) metricEls.reason.textContent = result.reason || "-";
  }

  function draw() {
    window.MapRenderer.render(canvas, state.mapData, {
      startId: state.startId,
      goalId: state.goalId,
      visitedIds: state.visitedIds,
      pathIds: state.pathIds,
      courierPos: state.courierPos, 
      courierType: state.courierType, 
      zoom: state.zoom,
      panX: state.panX,
      panY: state.panY
    });
  }
})();