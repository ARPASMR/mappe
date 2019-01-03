	
	var markerStazioni = [];
	var attributiStazioni = [];
	var infoStazione;
    var meteoAPI = '';
	
	/**
	 *	Aggiunge alla mappa il layer delle stazioni di monitoraggio
	 */
	 	function visualizzaLayerStazioni(type){
            if(type=='xml'){
                // legge coordinate stazioni da file XML
                $(document).ready(function(){
                    $.ajax({
                        type: 'GET',
                        url: "resources/staz_lomb.xml",
                        dataType: "xml",
                        data: null,
                        async: true,
                        success: function(xml){
                            $(xml).find('marker').each(function(){
                                // Legge tutti gli attributi della stazione
                                attributiStazioni[$(this).attr('idstaz')] =
                                                {'id':	$(this).attr('idstaz'),
                                                 'nome':	$(this).attr('nome'),
                                                 'sensori': $(this).attr('sens'),
                                                 'quota': 	$(this).attr('quota')};
                                // Crea marker e lo aggiunge alla mappa
                                aggiungiMarker(new google.maps.LatLng($(this).attr('lat'), $(this).attr('lon')), $(this).attr('idstaz'));
                            });
                        }
                    });
                });
            }
            else if(type=='json'){
                 $(document).ready(function(){
                    $.ajax({
                        type: 'GET',
                        url: meteoAPI+"stazioni.php",
                        dataType: "json",
                        data: null,
                        async: true,
                        success: function(json){
                            $(json).each(function(){
                                // Legge tutti gli attributi della stazione
                                attributiStazioni[$(this).attr('idstaz')] =
                                                {'id':	$(this).attr('idstaz'),
                                                 'nome':	$(this).attr('nome'),
                                                 'sensori': $(this).attr('sens'),
                                                 'quota': 	$(this).attr('quota')};
                                // Crea marker e lo aggiunge alla mappa
                                aggiungiMarker(new google.maps.LatLng($(this).attr('lat'), $(this).attr('lon')), $(this).attr('idstaz'));
                            });
                        }
                    });
                });
            }
	 	}
	 
	/**
	 *	Genera e aggiunge un marker al layer delle stazioni
	 *	@param	latLonOBJ	{Object}		posizione della stazione di monitoraggio (oggetto google.maps.LatLng)
	 *	@param	idStazione	{Object}		oggetto contenente tutti gli attributi della stazione
	 */	
	 	function aggiungiMarker(latLonOBJ, idStazione){
	 		// definisce l'icona del marker (in SVG)
            var iconaStazione = 'resources/img/marker_green.png';
			// crea l'oggetto marker
			var marker = new google.maps.Marker({
				icon: iconaStazione,
				position: latLonOBJ,
				map: mapOBJ,
				zIndex: 1,
				sensori: attributiStazioni[idStazione].sensori
			});
			// aggunge un listener al marker per aprire la InfoWindow al click del mouse
			google.maps.event.addListener(marker, 'click', function() {
				if(infoStazione){
					infoStazione.close();
				} else {
					infoStazione = new google.maps.InfoWindow();
				}
			    infoStazione.setContent(infoStazioneContent(idStazione));
			    infoStazione.open(mapOBJ, marker);
				
			});
			// aggiunge il marker all'array dei markers
			markerStazioni.push(marker);
	 	}
	
	/**
	 *	Genera il contenuto della InfoWindow delle stazioni
	 *	@param	idStazione	{number}		ID della stazione
	 */	
	 	function infoStazioneContent(idStazione){
	 		var attributiStazione = attributiStazioni[idStazione];
	 		return '<div style="white-space: nowrap; min-width: 180px; height: 90px;">' +
                        '<b>'+attributiStazione.nome+'</b><br />' +
                        '<i>quota: '+attributiStazione.quota+'</i><br />' +
                        '<a href="#" onclick="visualizzaContenitoreGrafici(\''+idStazione+'\'); return false;">Visualizza Osservazioni</a><br />' +
                        '<a href="#" onclick="inizializzaMeteogramma(\''+idStazione+'\', \'24h\'); return false;">Meteogramma 24h</a><br />' +
                        '<a href="#" onclick="inizializzaMeteogramma(\''+idStazione+'\', \'7gg\'); return false;">Meteogramma 7gg</a>' +
                   '</div>';
	 	}
	 		
	 			
	/**
	 *  Inserisce sulla mappa il menu per il filtraggio delle stazioni in base al sensore
	 */
		function pannelloFiltroSensori(){
			$('div#pannello-filtroSensori').css('left', 35).css('top', 5);
		}
	
		/**
		 *	Visualizza/Nasconde le stazioni in base al tipo di sensore
		 *	@param	tipoSensore		{String}	tipo di sensore da filtrare
		 */	
		 	function filtraSensori(tipoSensore){
		 		var indicator = $("#indicatoreFiltro").css("display","inline-block");
		 		var numStazioni = markerStazioni.length;
		 		for(var s=0; s<numStazioni; s+=1){
		 			var stazione = markerStazioni[s];
		 			// VISIBILE (se selezionato e non visibile)
		 			if(stazione.sensori.match(tipoSensore) && stazione.getVisible()==false){
		 				stazione.setVisible(true);
		 			}
		 			// NASCOSTO (se non selezionato e visibile)
		 			else if(!stazione.sensori.match(tipoSensore) && stazione.getVisible()==true){
		 				stazione.setVisible(false);
		 			}
		 		}
		 		indicator.css("display","none");
		 	}
