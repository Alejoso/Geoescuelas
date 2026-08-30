<?php

namespace App\Surveys;

/**
 * Describes one survey instrument: where its per-respondent rows live and which
 * columns hold its indicators.
 */
final class Survey
{
    /**
     * @param list<string> $indicatorColumns Gold-schema column names, used
     *        verbatim as field names in the JSON response.
     */
    public function __construct(
        public readonly string $slug,
        public readonly string $table,
        public readonly string $respondentCountField,
        public readonly array $indicatorColumns,
    ) {
    }
}