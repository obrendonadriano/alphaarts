# Alpha Arts

Site estatico pronto para deploy na Vercel.

## Deploy na Vercel

- Framework Preset: Other
- Build Command: vazio
- Output Directory: vazio
- Root Directory: raiz do repositorio

O arquivo principal e `index.html`.

## Meta Pixel e CAPI

O Pixel usa o ID `796614969974062`.

Para ativar o CAPI na Vercel, adicione estas variaveis em **Settings > Environment Variables**:

- `META_CAPI_ACCESS_TOKEN`
- `META_PIXEL_ID` opcional, ja tem fallback no codigo
- `META_GRAPH_VERSION` opcional, ja tem fallback `v20.0`

Depois de adicionar ou alterar env vars, rode um novo deploy na Vercel.
