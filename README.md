# Comic Universe Plugin - UTOON

Plugin HTTP API for Comic Universe backed by UTOON.

## Capabilities

- `metadata`
- `content`

## Features

- `onDemandPageList`

## Endpoints

- `POST /api/getList`
- `POST /api/search` - body `{ search }`
- `POST /api/getDetails` - body `{ siteId }`
- `POST /api/getChapters` - body `{ siteId }`
- `POST /api/getPages` - body `{ chapterSiteId }`
- `POST /api/downloadChapter` - stub
- `GET /api/metadata`

## Dev

```bash
npm install
npm run dev
```

## Cloudflare

UTOON blocks some server environments with Cloudflare. When that happens, configure one of:

- `UTOON_COOKIE`
- `UTOON_CF_CLEARANCE`

Optional overrides:

- `UTOON_BASE_URL`
- `UTOON_SEARCH_PATH`
- `UTOON_USER_AGENT`

## Install in Comic Universe

Use deep link:

```text
comic-universe-tauri://plugin/install?url=<PLUGIN_BASE_URL>/api&metadataUrl=<PLUGIN_BASE_URL>/api/metadata&name=UTOON&tag=utoon
```
