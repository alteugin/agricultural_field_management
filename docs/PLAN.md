# План реалізації

## Стек

- Vite + React 19 + TypeScript (strict). React 19 бо react-leaflet 5 його вимагає; ТЗ дозволяє 18+
- Tailwind CSS v4 (без UI-кіту)
- react-leaflet 5 + Leaflet 1.9
- Zustand + `persist` (localStorage)
- `@turf/area`, `@turf/boolean-point-in-polygon`, `mgrs`
- Vitest — unit-тести тільки для `src/lib`

## Структура

```text
src/
  data/fields.json      # 5 реальних полів з OSM (GeoJSON FeatureCollection)
  types/                # Field, MonitoringPoint, PointType
  store/                # useFieldsStore, usePointsStore, useToastStore
  lib/fields.ts         # валідація та нормалізація GeoJSON, площа
  lib/geo.ts            # lng/lat swap, point-in-polygon, MGRS
  lib/points.ts         # filter / search / sort
  components/map/       # MapView, FieldsLayer, PointsLayer, іконки
  components/panel/     # FieldList, PointsPanel, PointsFilters, PointsListItem
  components/points/    # PointForm, Coordinates, PointTypeIcon, стилі типів
```

## Етапи

1. [x] Каркас: Vite, TS strict, Tailwind, ESLint, Vitest
2. [x] Типи + mock-поля
3. [x] `lib/` + тести
4. [x] Стори (persist з версією та безпечним відновленням)
5. [x] Карта: поля, активне поле, вибір кліком, fitBounds, назва/площа
6. [x] Додавання точки: перевірка межі поля, форма, WGS84 + MGRS
7. [x] Іконки за типом, видалення (з undo в тості)
8. [x] Панель: фільтр за типом, пошук, сортування, активне поле / всі
9. [x] Адаптив: desktop sidebar (≥1024px), tablet drawer
10. [ ] Обробка помилок: ErrorBoundary, MGRS, storage, порожні стани
11. [ ] README

## Рішення та припущення

- Площу рахуємо turf-ом, а не беремо з `properties`: у прикладі ТЗ `area: 45.2`, а полігон реально ~78.7 га
- Список точок: за замовчуванням активне поле, з перемикачем «всі поля»
- Обсяг — строго ТЗ
- Поля: реальні контури `landuse=farmland` з OpenStreetMap (© OpenStreetMap contributors, ODbL), між селами Потіївка та Насташка, Білоцерківський р-н. OSM way id: 401036416, 401038406, 401036415, 401036417, 401036427. Культури вигадані
- SVG-рендерер карти з `padding: 1` (замість 0.1): інакше на великому зумі під час перетягування видно обрізані краї полігонів до `moveend`
