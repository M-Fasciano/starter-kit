const searchInput = $('#search_input');
const search = $('#search');

/*
 * Check to see if there is any text entered
 * If there is no text within the input ten disable the button
 * If there is text in the input, then enable the button
 */
export const disableSearch = () => {
  searchInput.keyup((e) => {
    const target = e.target.value;
    return target === '' ? search.prop('disabled', true) : search.prop('disabled', false);
  });
};

/*
 * Calculate distance between coordinates
 */
const degreesToRadians = (degrees) => {
  return degrees * Math.PI / 180;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const latA = degreesToRadians(lat1);
  const latB = degreesToRadians(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLon / 2)
    * Math.sin(dLon / 2)
    * Math.cos(latA)
    * Math.cos(latB);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};
