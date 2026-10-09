# Field Monitoring

A web app for managing agricultural fields: view fields on a map, switch between them, and record monitoring points (soil samples, pests, plant diseases) inside the selected field. Points are stored in the browser; there is no backend.

## Getting started

Requirements: Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` without emitting |

## Features

**Map and fields**
- Leaflet map with five fields loaded from GeoJSON
- Pick a field from the list or by clicking it on the map; the active field is highlighted and the map flies to it
- Field name, crop and area are shown in the list and in a card on the map

**Monitoring points**
- Click inside the active field to add a point. Clicks outside it either switch to the clicked field or show a hint
- Each point has WGS 84 coordinates, an MGRS reference computed in the browser, a type, an optional description and a creation date
- Every point type has its own marker icon and color
- Points can be deleted from the map popup or from the list, with an undo option in the toast

**Points panel**
- Show points for the active field or for all fields
- Filter by type, search by description, sort by date (newest or oldest first)
- Empty states for "no points yet" and "nothing matches the filters"

**Layout**
- Desktop (≥ 1024 px): sidebar next to the map
- Tablet (< 1024 px): full-screen map with a slide-in drawer. The drawer is inert while closed, and focus moves into it when it opens and back to the toggle when it closes

## Tech stack

| | Why |
| --- | --- |
| React 19 + TypeScript (strict) | React 18+ was required. 19 because react-leaflet 5 depends on it |
| Vite 8 | Required build tool |
| Leaflet + react-leaflet 5 | Required map library. react-leaflet makes layers declarative and handles their lifecycle |
| Zustand 5 (+ `persist`) | Minimal boilerplate, selectors avoid unnecessary re-renders, built-in localStorage persistence |
| Tailwind CSS 4 | Required. No component library, so every UI piece in the repo is plain, readable code |
| `@turf/area`, `@turf/boolean-point-in-polygon` | Geodesic area and point-in-polygon on real geometry |
| `mgrs` | WGS 84 → MGRS conversion |
| Vitest | Same pipeline as Vite, zero extra config |

TypeScript is pinned to 6.0 because `typescript-eslint` does not support 7.x yet. `@typescript-eslint/no-explicit-any` is set to `error`, and there are no `any` types in the codebase.

## Project structure

```text
src/
  data/fields.json      Field boundaries (GeoJSON FeatureCollection)
  types/                Field, MonitoringPoint, PointType
  lib/                  Framework-free logic, covered by unit tests
    fields.ts           Runtime validation of GeoJSON, area calculation
    geo.ts              [lng, lat] -> [lat, lng], point-in-polygon, MGRS
    points.ts           Filter / search / sort, validation of stored points
    format.ts           Area, coordinates and date formatting
  store/                Zustand stores: fields, points (persisted), toasts
  hooks/                useMediaQuery
  components/
    map/                MapView, layers, click handling, marker icons
    panel/              Field list, points panel, filters
    points/             Point form, coordinates, type icon (shared by map and panel)
```

## Architecture decisions

**Logic lives in `lib/`, not in components.** Validation, geometry and the points query are plain functions with tests. Components only wire them to state, e.g. `PointsPanel` calls `queryPoints` inside `useMemo`.

**Three small stores instead of one.**
- `useFieldsStore` holds the static fields and the active field id.
- `usePointsStore` holds the points and is persisted to localStorage.
- `useToastStore` holds notifications.

Toasts have their own store because a localStorage write error is reported from inside the points store's storage adapter. Calling the points store's `set` from there would just trigger another write. Filter state is local to the points panel, because nothing else reads it.

**Everything loaded at runtime is untrusted.**
- Field GeoJSON is validated with type guards: Polygon geometry, closed rings, coordinate ranges, unique ids. Invalid features are skipped with a warning, so one bad feature doesn't break the rest.
- Points restored from localStorage go through the same kind of validation in `persist.merge`.

**Area is computed, not read from the data.** The sample feature in the assignment declares `area: 45.2`, but that polygon is actually about 78.7 ha. The app calculates the geodesic area with turf instead of trusting a stored value.

**One place swaps coordinate order.** GeoJSON uses `[lng, lat]` and Leaflet uses `[lat, lng]`. `polygonToLatLngs` in `lib/geo.ts` is the only place that converts between them, and the rest of the code passes `{ lat, lng }` objects.

**A single map click handler.** Field polygons let clicks bubble up to the map. `MapClickHandler` decides what the click means by checking geometry: add a point, switch fields, or show a hint. This avoids per-polygon handlers and `stopPropagation` chains.

**React state owns the draft point popup.** Leaflet is not allowed to close that popup on its own: there is no close button, and Esc, auto-close and close-on-click are disabled. The popup disappears only when React unmounts it, so React state and the map can't drift apart.

**Clicks inside popups are stopped natively.** Leaflet ignores clicks inside popups by walking up from `event.target` to the popup container. Popup content is a React portal, and React handles its events before they reach the map container. So a button that removes itself (Cancel, Delete) is already detached from the DOM when Leaflet checks it, and the click used to fall through to the map. The click is now stopped on the popup element itself.

**Rendering details.**
- Polygon positions and marker icons are memoized or cached, because react-leaflet compares those props by reference.
- The SVG renderer uses `padding: 1` instead of the default `0.1`. With the default, large fields showed clipped edges while dragging at high zoom, until the redraw on `moveend`.

## Error handling

| Case | Behaviour |
| --- | --- |
| Invalid field in GeoJSON | Skipped; a warning appears above the field list |
| Corrupted points in localStorage | Invalid entries dropped, toast with the count |
| Unparseable localStorage JSON | App starts with no points, toast |
| localStorage full or blocked on write | In-memory state keeps working, toast warns that changes won't survive a reload |
| Tile server unreachable | Fields and points still render; one toast instead of a silent grey map |
| MGRS undefined (polar regions, invalid input) | Shown as "unavailable" instead of throwing |
| Render error in the map | Map-level error boundary with "try again"; the panel keeps working |
| Any other render error | App-level error boundary with a reload button |

## Assumptions

- **Field data.** Boundaries are real farmland parcels from OpenStreetMap (`landuse=farmland`), near the villages of Potiivka and Nastashka in the Bila Tserkva district. OSM way ids: 401036416, 401038406, 401036415, 401036417, 401036427. The crop names are made up.
- **Point placement.** A point can only be added inside the active field, and the field is checked on real geometry, not on its bounding box.
- **Coordinates.** Stored rounded to 6 decimal places, which is about 10 cm. A map click is far less precise than that. MGRS is shown at 1 m precision and computed on render, not stored.
- **Point type.** Must be chosen explicitly; there is no default type, to avoid mislabelled points.
- **Default list scope.** The points list shows the active field by default. The "All fields" toggle covers the "list of all points" requirement.
- **Search.** Matches the description only, as specified. Type and field have their own filters.
- **Deletion.** Uses an undo toast instead of a confirmation dialog: it's one click to delete and one click to recover.
- **Persistence.** Points are stored per browser. There is no sync between devices.

## Testing

```bash
npm test
```

Unit tests cover everything in `lib/`:
- GeoJSON validation
- area calculation, including the sample from the assignment
- point-in-polygon on a concave shape, where a bounding-box check would give wrong answers
- MGRS conversion and its edge cases
- filtering, search and sorting
- validation of stored points
- formatting

UI behaviour was verified manually in the browser: adding, cancelling and deleting points, filters, the tablet drawer, and the error states.

## What I would add with more time

- **Component and end-to-end tests** (React Testing Library, Playwright) for map interactions. The popup click-through bug above is exactly the kind of regression they would catch.
- **Point editing.** Change the type or description, or drag the marker to move it.
- **List-to-map link.** Clicking a point in the list flies the map to it and opens its popup.
- **URL state** for the active field and filters, so a view can be shared or bookmarked.
- **Keyboard way to add points.** Right now adding a point requires a pointer.
- **Scaling.** Marker clustering for dense data, the canvas renderer and viewport culling for thousands of fields, a virtualized points list.
- **Backend integration** with TanStack Query: optimistic updates, retries, real ids and timestamps from the server.
- **Satellite base layer** as an option, since field boundaries are easier to read on imagery.
- **i18n.** The UI is Ukrainian-only for now.

## Data attribution

Map tiles and field boundaries © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, available under the Open Database License (ODbL).
