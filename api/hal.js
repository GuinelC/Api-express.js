/**
 * Export des fonctions helpers pour la spécification HAL
 * Voir la spécification HAL : https://stateless.group/hal_specification.html
 * Voir la spécification HAL (RFC, source) : https://datatracker.ietf.org/doc/html/draft-kelly-json-hal
 */

/**
 * Retourne un Link Object, conforme à la spécification HAL
 * @param {*} url 
 * @param {*} type 
 * @param {*} name 
 * @param {*} templated 
 * @param {*} deprecation 
 * @returns 
 */
function halLinkObject(url, type = '', name = '', templated = false, deprecation = false) {

    return {
        "href": url,
        "templated": templated,
        ...(type && { "type": type }),
        ...(name && { "name": name }),
        ...(deprecation && { "deprecation": deprecation })
    }
}


function mapTerrainResourceObject(terrainData, baseURL) {
    return {
        "_links": {
            "self": halLinkObject(baseURL + '/' + terrainData.ID, 'string')
        },
        "ID": terrainData.ID,
        "name": terrainData.Name,
        "Ouverture": terrainData.OpeningTime,
        "Fermeture": terrainData.ClosingTime,
        "Jour De Fermeture": terrainData.DaysOff,
        // Ajoutez d'autres propriétés de terrain au besoin
    };
}


function mapReservationResourceObject(data, baseURL) {
    console.log(data);
    return {
        "_links": {
            "self": halLinkObject(`${baseURL}/terrain/${data.Terrain_ID}/reservations/${data.ID}`, 'string'),
            "terrain": halLinkObject(`${baseURL}/terrain/${data.Terrain_ID}`, 'string'),
            // Ajoutez d'autres liens pertinents au besoin
        },
        "ID": data.ID,
        "DateTimeStart": data.DateTimeStart,
        "DateTimeEnd": data.DateTimeEnd,
        "Duration": data.Duration,
        // Ajoutez d'autres propriétés de réservation au besoin
    };
}


module.exports = { halLinkObject, mapTerrainResourceObject, mapReservationResourceObject };
