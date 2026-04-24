# How to create laravel as a rest API for Next.js

- En providers, colocar lo siguiente en `withMiddleware`
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```
- Luego: `php artisan config:publish cors`
- Luego modificamos el archivo config/cors.php y ponermos `'allowed_origins' => ['http://localhost:3000'],`
- Hacemos `php artisan config:clear`


# Esta va a ser la arquitectura planteanda por cluade
```
backend/
  app/Models/Institution.php
  app/Http/Controllers/Api/InstitutionController.php
  database/migrations/create_institutions_table.php
  routes/api.php

frontend/
  src/app/
    page.tsx          ← mapa principal
    institutions/
      [id]/
        page.tsx      ← detalle con KPIs
  src/components/
    Map.tsx           ← componente del mapa (Leaflet)
    InstitutionCard.tsx  ← popup con KPIs
  src/lib/
    api.ts            ← funciones para consumir Laravel
```

# Configuracion de la libreria de los mapas
- `npm install leaflet react-leaflet`
- `npm install -D @types/leaflet`
- Descargar el GeoJSON

# Reproyectar
- Instalar `sudo apt install gdal-bin`
- Reproyectar `ogr2ogr -f GeoJSON -t_srs EPSG:4326 barrios_wgs84.geojson barrios_y_veredas_mr.geojson`


