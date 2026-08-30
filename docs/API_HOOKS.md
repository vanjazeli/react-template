# API Hooks: Queries & Mutations

Convention for how a feature talks to the backend, built on TanStack Query + Axios, with a mocked handler for every endpoint.

## File set per endpoint

Each endpoint gets its own hook, named `use<Verb><Resource>` (`useGetHome`, `usePostLogin`, `usePostJoinConversation`), living in an `api/` folder next to the feature that owns it. Only create the files actually needed:

```
api/
  use<Verb><Resource>.api.ts       # the hook itself — required
  use<Verb><Resource>.consts.ts    # the URL (string or path-builder fn)
  use<Verb><Resource>.handler.ts   # MSW mock handler for this endpoint
  use<Verb><Resource>.types.ts     # request/response DTO types
  use<Verb><Resource>.utils.ts     # helper logic, if any (e.g. blob download)
```

If an endpoint is only ever used by one hook, its URL constant lives in that hook's own `.consts.ts`. If several hooks in a shared scope need it, hoist it to that scope's `consts/endpoints.consts.ts` instead.

## The request client

All requests go through a shared Axios wrapper:

```ts
import { createRequestClient } from '@common/utils/createRequestClient.utils'

const { requestClient } = createRequestClient()
```

It centralizes the base URL, attaches the request token, and handles shared error cases (e.g. forcing a logout on `401`). Every `.api.ts` file gets its client this way rather than importing `axios` directly. A hook that talks to a different backend/provider uses that provider's own client instead.

## Queries

```ts
export const useGet<Resource> = () => {
  const { requestClient } = createRequestClient()

  return useQuery({
    queryKey: [GET_<RESOURCE>_URL],
    queryFn: async () => {
      const { data } = await requestClient.get<Get<Resource>DtoT>(GET_<RESOURCE>_URL)
      return data
    },
  })
}
```

Rules:

- `queryKey` is the URL constant itself (wrapped in an array) — no separate key literals to keep in sync.
- If the endpoint takes a path/query param, the URL constant is a function and the resolved URL becomes the key: `queryKey: [GET_MESSAGES_URL(conversationId)]`.
- The response type is a dedicated `Get<Resource>DtoT` exported from the sibling `.types.ts`.
- No `select`, transforms, or business logic beyond unwrapping `data` — that belongs in the consuming component/hook.

### Infinite (paginated) queries

Same shape, using `useInfiniteQuery`:

```ts
return useInfiniteQuery({
  queryKey: [GET_ < RESOURCE > _URL],
  queryFn: async ({ pageParam }) => {
    const { data } = (await requestClient.get) < Get<Resource>
    PageDtoT >
      (GET_ < RESOURCE > _URL,
      {
        params: { ...(pageParam && { cursor: pageParam }) },
      })
    return data
  },
  initialPageParam: undefined as string | undefined,
  getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
  select: data => data.pages.flatMap(page => page.items),
})
```

`select` is used here specifically to flatten `pages` into one list, so consumers never deal with the page-shaped result.

## Mutations

```ts
type Use<Action><Resource>PropsT = {
  onSuccess?: (...) => void
  onError?: () => void
}

export const use<Action><Resource> = ({ onSuccess, onError }: Use<Action><Resource>PropsT) => {
  const { requestClient } = createRequestClient()

  return useMutation({
    mutationFn: (payload: Post<Resource>PayloadT) => requestClient.post(POST_<RESOURCE>_URL, payload),
    onSuccess,
    onError,
  })
}
```

Rules:

- Side effects the caller needs (toast, navigation, refetch) are handled by accepting `onSuccess`/`onError` callbacks as hook props, **or** by handling them inline in the hook when they're intrinsic to the mutation (e.g. always invalidate the same queries, always navigate to the same place). Don't mix — pick whichever makes the call site simplest for that specific mutation.
- To refresh dependent data after a mutation, pull in `useQueryClient` and invalidate by the same URL-constant keys the queries use:
  ```ts
  const queryClient = useQueryClient()
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [GET_ < RESOURCE > _URL] })
  }
  ```
- Payload shape gets its own type (`Post<Resource>PayloadT`) next to the hook, either in `.api.ts` if small and local, or `.types.ts` if shared with the handler.
- A mutation that needs a path param takes it as a hook argument (not a mutation variable) when it's fixed for the hook's lifetime, and as a mutation variable when it can change per call.

## URL constants

```ts
// static
export const GET_HOME_URL = '/api/home'

// parameterized — one function returning the real path
export const POST_JOIN_CONVERSATION_URL = (id: string) => `/api/conversations/${id}/join`

// parameterized + needs an MSW pattern too
export const RESOURCE_URL = (id: string) => `/api/resource/${id}`
export const RESOURCE_URL_PATTERN = '/api/resource/:id'
```

Use the plain function for real requests and query keys; export a `..._PATTERN` string only when the handler needs an MSW path-matcher (`:id`) and can't use the resolved URL.

## Mock handlers

Every hook ships a matching mock (via `msw`) so the app runs fully offline in dev/tests. Handlers are built with a small factory such as `createBackendMswHandler` — it takes `{ url, method, handler, delay? }` and returns an `msw` `http.<method>` handler. If a hook talks to a different backend/provider, use that provider's own handler factory instead.

This is worth having when frontend and backend are being built in parallel by different people — it lets the frontend implement and demo a feature against realistic fake data (usually via `@faker-js/faker`) before the real endpoint exists. If it's a single person building both sides, this is unnecessary overhead: build the backend endpoint first, then have the hook call it directly, and skip `.handler.ts`/faker entirely for that endpoint.

```ts
export const handler = createBackendMswHandler({
  url: GET_ < RESOURCE > _URL, // or the _PATTERN constant if the URL has params
  method: 'get',
  handler: () => HttpResponse.json(mockData),
})
```

- GET handlers return realistic fake data (commonly generated with `@faker-js/faker`).
- Mutating handlers (`post`/`put`/`patch`/`delete`) usually just return `HttpResponse.json({})` — enough for the app to treat the call as successful.
- If one hook covers more than one endpoint, `handler` can be an array of `createBackendMswHandler(...)` calls instead of one.
- Handler files import only from `.consts.ts`/`.types.ts`, never from `.api.ts` — the mock must not depend on the real implementation.
