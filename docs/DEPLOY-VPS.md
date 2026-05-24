# Деплой: Vite + PocketBase на VPS

## Фронт (статика)

```bash
npm run build
# dist/ → nginx root или /var/www/tutor
```

Пример nginx:

```nginx
server {
  listen 80;
  server_name app.example.ru;
  root /var/www/tutor/dist;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## PocketBase

1. Скачать `pocketbase` для Linux amd64
2. Каталог `/opt/pocketbase`, данные `pb_data/`
3. systemd unit `pocketbase.service`
4. nginx reverse proxy `api.example.ru` → `127.0.0.1:8090`
5. HTTPS (certbot)

`.env` на сборке фронта:

```env
VITE_POCKETBASE_URL=https://api.example.ru
VITE_SITE_URL=https://app.example.ru
```

## RAM

1 GB VPS: только PocketBase + nginx (без Node SSR). Фронт — статика из `dist/`.
