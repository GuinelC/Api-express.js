const express = require('express');
const router = express.Router();
const db = require('../db');
const hal = require('../hal');

module.exports = router;

// GET all reservations
router.get('/', async function (req, res, next) {

    const conn = await db.mysql.createConnection(db.dsn);
  
    try {
      // Récupération des réservations
      const [rows] = await conn.execute('SELECT * FROM Reservation');
  
      const reservations = rows.map(element => {
        return {
          userId: element.User_ID,
          terrainId: element.Terrain_ID,
          dateTimeStart: element.DateTimeStart,
          duration: element.Duration
        };
      });
      
      res.render('reservation', { title: 'Liste des réservations', reservations:reservations });
  
    } catch (error) {
      console.error('Error connecting: ' + error.stack);
      res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
  
    } finally {
      // Fermer la connexion après utilisation
      conn.end();
    }
  });

  // GET details of a specific reservation
  router.get('/:id', async function (req, res, next) {
    const reservationId = req.params.id;
    const conn = await db.mysql.createConnection(db.dsn);
  
    try {
      // Récupération des détails de la réservation spécifiée par l'ID
      const [reservationRows] = await conn.execute('SELECT * FROM Reservation WHERE ID = ?', [reservationId]);
  
      // Si une réservation est trouvée, la renvoyer en format JSON
      if (reservationRows.length > 0) {
        const reservationDetails = {
          ID: reservationRows[0].ID,
          User_ID: reservationRows[0].User_ID,
          Terrain_ID: reservationRows[0].Terrain_ID,
          DateTimeStart: reservationRows[0].DateTimeStart,
          Duration: reservationRows[0].Duration
        };
  
        res.status(200).json(reservationDetails);
      } else {
        // Si aucune réservation n'est trouvée, renvoyer une réponse appropriée
        res.status(404).json({ "msg": "Reservation not found." });
      }
    } catch (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
      conn.end();
    }
  });

  // PUT update details of a specific reservation
router.put('/:id', async function (req, res, next) {
    const reservationId = req.params.id;
    const { userId, terrainId, dateTimeStart, duration } = req.body;
    const conn = await db.mysql.createConnection(db.dsn);

    try {
        // Vérification de l'existence de la réservation
        const [checkRows] = await conn.execute('SELECT * FROM Reservation WHERE ID = ?', [reservationId]);

        if (checkRows.length === 0) {
            res.status(404).json({ "msg": "Reservation not found." });
            return;
        }

        // Mise à jour des détails de la réservation
        const [updateResult] = await conn.execute('UPDATE Reservation SET User_ID = ?, Terrain_ID = ?, DateTimeStart = ?, Duration = ? WHERE ID = ?',
            [userId, terrainId, dateTimeStart, duration, reservationId]);

        // Vérification si la mise à jour a réussi
        if (updateResult.affectedRows > 0) {
            res.status(200).json({ "msg": "Reservation updated successfully." });
        } else {
            res.status(500).json({ "msg": "Failed to update reservation." });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
        conn.end();
    }
});


  // DELETE a specific reservation
router.delete('/:id', async function (req, res, next) {
    const reservationId = req.params.id;
    const conn = await db.mysql.createConnection(db.dsn);
  
    try {
      // Vérification de l'existence de la réservation
      const [checkRows] = await conn.execute('SELECT * FROM Reservation WHERE ID = ?', [reservationId]);
  
      if (checkRows.length === 0) {
        res.status(404).json({ "msg": "Reservation not found." });
        return;
      }
  
      // Suppression de la réservation
      const [deleteResult] = await conn.execute('DELETE FROM Reservation WHERE ID = ?', [reservationId]);
  
      // Vérification si la suppression a réussi
      if (deleteResult.affectedRows > 0) {
        res.status(200).json({ "msg": "Reservation deleted successfully." });
      } else {
        res.status(500).json({ "msg": "Failed to delete reservation." });
      }
    } catch (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
      conn.end();
    }
  });
  


//   EXEMPLE REQUETE CURL \\ 

    // curl -X POST -H "Content-Type: application/json" -d '{"userId": 1, "dateTimeStart": "2023-01-01T14:00:00", "duration": 45}' http://localhost:5001/terrain/2/reservation

    // curl -X PUT -H "Content-Type: application/json" -d '{
    //     "userId": 2,
    //     "terrainId": 1,
    //     "dateTimeStart": "2023-01-02 15:30:00",
    //     "duration": 45
    //   }' http://localhost:5001/reservation/2

    // curl -X DELETE http://localhost:5001/reservation/2


