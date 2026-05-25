(function () {
  "use strict";

  const canvas = document.getElementById("mapCanvas");
  const gridSelect = document.getElementById("gridSize");
  const heuristicSelect = document.getElementById("heuristic");
  const runBtn = document.getElementById("runBtn");
  const resetBtn = document.getElementById("resetBtn");
  const randomNodeBtn = document.getElementById("randomNodeBtn");
  const randomObstacleBtn = document.getElementById("randomObstacleBtn");
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
    activeObstacleIds: [...window.MapRenderer.DEFAULT_OBSTACLES],
    mapData: null,
    startId: null,
    goalId: null,
    visitedIds: [],
    pathIds: [],
    animationFrame: null,
    animating: false,
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

    runBtn.addEventListener("click", runAnimatedAStar);

    resetBtn.addEventListener("click", () => {
      clearRunVisuals();
      updateMetrics(null);
      compareBody.innerHTML = `<tr><td colspan="5">Klik “Bandingkan Heuristik”.</td></tr>`;
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

    randomObstacleBtn.addEventListener("click", () => {
      state.activeObstacleIds = window.MapRenderer.randomObstacleIds();
      rebuildMap(false);
      clearRunVisuals();
      updateMetrics(null);
      draw();
    });

    compareBtn.addEventListener("click", compareHeuristics);

    canvas.addEventListener("click", (event) => {
      const [x, y] = window.MapRenderer.screenToMap(canvas, event.clientX, event.clientY);
      const nearest = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, x, y);
      if (!nearest) return;

      if (event.shiftKey) {
        state.goalId = nearest.id;
      } else {
        state.startId = nearest.id;
      }
      clearRunVisuals();
      updateMetrics(null);
      draw();
    });

    window.addEventListener("resize", draw);
  }

  function rebuildMap(firstLoad) {
    const previousStart = state.startId ? state.mapData?.graph.getNode(state.startId) : null;
    const previousGoal = state.goalId ? state.mapData?.graph.getNode(state.goalId) : null;

    state.mapData = window.MapRenderer.createMapModel(state.gridSize, state.activeObstacleIds);

    if (firstLoad || !previousStart || !previousGoal) {
      const start = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, 80, 345);
      const goal = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, 385, 65);
      state.startId = start ? start.id : null;
      state.goalId = goal ? goal.id : null;
      return;
    }

    const newStart = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, previousStart.x, previousStart.y);
    const newGoal = window.MapRenderer.findNearestAvailableNode(state.mapData.graph, previousGoal.x, previousGoal.y);
    state.startId = newStart ? newStart.id : null;
    state.goalId = newGoal ? newGoal.id : null;

    if (!state.startId || !state.goalId || state.startId === state.goalId) {
      const pair = window.MapRenderer.pickRandomPair(state.mapData.graph);
      state.startId = pair.startId;
      state.goalId = pair.goalId;
    }
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

    let index = 0;
    const batchSize = state.gridSize <= 10 ? 1 : state.gridSize <= 20 ? 2 : 3;

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
      state.animating = false;
      draw();
    }

    step();
  }

  function compareHeuristics() {
    clearAnimationOnly();
    const heuristics = ["manhattan", "chebyshev", "euclidean"];
    const labels = {
      manhattan: "Manhattan",
      chebyshev: "Chebyshev",
      euclidean: "Euclidean",
    };

    const results = heuristics.map((heuristic) => {
      const result = window.AStar.runAStar(state.mapData.graph, state.startId, state.goalId, { heuristic });
      return { heuristic, label: labels[heuristic], result };
    });

    compareBody.innerHTML = results.map(({ label, result }) => {
      return `
        <tr>
          <td>${label}</td>
          <td>${result.timeMs.toFixed(3)} ms</td>
          <td>${result.expandedCount}</td>
          <td>${result.success ? result.pathCost.toFixed(1) : "-"}</td>
          <td>${result.message}</td>
        </tr>
      `;
    }).join("");

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
    metricEls.time.textContent = "-";
    metricEls.expanded.textContent = "-";
    metricEls.distance.textContent = "-";
    metricEls.steps.textContent = "-";
    metricEls.status.textContent = "Belum dijalankan";
    metricEls.reason.textContent = "-";
    return;
  }

  metricEls.time.textContent = `${result.timeMs.toFixed(3)} ms`;
  metricEls.expanded.textContent = result.expandedCount;
  metricEls.distance.textContent = result.success ? `${result.pathCost.toFixed(1)} px` : "-";
  metricEls.steps.textContent = result.steps;
  metricEls.status.textContent = result.message;
  metricEls.reason.textContent = result.reason || "-";
}

  function draw() {
    window.MapRenderer.render(canvas, state.mapData, {
      startId: state.startId,
      goalId: state.goalId,
      visitedIds: state.visitedIds,
      pathIds: state.pathIds,
      showNodes: false,
    });
  }
})();
