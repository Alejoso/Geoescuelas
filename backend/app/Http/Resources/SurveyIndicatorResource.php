<?php

namespace App\Http\Resources;

use App\Surveys\Survey;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SurveyIndicatorResource extends JsonResource
{
    public static $wrap = null;

    public function __construct($resource, private Survey $survey)
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $result = $this->resource;

        $identity = [
            'cod_dane' => $result['codDane'],
            $this->survey->respondentCountField => $result['respondentCount'],
        ];

        // Indicator keys are already the gold column names, which is the wire
        // contract.
        return array_merge($identity, $result['indicators']);
    }
}