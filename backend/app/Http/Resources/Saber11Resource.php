<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Saber11Resource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $result = $this->resource;

        return [
            'cod_dane' => $result['codDane'],
            'promedio' => $result['promedio'],
            'publicados' => $result['publicados'],
            'promedio_nacional' => $result['promedioNacional'],
            'publicados_nacional' => $result['publicadosNacional'],
            'clasificacion' => $result['clasificacion'],
            'incorrectas_por_area' => array_map(static fn (array $item): array => [
                'area' => $item['area'],
                'incorrectas_ee' => $item['incorrectasEe'],
                'incorrectas_colombia' => $item['incorrectasColombia'],
            ], $result['incorrectasPorArea']),
        ];
    }
}