<?php

namespace App\Surveys;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class CiberseguridadAggregator
{
    private const CONNECTION = 'supabase';
    private const TABLE = 'ciberseguridad';

    private const FUENTE_PRIMARIA = 'encuesta_primaria';
    private const FUENTE_BACHILLERATO = 'encuesta_bachillerato';

    /**
     * @return array{
     *     totalEncuestados: int,
     *     encuestadosPrimaria: int,
     *     encuestadosBachillerato: int,
     *     histograma: list<array{categoria: string, cantidad: int}>
     * }
     */
    public static function summaryForInstitution(string $codDane): array
    {
        return [
            'totalEncuestados' => self::query($codDane)->count(),
            'encuestadosPrimaria' => self::query($codDane)
                ->where('fuente', self::FUENTE_PRIMARIA)
                ->count(),
            'encuestadosBachillerato' => self::query($codDane)
                ->where('fuente', self::FUENTE_BACHILLERATO)
                ->count(),
            'histograma' => self::histogramFor($codDane),
        ];
    }

    /**
     * @return list<array{categoria: string, cantidad: int}>
     */
    private static function histogramFor(string $codDane): array
    {
        // Rows with no recorded category are excluded rather than counted
        // under a "null" bucket, since an empty category isn't a real answer.
        return self::query($codDane)
            ->whereNotNull('suceso_cat_nombre')
            ->select('suceso_cat_nombre as categoria')
            ->selectRaw('COUNT(*) as cantidad')
            ->groupBy('suceso_cat_nombre')
            ->orderByDesc('cantidad')
            ->get()
            ->map(static fn ($row) => [
                'categoria' => $row->categoria,
                'cantidad' => (int) $row->cantidad,
            ])
            ->all();
    }

    // Every count above starts from "this institution's rows," so it's
    // factored out once instead of repeating the connection/table/where.
    private static function query(string $codDane): Builder
    {
        return DB::connection(self::CONNECTION)
            ->table(self::TABLE)
            ->where('cod_dane', $codDane);
    }
}