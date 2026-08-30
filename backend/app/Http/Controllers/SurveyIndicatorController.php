<?php

namespace App\Http\Controllers;

use App\Http\Resources\SurveyIndicatorResource;
use App\Surveys\SurveyAggregator;
use App\Surveys\SurveyCatalog;
use Illuminate\Support\Facades\Cache;

class SurveyIndicatorController extends Controller
{
    private const CACHE_TTL_SECONDS = 180;

    public function show(string $codDane, string $survey): SurveyIndicatorResource
    {
        $definition = SurveyCatalog::find($survey);

        $averages = Cache::remember(
            self::cacheKey($survey, $codDane),
            self::CACHE_TTL_SECONDS,
            static fn (): array => SurveyAggregator::averagesForInstitution($definition, $codDane)
        );

        $result = [
            'codDane' => $codDane,
            'respondentCount' => $averages['respondentCount'],
            'indicators' => $averages['indicators'],
        ];

        return new SurveyIndicatorResource($result, $definition);
    }

    public static function cacheKey(string $surveySlug, string $codDane): string
    {
        return "survey-indicators:{$surveySlug}:{$codDane}";
    }
}