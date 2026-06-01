document.addEventListener("DOMContentLoaded", () => {
  const route = document.getElementById("introRoutePath");
  const movingNode = document.getElementById("introMovingNode");
  const movingHalo = document.getElementById("introMovingHalo");
  const reveal = document.getElementById("introRevealClean");

  if (!route || !movingNode || !movingHalo || !reveal) return;

  const totalLength = route.getTotalLength();
  const duration = 4300;
  let finished = false;

  route.style.strokeDasharray = totalLength;
  route.style.strokeDashoffset = totalLength;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function setPosition(progress) {
    const eased = easeInOutCubic(progress);
    const currentLength = totalLength * eased;
    const point = route.getPointAtLength(currentLength);

    movingNode.setAttribute("cx", point.x);
    movingNode.setAttribute("cy", point.y);
    movingHalo.setAttribute("cx", point.x);
    movingHalo.setAttribute("cy", point.y);
    route.style.strokeDashoffset = totalLength - currentLength;
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    setPosition(1);
    document.body.classList.add("intro-finished");
    reveal.classList.add("show");
  }

  function animate(startTime) {
    function step(now) {
      if (finished) return;

      const progress = Math.min((now - startTime) / duration, 1);
      setPosition(progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setTimeout(finishIntro, 260);
      }
    }

    requestAnimationFrame(step);
  }

  setPosition(0);
  requestAnimationFrame((time) => animate(time));
});
