<?php

    if(substr_count($_SERVER['HTTP_HOST'], 'localhost')>0
        || substr_count($_SERVER['HTTP_HOST'], '192.168.')>0){
        $apiUrl = 'http://localhost/arpa/dbMeteo/';
    } else {
        $apiUrl = 'http://10.10.0.6/data_quality_management/';   // Sinergico
    }

    // ## Cattura parametri ##
    $idStazione = isset($_GET['idStaz']) ? $_GET['idStaz'] : '';
    $modalita = isset($_GET['modalita']) ? $_GET['modalita'] : '';
    $data = isset($_GET['data']) ? $_GET['data'] : '';
    $formato = isset($_GET['formato']) ? $_GET['formato'] : '';

    // ## Interrogazione API ##
    $response = file_get_contents($apiUrl.'api/osservazioni.php?formato='.$formato.'&idStaz='.$idStazione.'&modalita='.$modalita.'&data='.$data);

    // ## Stampa dell'output in JSON ##
    if($formato=='JSON'){
        header('Content-Type: application/json');
    }
    // ## Stampa dell'output in CSV (download) ##
    elseif($formato=='CSV'){
         header('Content-type: text/csv');
         header('Content-Disposition: attachment; filename="dati_'.$idStazione.'.csv"');
    }
    print $response;