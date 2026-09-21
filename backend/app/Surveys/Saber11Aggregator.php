<?php

namespace App\Surveys;

use Illuminate\Support\Facades\DB;

final class Saber11Aggregator
{
    private const CONNECTION = 'supabase';

    private const INSTITUTION_TABLE = 'ficha_alumnos_icfes';
    private const NATIONAL_TABLE = 'ficha_alumnos_icfes_colombia_medellin';
    private const CLASSIFICATION_TABLE = 'clasificacion_ie_icfes';

    // Hardcoded to this year's results, same choice as the materialized
    // view's dynamic "año > 2024" filter was meant to avoid — this one is
    // intentionally pinned and will need bumping when 2026 data lands.
    private const YEAR = 2025;

    private const NATIONAL_SCOPE_COLUMN = 'colombia/medellin';
    private const NATIONAL_SCOPE_VALUE = 'colombia';

    /**
     * @return array{
     *     promedio: float|null,
     *     publicados: int|null,
     *     promedioNacional: float|null,
     *     publicadosNacional: int|null,
     *     clasificacion: string|null,
     * }
     */
    public static function summaryForInstitution(string $codDane): array
    {
        $institution = self::institutionRow($codDane);
        $national = self::nationalRow();
        $classification = self::classificationRow($codDane);

        return [
            'promedio' => self::toFloatOrNull($institution?->promedio),
            'publicados' => self::toIntOrNull($institution?->publicados),
            'promedioNacional' => self::toFloatOrNull($national?->promedio),
            'publicadosNacional' => self::toIntOrNull($national?->publicados),
            'clasificacion' => $classification?->clasificacion,
        ];
    }

    private static function institutionRow(string $codDane): ?object
    {
        return DB::connection(self::CONNECTION)
            ->table(self::INSTITUTION_TABLE)
            ->where('codigo dane', $codDane)
            ->where('año', self::YEAR)
            ->select('promedio', 'publicados')
            ->first();
    }

    private static function nationalRow(): ?object
    {
        return DB::connection(self::CONNECTION)
            ->table(self::NATIONAL_TABLE)
            ->where(self::NATIONAL_SCOPE_COLUMN, self::NATIONAL_SCOPE_VALUE)
            ->where('año', self::YEAR)
            ->select('promedio', 'publicados')
            ->first();
    }

    private static function classificationRow(string $codDane): ?object
    {
        return DB::connection(self::CONNECTION)
            ->table(self::CLASSIFICATION_TABLE)
            ->where('codigo dane', $codDane)
            ->where('año', self::YEAR)
            ->select('clasificacion')
            ->first();
    }

    private static function toFloatOrNull(mixed $value): ?float
    {
        return $value === null ? null : (float) $value;
    }

    private static function toIntOrNull(mixed $value): ?int
    {
        return $value === null ? null : (int) $value;
    }
}