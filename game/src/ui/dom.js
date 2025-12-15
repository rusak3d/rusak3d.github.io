// src/ui/dom.js
export function getDom(){
  const $ = (id) => document.getElementById(id);

  return {
    canvas: $('bg'),
    loader: $('loader'),
    errdot: $('errdot'),
    hud: $('hud'),

    // dashboard
    spdVal: $('spdVal'),
    gearMode: $('gearMode'),
    gearVal: $('gearVal'),
    rpmVal: $('rpmVal'),
    rpmFill: $('rpmFill'),

    // time
    timeVal: $('timeVal'),
    timeAuto: $('timeAuto'),
    timeSlider: $('timeSlider'),

    // paint buttons
    btnStock: $('btnStock'),
    btnOrange: $('btnOrange'),
    btnNavy: $('btnNavy'),

    // missions topbar
    taskList: $('taskList'),
    tasksDone: $('tasksDone'),
    tasksTotal: $('tasksTotal'),
    tasksFill: $('tasksFill'),
    taskHint: $('taskHint'),
    cargoState: $('cargoState'),

    // minimap
    minimapWrap: $('minimapWrap'),
    minimap: $('minimap'),
    minimapOverlay: $('minimapOverlay'),
  };
}
