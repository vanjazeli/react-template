# Feature-Based Folder Structure

A convention for organizing a frontend app by feature instead of by file type, so everything a piece of UI needs lives next to it.

## Top-level layout

```
src/
  features/   # all app functionality, organized by feature (see below)
  common/     # shared, feature-agnostic code (atomic-design components, providers, hooks, types, utils)
  routes/     # routing layer — route files import a Page from features/ and wire it to a URL
  setup/      # app bootstrapping (i18n, styles, global config)
```

`common/` holds anything reused across more than one feature. `features/` holds anything that belongs to one specific area of the app. A route file should contain almost no logic — it just points a URL at a feature's Page.

## First branch: access level

The first level under `features/` splits by **access level**, not by domain — e.g. `guest/` (unauthenticated) and `protected/` (authenticated). Everything domain-specific (login, dashboard, settings, etc.) nests _inside_ one of these, because access level is the broadest thing that's true about a piece of UI, before you get into what it actually does.

```
features/
  guest/
  protected/
```

_(This template repo's `src/features/` currently branches straight into `about/` and `home/` instead of `guest/`/`protected/` — that's only because it's a minimal example project with no auth. A real production project — especially one with authentication — should branch first by access level as described above.)_

## The recursive pattern

Below that first branch, every feature folder can contain the same shape, nested as deep as needed:

```
features/<some-feature>/
  index.ts        # barrel — re-exports the public piece of this feature (usually its Page)
  api/            # data-fetching hooks used by this feature
  components/     # UI building blocks local to this feature (can follow atomic design: atoms/molecules/organisms/templates)
  providers/      # local context providers, scoped to this feature and its children
  hooks/          # local hooks
  types/          # local types
  utils/          # local utils
  consts/         # local consts
  locales/        # local i18n strings (this can be omitted if multiple language support is not needed)
  features/       # child features — recurses infinitely
```

Only include the folders a given feature actually needs — don't scaffold empty ones.

A single unit of UI (a form, a page, a card) is usually a folder named after itself, with every file for that unit co-located and prefixed with its name:

```
SomeComponent/
  SomeComponent.tsx
  SomeComponent.hooks.ts
  SomeComponent.types.ts
  SomeComponent.utils.ts
  SomeComponent.consts.ts
  SomeComponent.locales.<lang>.json
  api/
    useSomeQuery.api.ts
    useSomeQuery.handler.ts
    useSomeQuery.types.ts
```

## Leaves: the `<Feature>Page` component

The recursion bottoms out at a `features/` folder whose children are plain sibling components (no further nested `features/`) — that's a leaf. One of those siblings is named `<Feature>Page`, e.g.:

```
features/some-feature/features/
  SomeFeaturePage/       # the leaf's entry point
  SomeFeatureForm/
  SomeFeatureHeader/
```

`<Feature>Page` is the thing that composes every other sibling in that leaf into the actual screen, it's the only piece the leaf's `index.ts` re-exports, and it's what ultimately gets consumed one layer up — either by a route file in `routes/`, or by a parent feature's `index.ts` re-exporting it further up the tree. Everything else in the leaf (`SomeFeatureForm`, `SomeFeatureHeader`, their `api/`/`hooks/`/`types/`, etc.) is an implementation detail of that Page and isn't meant to be imported from outside the leaf.

A non-leaf feature's `index.ts` doesn't define a Page of its own — it just re-exports the Page(s) of its child features, so consumers one level up don't need to know how deep the real leaf is:

```ts
// features/some-section/index.ts
export { ChildAPage } from '@features/some-section/features/child-a'
export { ChildBPage } from '@features/some-section/features/child-b'
```

## Why recursion instead of flat folders

- **Locality**: a feature's data-fetching, types, and sub-pieces live under it, not scattered across parallel top-level `hooks/`, `types/`, `api/` trees.
- **Encapsulation**: a feature only exposes what its `index.ts` re-exports; internal sub-features aren't meant to be imported directly from outside.
- **Scales down as well as up**: a trivial feature is just one folder with a `.tsx` file; a complex one grows its own `api/`, sub-features, etc. without needing to restructure.
- **Mirrors the UI tree**: nesting on disk matches nesting in the app, so the path to a file tells you where it sits in the product (e.g. protected area → some section → its sub-flow → its page).

## Naming conventions

- Component/feature folders that render something: PascalCase, matching the thing they export
- Route-segment-like grouping folders: kebab-case
- File suffixes indicate role: `.tsx` (component), `.hooks.ts`, `.types.ts`, `.utils.ts`, `.consts.ts`, `.api.ts`, `.handler.ts`, `.locales.<lang>.json`
- `index.ts` barrels sit at feature boundaries (the folders you'd import from elsewhere), not inside every leaf component folder
