<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CiberseguridadResource extends JsonResource
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
            'total_encuestados' => $result['totalEncuestados'],
            'encuestados_primaria' => $result['encuestadosPrimaria'],
            'encuestados_bachillerato' => $result['encuestadosBachillerato'],
            'histograma_sucesos' => $result['histograma'],
        ];
    }
}