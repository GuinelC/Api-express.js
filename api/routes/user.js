var express = require('express');
var router = express.Router();
var db = require('../db');
var hal = require('../hal')

// GET all Users
router.get('/', async function (req, res, next) {
  const conn = await db.mysql.createConnection(db.dsn);

  try {
    const [rows] = await conn.execute('SELECT * FROM User');
    const users = rows.map(element => {
      return {
        ID: element.id,
        Name: element.first_name,
      };
    });

    const halUsers = users.map(user => {
      return hal.mapAllUserResourceObject(user, req.baseUrl);
  });

    res.set('Content-Type', 'application/hal+json');
    res.status(200).json(halUsers);

  } catch (error) {
    console.error('Error connecting: ' + error.stack);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });

  } finally {
    conn.end();
  }
});


// GET User : ID
router.get('/:id', async function (req, res, next) {
    const userId = req.params.id;
    const conn = await db.mysql.createConnection(db.dsn);

    try {
        // Récupération de l'utilisateur en fonction de l'ID
        const [userRows] = await conn.execute('SELECT * FROM User WHERE ID = ?', [userId]);

        if (userRows.length > 0) {
            const userDetails = {
                ID: userRows[0].id,
                Name: userRows[0].first_name,
                Pseudo : userRows[0].pseudo
            };

            const halUser = hal.mapUserIdResourceObject(userDetails, req.baseUrl);

            res.set('Content-Type', 'application/hal+json');
            res.status(200);
            res.json(halUser);
        } else {
            res.status(404).json({ "msg": "User not found." });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
        conn.end();
    }
});



// POST - Create a new user
router.post('/', async function (req, res, next) {
    const { name, pseudo, password } = req.body;
    const conn = await db.mysql.createConnection(db.dsn);

    try {
        // Insertion d'un nouvel utilisateur
        const [insertResult] = await conn.execute('INSERT INTO User (first_name, pseudo, password) VALUES (?, ?, ?)',
            [name, pseudo, password]);

        // Vérification si l'insertion a réussi
        if (insertResult.affectedRows > 0) {
            const newUserId = insertResult.insertId;

            // Récupération des détails de l'utilisateur nouvellement créé
            const [newUserRows] = await conn.execute('SELECT * FROM User WHERE id = ?', [newUserId]);

            if (newUserRows.length > 0) {
                const newUserDetails = {
                    ID: newUserRows[0].id,
                    Name: newUserRows[0].first_name,
                    Pseudo: newUserRows[0].pseudo,
                };

                res.set('Content-Type', 'application/hal+json');
                console.log("Insertion réussie");
                res.status(201).json({ message: "User created successfully" });
            } else {
                res.status(500).json({ "msg": "Failed to retrieve newly created user details." });
            }
        } else {
            res.status(500).json({ "msg": "Failed to create new user." });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
        conn.end();
    }
});
// POST USER CURL \\

// curl -X POST -H "Content-Type: application/json" -d '{
//     "name": "Nouvel4 Utilisateur",
//     "pseudo": "nouveau4_pseudo",
//     "password": "nouveau_mot_de_passe"
//   }' http://localhost:5001/user



// PUT - USER update details of a specific user
router.put('/:id', async function (req, res, next) {
    const userId = req.params.id;
    const { name, pseudo, password } = req.body;
    const conn = await db.mysql.createConnection(db.dsn);

    try {
        // Vérification de l'existence de l'utilisateur
        const [checkRows] = await conn.execute('SELECT * FROM User WHERE id = ?', [userId]);

        if (checkRows.length === 0) {
            res.status(404).json({ "msg": "User not found." });
            return;
        }

        // Mise à jour des détails de l'utilisateur
        const [updateResult] = await conn.execute('UPDATE User SET first_name = ?, pseudo = ?, password = ? WHERE id = ?',
            [name, pseudo, password, userId]);

        // Vérification si la mise à jour a réussi
        if (updateResult.affectedRows > 0) {
            res.status(200).json({ "msg": "User updated successfully." });
        } else {
            res.status(500).json({ "msg": "Failed to update user." });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
        conn.end();
    }
});
// PUT USER CURL \\
//  ** Attention ! à la valeur de l'id défini dans l'url, il s'agit du user que vous modifier 

// curl -X PUT -H "Content-Type: application/json" -d '{
//     "name": "John",
//     "pseudo": "Johny",
//     "password": "JohnyPass"
//   }' http://localhost:5001/user/1



// DELETE USER : ID
router.delete('/:id', async function (req, res, next) {
    const userId = req.params.id;
    const conn = await db.mysql.createConnection(db.dsn);
  
    try {
      // Vérification de l'existence de l'utilisateur
      const [checkRows] = await conn.execute('SELECT * FROM User WHERE id = ?', [userId]);
  
      if (checkRows.length === 0) {
        res.status(404).json({ "msg": "User not found." });
        return;
      }
  
      // Suppression de l'utilisateur
      const [deleteResult] = await conn.execute('DELETE FROM User WHERE id = ?', [userId]);
  
      // Vérification si la suppression a réussi
      if (deleteResult.affectedRows > 0) {
        res.status(200).json({ "msg": "User deleted successfully." });
      } else {
        res.status(500).json({ "msg": "Failed to delete user." });
      }
    } catch (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    } finally {
      conn.end();
    }
  });
// Ex -> DELETE USER CURL :
// curl -X DELETE http://localhost:5001/user/1
    
module.exports = router;
