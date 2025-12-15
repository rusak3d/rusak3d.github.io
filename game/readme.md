```
rusak-k8-drive/
  index.html

  /src/
    main.js                # вход: сцена, рендер, луп, resize, bootstrap
    config.js              # константы (MODEL_URL, цвета, параметры камеры/дня/ночи/террейна)
    ui/
      hud.js               # hud + topbar + легенда, биндинги DOM, рендер текста
      dashboard.js         # спидометр/передачи/rpm
      timeControls.js      # Auto/Manual время + slider
    world/
      terrain.js           # lowpoly terrain + height functions
      environment.js       # сборка окружения (terrain group, fog presets)
      markers.js           # 3D GPS-маркеры (pickup/drop) + обновление
      dayNight.js          # смена дня/ночи (свет/фон/туман/exposure)
      minimap.js           # миникарта (рендер + overlay + пины)
    vehicle/
      vehicle.js           # загрузка GLB, нормализация, solid material, позиционирование
      physics.js           # «вес»/гравитация, прижим к земле без провала
      drive.js             # управление WASD, кинематика, chase camera, сглаживание
    missions/
      missions.js          # список миссий + state
      missionRuntime.js    # auto A: pickup/dropoff по радиусу + UI/markers sync
    loaders/
      gltfLoader.js        # GLTFLoader + URLModifier + fallback texture
    input/
      input.js             # клавиши, переключатели режимов, helpers H
    tests/
      selfTests.js         # runSelfTests()

  /assets/
    (пусто, если модели грузим по URL)
```
