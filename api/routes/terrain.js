var express = require('express');
var router = express.Router();
var db = require('../db');
var hal = require('../hal')

// GET all terrains
router.get('/', async function (req, res, next) {
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Récupération des terrains
    const [terrainRows] = await conn.execute('SELECT * FROM Terrain');
    const terrains = terrainRows.map(element => {
      return {
        ID: element.ID,
        Name: element.Name
      };
    });

    res.render('terrain', { title: 'RESTful web api - Terrains', terrains: terrains });

  } catch (error) {
    console.error('Error executing SQL query: ' + error.stack);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  } finally {
    // Fermer la connexion après utilisation
    conn.end();
  }
});


router.get('/:id', async function (req, res, next) {
  const terrainId = req.params.id;
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Récupération du terrain en fonction de l'ID
    const [terrainRows] = await conn.execute('SELECT * FROM Terrain WHERE ID = ?', [terrainId]);

    if (terrainRows.length > 0) {
      const terrainDetails = {
        ID: terrainRows[0].ID,
        Name: terrainRows[0].Name,
        OpeningTime: terrainRows[0].OpeningTime,
        ClosingTime: terrainRows[0].ClosingTime,
        DaysOff: terrainRows[0].DaysOff,
      };

      const halTerrain = hal.mapTerrainResourceObject(terrainDetails, req.baseUrl);

      res.set('Content-Type', 'application/hal+json');
      res.status(200);
      res.json(halTerrain);
    } else {
      res.status(404).json({ "msg": "Terrain not found." });
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  } finally {
    conn.end();
  }
});



// POST a new reservation for a specific terrain
router.post('/:id/reservation', async function (req, res, next) {
  const terrainId = req.params.id;
  const { userId, dateTimeStart, duration } = req.body;

  // Utilisation d'une seule connexion pour éviter les fuites de connexion
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Vérification de la disponibilité du terrain aux horaires demandés
    const [terrainRows] = await conn.execute('SELECT * FROM Terrain WHERE ID = ?', [terrainId]);
  
    if (terrainRows.length === 0) {
      return res.status(404).json({ "msg": "Terrain not found." });
    }
  
    const parseTime = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(':');
      return new Date(1970, 0, 1, hours || 0, minutes || 0, seconds || 0);
    };
    
    const terrain = terrainRows[0];
    const openingTime = parseTime(terrain.OpeningTime);
    const closingTime = parseTime(terrain.ClosingTime);
    const reservationDateTime = new Date(dateTimeStart);
    const reservationWeekDayUnit = new Date(dateTimeStart).getDay();
    const DayOffUnit = 0; // Dimanche
    
    console.log('Opening Time:', openingTime);
    console.log('Closing Time:', closingTime);
    console.log('Reservation Time:', reservationDateTime);
  
   // Vérification de la disponibilité du terrain aux horaires demandés
    if (reservationDateTime.getHours() < openingTime.getHours() || reservationDateTime.getHours() >= closingTime.getHours() || reservationWeekDayUnit == DayOffUnit) {
      console.log('Terrain is closed at the requested time.');
      return res.status(400).json({ "msg": "Terrain is closed at the requested time." });
    }

    // Ajoutez la logique pour enregistrer la réservation dans la base de données
    const [result] = await conn.execute('INSERT INTO Reservation (User_ID, Terrain_ID, DateTimeStart, Duration) VALUES (?, ?, ?, ?)',
      [userId, terrainId, dateTimeStart, duration]);
  
    // Vérifiez si l'insertion a réussi
    if (result.affectedRows > 0) {
      console.log('Reservation created successfully.');
      return res.status(201).json({ "msg": "Reservation created successfully." });
    } else {
      console.log('Failed to create reservation.');
      return res.status(500).json({ "msg": "Failed to create reservation." });
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    console.log('An error occurred while processing the request.');
    return res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  } finally {
    conn.end();
  }
});



module.exports = router;


// // POST /terrains (exemple)
// router.post('/', async function (req, res, next) {
//   res.status(201).json({ "msg": "Terrain created successfully." });
// });

// // PUT /terrains/:id (exemple)
// router.put('/:id', async function (req, res, next) {
//   const terrainId = req.params.id;
//   res.status(200).json({ "msg": "Terrain updated successfully." });
// });

// // DELETE /terrains/:id (exemple)
// router.delete('/:id', async function (req, res, next) {
//   const terrainId = req.params.id;
//   res.status(200).json({ "msg": "Terrain deleted successfully." });
// });

// module.exports = router;
