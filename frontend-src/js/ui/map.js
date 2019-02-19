import stations from '../data/data';
import { calculateDistance } from '../helpers/helpers';

const googleMap = () => {
  /*
   * Global variables
   */
  const d = document;
  const mapEl = d.getElementById('map');
  const search = d.getElementById('search');
  const markers = [];
  let bounds;
  let map;
  let myLat = d.getElementById('latitude').value;
  let myLng = d.getElementById('longitude').value;

  /*
   * Set markers
   */
  const icons = {
    refuellingStation: {
      icon: '/images/refueling.png',
    },
    refuellingStationComingSoon: {
      icon: '/images/refueling_coming_soon.png',
    },
    servicingDealer: {
      icon: '/images/service_dealer.png',
    },
  };

  /*
   * Delete markers
   */
  const removeMarkers = () => {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    // Reset auto-zoom and auto-center
    bounds = new google.maps.LatLngBounds();
  };

  /*
   * Initialises the map
   */
  window.initMap = () => {
    // The location of Uk
    const uk = { lat: 54.829156, lng: -2.751222 };

    // An InfoWindow displays content (usually text or images) in a popup window
    const infowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // The map, centered at Uk
    map = new google.maps.Map(mapEl, {
      zoom: 6,
      center: uk,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    /*
     * Auto zoom and auto center map
     */
    const autoZoomCenter = (marker) => {
      const loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
      bounds.extend(loc);

      // auto-zoom
      map.fitBounds(bounds);
      // auto-center
      map.panToBounds(bounds);
    };

    /*
     * Create markers
     */
    stations.forEach((station) => {
      const marker = new google.maps.Marker({
        name: station.name,
        position: new google.maps.LatLng(station.lat, station.lng),
        icon: icons[station.type].icon,
        map,
      });
      markers.push(marker);

      // Add info name on mouseover
      google.maps.event.addListener(marker, 'mouseover', (() => {
        return () => {
          infowindow.setContent(station.name);
          infowindow.open(map, marker);
        };
      })(marker));

      // Remove info name on mouseout
      google.maps.event.addListener(marker, 'mouseout', (() => {
        return () => {
          infowindow.close();
        };
      })(infowindow));
    });

    search.addEventListener('click', () => {
      const inputSearchValue = d.getElementById('search_input').value;

      removeMarkers();

      /*
       * Find my current location using a postcode
       * http://api.postcodes.io/
       */
      fetch(`http://api.postcodes.io/postcodes/${inputSearchValue}`)
        .then(response => response.json())
        .then((myJson) => {
          const { latitude, longitude } = myJson.result;
          myLat = latitude;
          myLng = longitude;
          let count = 0;

          stations.forEach((station) => {
            const lat = parseFloat(station.lat);
            const lng = parseFloat(station.lng);

            const showDistance = () => {
              const distance = calculateDistance(myLat, myLng, lat, lng);
              const distanceMile = (distance * 0.62137119224).toFixed(2);

              if (distanceMile < 33) {
                count += 1;
                const marker = new google.maps.Marker({
                  name: station.name,
                  position: new google.maps.LatLng(station.lat, station.lng),
                  icon: icons[station.type].icon,
                  map,
                });
                markers.push(marker);

                autoZoomCenter(marker);

                // Add info name on mouseover
                google.maps.event.addListener(marker, 'mouseover', (() => {
                  return () => {
                    infowindow.setContent(station.name);
                    infowindow.open(map, marker);
                  };
                })(marker));

                // Remove info name on mouseout
                google.maps.event.addListener(marker, 'mouseout', (() => {
                  return () => {
                    infowindow.close();
                  };
                })(infowindow));
              }
            };

            showDistance(myLat, myLng, lat, lng);
          });

          if (count < 1) {
            alert('There are no refuelling stations or servicing dealers near you.');
          }

          /*
           * Add my current location
           */
          const myLocation = () => {
            const marker = new google.maps.Marker({
              map,
              animation: google.maps.Animation.DROP,
              position: { lat: myLat, lng: myLng },
            });
            autoZoomCenter(marker);
          };
          myLocation();
        });
    });
  };
};

export default googleMap;
