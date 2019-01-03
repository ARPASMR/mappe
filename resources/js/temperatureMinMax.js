

	var pathImmaginiTemperature = 'tminmax/';

	var layerTemperature = null;

	/**
	 *	Aggiunge alla mappa il layer delle temperature
	 */
		function visualizzaLayerTemperatureMinMax(){
			// Riposiziona mappa per fare spazio a le PNG degli overlays
			mapOBJ.setCenter( new google.maps.LatLng(45.7, 10.1));
			// Aggiunge il layer delle temperature e la mappa delle fasce orarie
			switchMassimeMinime();
		}
			
			/**
			 *	Mostra il layer delle temperature massime o minime 
			 */
				function switchMassimeMinime(){
					var nomeFile;
					var selezione = $("select#selettoreTemperature").val();
					// switch della mappa delle fasce orarie
					nomeFile = (selezione=='max') ? 'hmassime.png' : 'hminime.png';
					$('div#pannello-mappaFasceOrarie')
							.html('<img src="'+pathImmaginiTemperature+nomeFile+'" />');
					// Rimuove layer se già esiste
					if(layerTemperature!=null){
						layerTemperature.setMap(null);
					}
					// Aggiunge il layer
					nomeFile = (selezione=='max') ? 'massime.png' : 'minime.png';
					layerTemperature = new google.maps.GroundOverlay(pathImmaginiTemperature+nomeFile, 
																		 new google.maps.LatLngBounds(
																		      new google.maps.LatLng(44.5, 8.4),
																		      new google.maps.LatLng(46.7, 11.5)
																		      ));
					layerTemperature.setMap(mapOBJ);
					// Regola l'opacità del layer delle temperature
					modificaOpacitaTemperature();
				}
		
			/**
			 *	Modifica l'opacità del layer delle temperature in base alla selezione
			 */
				function modificaOpacitaTemperature(){
					var opacita = $("select#selettoreOpacita").val();
					layerTemperature.setOpacity(parseFloat(opacita));
				}
	
	/**
	 *  Inserisce sulla mappa i seguenti pannelli:
	 *    - selettore temperature  (SOLO posizionamento)
	 * 	  - scala delle temperatura
	 *    - legenda delle fasce orarie
	 *    - la mappa delle fasce orarie
	 */
		function pannelliTemperatureMinMax(){
			// Posiziona il pannello del selettore temperature 
			$('div#pannello-temperatureMinMax').css('left', 35).css('top', 5);
			// Aggiunge la scala delle temperatura
			$('div#contenitoreMappa').append('<div id="pannello-scalaTemperature" class="pannelloDiControllo"></div>');
			$('div#pannello-scalaTemperature')
					.css('left', parseInt($('#mappaGoogle').css('width'))-35)
					.css('top', 55)
					.html('<img src="'+pathImmaginiTemperature+'scalatempv.png" />');
			// Aggiunge la legenda delle fasce orarie
			$('div#contenitoreMappa').append('<div id="pannello-fasceOrarie" class="pannelloDiControllo"></div>');
			$('div#pannello-fasceOrarie')
					.css('left', parseInt($('#mappaGoogle').css('width'))-185)
					.css('top', 55)
					.html('<img src="'+pathImmaginiTemperature+'scalaorenew.png" />');
			// Aggiunge la mappa delle fasce orarie
			$('div#contenitoreMappa').append('<div id="pannello-mappaFasceOrarie" class="pannelloDiControllo"></div>');
			$('div#pannello-mappaFasceOrarie')
					.css('left', parseInt($('#mappaGoogle').css('width'))-185)
					.css('top', 85)
					.html('');
		}	
		
			
