<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\InstitucionEducativa;
use Illuminate\Support\Facades\Cache;

class ImportarInstituciones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'instituciones:importar';
    

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa instituciones educativas desde el Excel con métricas';

    /**
     * Execute the console command.
     */

    public function handle(): int
    {
        $path = '/var/www/storage/imports/ies_with_complete_info.xlsx';

        if (!file_exists($path)) {
            $this->error("Archivo no encontrado: {$path}");
            return self::FAILURE;
        }
 
        $this->info("Leyendo {$path}...");
 
        $spreadsheet = IOFactory::load($path);
        $rows        = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
 
        // Primera fila = encabezados
        $header = array_shift($rows);
        $header = array_map('trim', $header);
 
        $bar   = $this->output->createProgressBar(count($rows));
        $count = 0;
 
        foreach ($rows as $row) {
            $data = array_combine($header, $row);

            InstitucionEducativa::updateOrCreate(
                ['cod_dane' => trim($data['cod_dane'])],
                [
                    'nombre_institucion'           => trim($data['nombre_institucion']),
                    'indice_global_stem'           => (float) $data['indice_global_stem'],
                    'docentes_encuestados_stem'    => (int) $data['docentes_encuestados_stem'],
                    'indice_global_docentes'       => (float) $data['indice_global_docentes'],
                    'docentes_encuestados_cd'      => (int) $data['docentes_encuestados_cd'],
                    'indice_global_icfes'          => null,
                    'encuestados_icfes'            => null,
                    'indice_global_estudiantes'    => (float) $data['indice_global_estudiantes'],
                    'encuestados_estudiantes'      => (int) $data['encuestados_estudiantes'],
                    'indice_global_ciberseguridad' => null,
                    'encuestados_ciberseguridad'   => null,
                    'latitud'                      => trim($data['latitud']),
                    'longitud'                     => trim($data['longitud']),
                    'correo_institucional'         => trim($data['correo_institucional']),
                    'sede_principal'               => trim($data['sede_principal']),
                    'direccion'                    => trim($data['direccion']),
                    'calendario'                   => trim($data['calendario']),
                    'naturaleza'                   => trim($data['naturaleza']),
                    'sector'                       => trim($data['sector']),
                    'zona'                         => trim($data['zona']),
                    'jornada'                      => trim($data['jornada']),
                    'nivel'                        => trim($data['nivel']),
                    'telefono'                     => trim($data['telefono']),
                ]
            );

            $bar->advance();
            $count++;
        }

        Cache::forget('school.map');
 
        $bar->finish();
        $this->newLine();
        $this->info("✓ {$count} instituciones importadas correctamente.");
 
        return self::SUCCESS;
    }
}
