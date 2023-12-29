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


// TERRAIN ALL
function mapAllTerrainResourceObject(dataTerrain, baseURL){
    console.log(dataTerrain);
    return {
        "_links": {
            "self": halLinkObject(baseURL, 'string'), 
        },
        "ID": dataTerrain.ID,
        "Name": dataTerrain.TerrainName,
        "OpeningTime": dataTerrain.OpeningTime,
        "ClosingTime": dataTerrain.ClosingTime,
        "DaysOff": dataTerrain.DaysOff,
        "Dispo": dataTerrain.Dispo
    };
}


/**
 * Mappe les données d'un terrain en un objet conforme à la spécification HAL
 * @param {object} terrainData 
 * @param {string} baseURL 
 * @returns {object}
*/


// TERRAIN : ID
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
    };
}

// RESERVATION : ALL
function mapAllReservationResourceObject(data, baseURL) {
    console.log(data);
    return {
        "_links": {
            "self": halLinkObject(baseURL, 'string'), 
        },
        "ID": data.ID,
        "User" : data.User_ID,
        "Terrain" : data.Terrain_ID,
        "DateTimeStart": data.DateTimeStart,
        "Duration": data.Duration,
    };
}

// RESERVATION : ID
function mapReservationResourceObject(data, baseURL) {
    console.log(data);
    return {
        "_links": {
            "self": halLinkObject(baseURL + '/' + data.ID, 'string'),
            "terrain": halLinkObject(baseURL + '/' + 'terrain' + '/' + data.Terrain_ID, 'string'),
            // Ajoutez d'autres liens pertinents au besoin
        },
        "ID": data.ID,
        "User" : data.User_ID,
        "Terrain" : data.Terrain_ID,
        "DateTimeStart": data.DateTimeStart,
        "Duration": data.Duration,
        // Ajoutez d'autres propriétés de réservation au besoin
    };
}


// USER : ALL
function mapAllUserResourceObject(dataUser, baseURL) {
    console.log(dataUser);
    return {
        "_links": {
            "self": { "href": baseURL + '/' + dataUser.ID },
        },
        "ID": dataUser.ID,
        "Name": dataUser.Name,
        // Ajoutez d'autres propriétés utilisateur au besoin
    };
}

// USER : ID
function mapUserIdResourceObject(dataUser, baseURL) {
    console.log(dataUser);
    return {
        "_links": {
            "self": { "href": baseURL + '/' + dataUser.ID },
        },
        "ID": dataUser.ID,
        "Name": dataUser.Name,
        "Pseudo" : dataUser.Pseudo
    };
}


module.exports = { halLinkObject, mapTerrainResourceObject, mapReservationResourceObject, mapAllReservationResourceObject, mapAllTerrainResourceObject, mapAllUserResourceObject, mapUserIdResourceObject };
