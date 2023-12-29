const express = require('express');
const router = express.Router();
const db = require('../db');
const hal = require('../hal');

/* GET home page. */
router.get('/', async function (req, res) {
    const conn = await db.mysql.createConnection(db.dsn);
  
    try {
      // Récupération de toutes les informations sur les terrains
      const [terrainRows] = await conn.execute('SELECT * FROM Terrain');
      const terrains = terrainRows.map(element => {
        return {
          terrainId: element.ID,
          terrainName: element.Name,
          terrainDispo: element.Dispo
        };
      });
  
      res.render('adminTerrain', { terrains });
    } catch (error) {
      console.error('Error fetching terrain data:', error);
      res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
      conn.end();
    }
  });
  



// PUT update Dispo for a specific terrain
router.put('/update/:id', async function (req, res) {
    const terrainId = req.params.terrainId;
      
    const conn = await db.mysql.createConnection(db.dsn);
    console.log("fail")
    
    try {
      // Récupérez la valeur actuelle de Dispo
      console.log(`Received PUT request for terrainId: ${terrainId}`);

      const [currentDispoResult] = await conn.execute('SELECT Dispo FROM Terrain WHERE ID = ?', [terrainId]);
      const currentDispo = currentDispoResult[0].Dispo;
  
      // Basculer la valeur de Dispo
      const newDispo = currentDispo === 0 ? 1 : 0;
  
      // Mettez à jour la valeur Dispo pour le terrain spécifié
      const [updateResult] = await conn.execute('UPDATE Terrain SET Dispo = ? WHERE ID = ?', [newDispo, terrainId]);
  
      // Vérification si la mise à jour a réussi
      if (updateResult.affectedRows > 0) {
        res.json({ success: true, message: 'La disponibilité du terrain a été mise à jour.' });
      } else {
        res.status(404).json({ success: false, message: 'Terrain not found.' });
      }
    } catch (error) {
        console.error('Error updating terrain availability:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la disponibilité du terrain.', error: error.message });
    } finally {
      conn.end();
    }
  });


  
module.exports = router;