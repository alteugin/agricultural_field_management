# План реалізації

## Стек
- Vite + React 19 + TypeScript (strict). React 19 бо react-leaflet 5 його вимагає; ТЗ дозволяє 18+
- Tailwind CSS v4 (без UI-кіту)
- react-leaflet 5 + Leaflet 1.9
- Zustand + `persist` (localStorage)
- `@turf/area`, `@turf/boolean-point-in-polygon`, `mgrs`
- Vitest — unit-тести тільки для `src/lib`

## Структура
```
src/
  data/fields.ts        # 4-5 полів (GeoJSON FeatureCollection)
  types/                # Field, MonitoringPoint, PointType
  store/                # useFieldsStore, usePointsStore
  lib/geo.ts            # pointInField, toMGRS, areaHa
  lib/points.ts         # filter / search / sort
  components/map/       # MapView, FieldsLayer, PointsLayer, іконки
  components/panel/     # FieldList, PointForm, PointsList, PointsFilters
```

## Етапи
1. [x] Каркас: Vite, TS strict, Tailwind, ESLint, Vitest
2. [ ] Типи + mock-поля
3. [ ] `lib/` + тести
4. [ ] Стори (persist з версією та безпечним відновленням)
5. [ ] Карта: поля, активне поле, вибір кліком, fitBounds, назва/площа
6. [ ] Додавання точки: перевірка межі поля, форма, WGS84 + MGRS
7. [ ] Іконки за типом, видалення
8. [ ] Панель: фільтр за типом, пошук, сортування, активне поле / всі
9. [ ] Адаптив: desktop sidebar, tablet drawer
10. [ ] Обробка помилок: ErrorBoundary, MGRS, storage, порожні стани
11. [ ] README

## Рішення та припущення
- Площу рахуємо turf-ом, а не беремо з `properties`: у прикладі ТЗ `area: 45.2`, а полігон реально ~78.8 га
- Список точок: за замовчуванням активне поле, з перемикачем «всі поля»
- Обсяг — строго ТЗ
