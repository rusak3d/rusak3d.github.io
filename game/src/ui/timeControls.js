// src/ui/timeControls.js
export function createTimeControls(dom, dayNight, onChange){
  function applyUi(){
    if (dom.timeAuto) dom.timeAuto.textContent = dayNight.manual ? 'Manual' : 'Auto';
    if (dom.timeSlider) dom.timeSlider.style.opacity = dayNight.manual ? '1' : '0.35';
  }

  function toggleMode(){
    dayNight.manual = !dayNight.manual;
    applyUi();
    onChange?.();
  }

  if (dom.timeAuto){
    dom.timeAuto.addEventListener('click', toggleMode);
  }

  if (dom.timeSlider){
    dom.timeSlider.min = '0';
    dom.timeSlider.max = '24';
    dom.timeSlider.step = '0.05';
    dom.timeSlider.value = String(dayNight.manualHour);
    dom.timeSlider.addEventListener('input', () => {
      dayNight.manual = true;
      dayNight.manualHour = parseFloat(dom.timeSlider.value) || 12;
      applyUi();
      onChange?.();
    });
  }

  applyUi();
  return { toggleMode, applyUi };
}
