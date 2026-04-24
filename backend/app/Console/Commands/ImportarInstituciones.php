<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\InstitucionEducativa;

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
        $path = '/home/alejo/indicadoresPrueba/instituciones_con_metricas.xlsx';
 
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
 
            $latRaw = (int) $data['latitud'];
            $lngRaw = (int) $data['longitud'];

            // Saltar registros con coordenadas anómalas
            $lat = $latRaw / 1e8;
            $lng = $lngRaw / 1e8;

            if ($lat < 5.5 || $lat > 7.5 || $lng < -77.0 || $lng > -74.0) {
                $bar->advance();
                continue;
            }

            InstitucionEducativa::updateOrCreate(
                ['consecutivo_dane' => trim($data['CONSECUTIVO DANE'])],
                [
                    'dane'                         => trim($data['DANE']),
                    'nombre'                       => trim($data['NOMBRE ESTABLECIMIENTO EDUCATIVO']),
                    'tipo_sede'                    => trim($data['TIPO DE SEDE']),
                    'zona'                         => trim($data[' Zona'] ?? $data['Zona'] ?? ''),
                    'direccion'                    => trim($data[' Dirección'] ?? $data['Dirección'] ?? ''),
                    'telefono'                     => trim($data[' Teléfono'] ?? $data['Teléfono'] ?? ''),
                    'estado'                       => trim($data[' Estado Sede'] ?? $data['Estado Sede'] ?? ''),
                    'niveles'                      => trim($data[' Niveles'] ?? $data['Niveles'] ?? ''),
                    'modelos'                      => trim($data[' Modelos'] ?? $data['Modelos'] ?? ''),
                    'grados'                       => trim($data[' Grados'] ?? $data['Grados'] ?? ''),
                    'comuna'                       => (int) $data['comuna'],
                    'latitud_raw'  => $latRaw,
                    'longitud_raw' => $lngRaw,
                    'latitud'  => $latRaw / 1e8,
                    'longitud' => $lngRaw / 1e8,
                    'numero_docentes_encuestados' =>  (int) $data['numero_docentes_encuestados'],
                    'indice_global_estudiantes'    => (float) $data['indice_global_estudiantes'],
                    'indice_global_stem'           => (float) $data['indice_global_stem'],
                    'indice_global_docentes'       => (float) $data['indice_global_docentes'],
                    'indice_global_ciberseguridad' => (float) $data['indice_global_ciberseguridad'],
                    'indice_global_icfes'          => (float) $data['indice_global_icfes'],
                ]
            );
 
            $bar->advance();
            $count++;
        }
 
        $bar->finish();
        $this->newLine();
        $this->info("✓ {$count} instituciones importadas correctamente.");
 
        return self::SUCCESS;
    }
}
