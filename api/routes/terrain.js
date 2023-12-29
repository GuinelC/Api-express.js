var express = require('express');
var router = express.Router();
var db = require('../db');
var hal = require('../hal')

// GET all terrains
router.get('/', async function (req, res, next) {
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Récupération des terrains
    const [rows] = await conn.execute('SELECT * FROM Terrain');

    const terrains = rows.map(element => {
      return {
        ID: element.ID,
        Name: element.Name,
        OpeningTime: element.OpeningTime,
        ClosingTime : element.ClosingTime,
        DaysOff: element.DaysOff,
        Dispo: element.Dispo
      };
    });

    const halTerrains = terrains.map(terrain => {
      return hal.mapAllTerrainResourceObject(terrain, req.baseUrl);
  });

    res.set('Content-Type', 'application/hal+json');
    res.status(200).json(halTerrains);

  } catch (error) {
    console.error('Error connecting: ' + error.stack);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });

  } finally {
    // Fermer la connexion après utilisation
    conn.end();
  }
});


// GET TERRAIN : ID 
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


// POST - Create a new terrain
router.post('/', async function (req, res, next) {
  const { name, openingTime, closingTime, daysOff, dispo } = req.body;
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Insertion d'un nouveau terrain
    const [insertResult] = await conn.execute('INSERT INTO Terrain (Name, OpeningTime, ClosingTime, DaysOff, Dispo) VALUES (?, ?, ?, ?, ?)',
      [name, openingTime, closingTime, daysOff, dispo]);

    // Vérification si l'insertion a réussi
    if (insertResult.affectedRows > 0) {
      // Récupération de l'ID du terrain nouvellement créé
      const newTerrainId = insertResult.insertId;

      // Récupération des détails du terrain nouvellement créé
      const [newTerrainRows] = await conn.execute('SELECT * FROM Terrain WHERE ID = ?', [newTerrainId]);

      if (newTerrainRows.length > 0) {
        const newTerrainDetails = {
          ID: newTerrainRows[0].ID,
          Name: newTerrainRows[0].Name,
          OpeningTime: newTerrainRows[0].OpeningTime,
          ClosingTime: newTerrainRows[0].ClosingTime,
          DaysOff: newTerrainRows[0].DaysOff,
          Dispo: newTerrainRows[0].Dispo
        };

        const halNewTerrain = hal.mapTerrainResourceObject(newTerrainDetails, req.baseUrl);

        res.set('Content-Type', 'application/hal+json');
        res.status(201).json(halNewTerrain);
      } else {
        res.status(500).json({ "msg": "Failed to retrieve newly created terrain details." });
      }
    } else {
      res.status(500).json({ "msg": "Failed to create new terrain." });
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  } finally {
    conn.end();
  }
});
// Ex -> POST TERRAIN CURL :
// curl -X POST -H "Content-Type: application/json" -d '{
//   "name": "Z",
//   "openingTime": "08:00:00",
//   "closingTime": "18:00:00",
//   "daysOff": "Samedi",
//   "dispo": 1
// }' http://localhost:5001/terrain



// PUT - TERRAIN update details of a specific terrain
router.put('/:id', async function (req, res, next) {
  const terrainId = req.params.id;
  const { name, openingTime, closingTime, daysOff, dispo } = req.body;
  const conn = await db.mysql.createConnection(db.dsn);

  try {
      // Vérification de l'existence du terrain
      const [checkRows] = await conn.execute('SELECT * FROM Terrain WHERE ID = ?', [terrainId]);

      if (checkRows.length === 0) {
          res.status(404).json({ "msg": "Terrain not found." });
          return;
      }

      // Mise à jour des détails du terrain
      const [updateResult] = await conn.execute('UPDATE Terrain SET Name = ?, OpeningTime = ?, ClosingTime = ?, DaysOff = ?, Dispo = ? WHERE ID = ?',
          [name, openingTime, closingTime, daysOff, dispo, terrainId]);

      // Vérification si la mise à jour a réussi
      if (updateResult.affectedRows > 0) {
          res.status(200).json({ "msg": "Terrain updated successfully." });
      } else {
          res.status(500).json({ "msg": "Failed to update terrain." });
      }
  } catch (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  } finally {
      conn.end();
  }
});
// Ex : Attention ! value max "name" = 9 !! 

// curl -X PUT -H "Content-Type: application/json" -d '{
//   "name": "X",
//   "openingTime": "10:00:00",
//   "closingTime": "22:00:00",
//   "daysOff": "Dimanche",
//   "dispo": 1
// }' http://localhost:5001/terrain/4



// DELETE - TERRAIN delete a specific terrain
router.delete('/:id', async function (req, res, next) {
  const terrainId = req.params.id;
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    // Vérification de l'existence du terrain
    const [checkRows] = await conn.execute('SELECT * FROM Terrain WHERE ID = ?', [terrainId]);

    if (checkRows.length === 0) {
      res.status(404).json({ "msg": "Terrain not found." });
      return;
    }

    // Suppression du terrain
    const [deleteResult] = await conn.execute('DELETE FROM Terrain WHERE ID = ?', [terrainId]);

    // Vérification si la suppression a réussi
    if (deleteResult.affectedRows > 0) {
      res.status(200).json({ "msg": "Terrain deleted successfully." });
    } else {
      res.status(500).json({ "msg": "Failed to delete terrain." });
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  } finally {
    conn.end();
  }
});
// Ex -> DELETE TERRAIN CURL :
// curl -X DELETE http://localhost:5001/terrain/5




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

  // Exempe curl -> POST RESERVATION
    // curl -X POST -H "Content-Type: application/json" -d '{"userId": 1, "dateTimeStart": "2023-01-01T14:00:00", "duration": 45}' http://localhost:5001/terrain/2/reservation
    
module.exports = router;
