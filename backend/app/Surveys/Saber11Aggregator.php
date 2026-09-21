<?php

namespace App\Surveys;

use Illuminate\Support\Facades\DB;

final class Saber11Aggregator
{
    private const CONNECTION = 'supabase';

    private const INSTITUTION_TABLE = 'ficha_alumnos_icfes';
    private const NATIONAL_TABLE = 'ficha_alumnos_icfes_colombia_medellin';
    private const CLASSIFICATION_TABLE = 'clasificacion_ie_icfes';
    private const INCORRECT_ANSWERS_TABLE = 'respuestas_incorrectas_icfes';

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
     *     incorrectasPorArea: list<array{area: string, incorrectasEe: float|null, incorrectasColombia: float|null}>,
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
            'incorrectasPorArea' => self::incorrectAnswersByArea($codDane),
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

    /**
     * Averages incorrectas (ee) and incorrectas (colombia) across every
     * competencia / aprendizaje especifico row, grouped up to the four areas.
     * This table has no año column, so unlike the others it isn't scoped by
     * YEAR — per your note, it only ever holds the latest year's data.
     *
     * @return list<array{area: string, incorrectasEe: float|null, incorrectasColombia: float|null}>
     */
    private static function incorrectAnswersByArea(string $codDane): array
    {
        $rows = DB::connection(self::CONNECTION)
            ->table(self::INCORRECT_ANSWERS_TABLE)
            ->where('codigo dane', $codDane)
            ->select('area')
            ->selectRaw('AVG("incorrectas (ee)") as incorrectas_ee')
            ->selectRaw('AVG("incorrectas (colombia)") as incorrectas_colombia')
            ->groupBy('area')
            ->get();

        return $rows->map(static fn ($row) => [
            'area' => $row->area,
            'incorrectasEe' => self::toFloatOrNull($row->incorrectas_ee),
            'incorrectasColombia' => self::toFloatOrNull($row->incorrectas_colombia),
        ])->all();
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