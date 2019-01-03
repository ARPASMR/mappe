	
	google.load('visualization', '1', {packages: ['corechart'], 'language': 'it'});
	var rangeTermometro = null, trendTermometro = null;
	var pathTXTTermometro = 'xml/';
	var markerTermometro;
	
	/**
	 * Visualizza un marker "Termometro" sulla mappa per la visualizzazione dell'andamento della temperatura
	 */
		function visualizzaMarkerTermometro(){
			if(typeof(markerTermometro)=="undefined"){
				markerTermometro = new google.maps.Marker({
					map: mapOBJ,
		      		position: lombardia,
		      		animation: google.maps.Animation.DROP
		     	});
		     	markerTermometro.setDraggable(true);
		     	google.maps.event.addListener(markerTermometro, "dragend", function(event) {
		     		creaGraficoTermometro();
				});
			}
		}
		
			/**
			 * Crea il grafico con l'andamento della temperatura
			 */
				function creaGraficoTermometro(posizioneMarker){
					var posizioneMarker = markerTermometro.getPosition();
					rangeTermometro = trendTermometro = null;
					// Ottiene indice di riga per estrarre i dati dai file di testo
					var indiceRiga = calcolaIndiceRiga(posizioneMarker);
					// Ottiene il range di temperature (asse delle ordinate)
					ottieniRangeTermometro(indiceRiga);
					// Ottiene il trend delle temperature (asse delle ascisse)
					if(rangeTermometro!=null){
						ottieniTrendTermometro(indiceRiga);
					}
					if(rangeTermometro!=null && trendTermometro!=null){
						
						// Crea lla struttura dati per il grafico
						var datiGrafico = new google.visualization.DataTable();
						datiGrafico.addColumn('timeofday', '');
						datiGrafico.addColumn('number', 'Temperatura');
						for(var i=0; i<24; i++){
							datiGrafico.addRow([ [i, 0, 0, 0], 
												  parseFloat(trendTermometro[i]) 
												]);
						}
						
						// Definisce le proprietà del grafico
						var proprietaGrafico = {
							title : 'Temperatura',
							titleTextStyle: { fontSize: 12 },
							width: 660,
							height: 180,
							chartArea: { width: '95%', 
										 height: '65%',
										 left: 20},
							legend: { position: 'none' },
							hAxis: { format: 'H',
									 textStyle: { fontSize: 10 }
									},
							vAxes:{ 0: { viewWindowMode: 'pretty',
										 gridlines: {count: 4},
										 textStyle: {color: '#333333', fontSize: 10},
										 viewWindow: { min: rangeTermometro[0],
													   max: rangeTermometro[1]
													  }
									} 
							},
						    series:[ { targetAxisIndex: 0, 
						    		   type: 'line',
						    		   lineWidth: 3,
						    		   color: '#FF9900'
						    		 }
						    ],
						};
						
						// Crea il grafico
						var chart = new google.visualization.ComboChart(document.getElementById('graficoTermometro'));
						chart.draw(datiGrafico, proprietaGrafico);
						return;
					}
					document.getElementById('graficoTermometro').innerHTML = '';
					return;
				}
				
				/**
				 * Calcola l'indice della riga da cui leggere i dati dai file
 				 * @param {Object} posizione
				 */
					function calcolaIndiceRiga(posizione){
						
						var pt = posizione;
						var indx = null;
						
						// ###### preso tale a quale dal vecchio codice #####
						
						// griglia fine, all'origine
						var latmin=44.5;
						var lonmin=8.4;
						var passo_lat=.001375;
						var passo_lon=.0019375;
						var n_pti=1600;
				
						// coordinate griglia dati
						var rappo = 10;
						var lonmin_dati = lonmin+(rappo-1)*passo_lon;
						var latmax_dati = latmin+(n_pti-rappo)*passo_lat;
						
						var NR = Math.round((latmax_dati - pt.lat())/(passo_lat*rappo));
						var NC = Math.round((pt.lng()-lonmin_dati)/(passo_lon*rappo));
						if (NR >= 0 && NR <= 159 && NC >= 0 && NC <= 159) {
							indx = (NR+1)*n_pti/rappo+NC; // è ancora da capire perchè va bene (NR+1) e non NR
						}
						return indx;
					}
					
				/**
				 * Ottiene il range (min/max) di temperature
 				 * @param {Object} indiceRiga
				 */	
					function ottieniRangeTermometro(indiceRiga){
						$.ajax({
							type: 'GET',
							url: pathTXTTermometro+"t2m_bound_google.txt",
							data: null,
							async: false,
							success: function(text){
								var righe = text.split(/\n/);
								if(righe[indiceRiga]!= "-99,-99"){
									rangeTermometro = righe[indiceRiga].split(",");;
								}
							}
						});
					}
				
				/**
				 * Ottiene i dati (trend) della temperatura
 				 * @param {Object} indiceRiga
				 */	
					function ottieniTrendTermometro(indiceRiga){
						$.ajax({
							type: 'GET',
							url: pathTXTTermometro+"t2m_hour_google_ll.txt",
							data: null,
							async: false,
							success: function(text){
								var righe = text.split(/\n/);
								trendTermometro = righe[indiceRiga].split(",");;
							}
						});
					}
