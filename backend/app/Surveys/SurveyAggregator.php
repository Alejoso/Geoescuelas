<?php

namespace App\Surveys;

use Illuminate\Support\Facades\DB;

final class SurveyAggregator
{
    private const CONNECTION = 'supabase';
    private const COUNT_ALIAS = 'respondent_count';
    private const AVERAGE_ALIAS_PREFIX = 'avg_';

    /**
     * Averages every indicator of one survey across the respondents of one
     * institution, in a single query.
     *
     * @return array{respondentCount: int, indicators: array<string, float|null>}
     */
    public static function averagesForInstitution(Survey $survey, string $codDane): array
    {
        $query = DB::connection(self::CONNECTION)
            ->table($survey->table)
            ->where('cod_dane', $codDane)
            ->selectRaw(sprintf('COUNT(*) AS %s', self::COUNT_ALIAS));

        // Column names come from the catalog, never from the request, so
        // interpolating them into raw SQL carries no injection risk. $codDane
        // is parameter-bound by where().
        foreach ($survey->indicatorColumns as $column) {
            $query->selectRaw(sprintf('AVG(%s) AS %s', $column, self::aliasFor($column)));
        }

        // An aggregate with no GROUP BY always returns exactly one row, even
        // when nobody matched.
        $row = $query->first();

        $indicators = [];

        foreach ($survey->indicatorColumns as $column) {
            $average = $row->{self::aliasFor($column)};
            $indicators[$column] = self::toFloatOrNull($average);
        }

        return [
            'respondentCount' => (int) $row->{self::COUNT_ALIAS},
            'indicators' => $indicators,
        ];
    }

    private static function aliasFor(string $column): string
    {
        return self::AVERAGE_ALIAS_PREFIX . $column;
    }

    // AVG returns NULL when no respondent answered a section. Casting straight
    // to float would turn that into 0.0, which reads as a genuine floor score.
    private static function toFloatOrNull(mixed $value): ?float
    {
        if ($value === null) {
            return null;
        }

        return (float) $value;
    }
}