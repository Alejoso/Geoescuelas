<?php

namespace App\Surveys;

use InvalidArgumentException;

final class SurveyCatalog
{
    public const STUDENTS = 'students';
    public const TEACHERS_DIGITAL = 'teachers-digital';
    public const TEACHERS_STEM = 'teachers-stem';

    /**
     * @return array<string, Survey>
     */
    public static function all(): array
    {
        return [
            self::STUDENTS => new Survey(
                slug: self::STUDENTS,
                table: 'estudiantes_pensamiento_computacional',
                respondentCountField: 'numero_estudiantes_encuestados',
                indicatorColumns: [
                    'indicador_habilidades_digitales',
                    'indicador_inteligencia_artificial',
                    'indicador_pensamiento_computacional',
                ],
            ),
            self::TEACHERS_DIGITAL => new Survey(
                slug: self::TEACHERS_DIGITAL,
                table: 'docentes_competencias_digitales',
                respondentCountField: 'numero_docentes_encuestados',
                indicatorColumns: [
                    'acceso_uso_indicador',
                    'usos_tecnologias_indicador',
                    'potencialidades_indicador',
                    'dificultades_indicador',
                ],
            ),
            self::TEACHERS_STEM => new Survey(
                slug: self::TEACHERS_STEM,
                table: 'docentes_stem',
                respondentCountField: 'numero_docentes_encuestados',
                indicatorColumns: [
                    'modelos_inmersion',
                    'competencias_siglo_xxi',
                    'recursos_stem',
                    'competencias_digitales_docentes',
                    'alfabetizacion_ia',
                ],
            ),
        ];
    }

    public static function find(string $slug): Survey
    {
        $surveys = self::all();

        if (! isset($surveys[$slug])) {
            throw new InvalidArgumentException("Unknown survey: {$slug}");
        }

        return $surveys[$slug];
    }

    /**
     * @return list<string>
     */
    public static function slugs(): array
    {
        return array_keys(self::all());
    }
}