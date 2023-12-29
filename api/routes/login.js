const express = require("express");
const router = express.Router();
const db = require("../db");


// Page d'authentification
router.get("/", async function (req, res, next) {
    console.log('errror');
  const halRepresentation = {
    _links: {
      self: { href: "/login" },
      previous: {
        href: "/register",
        title: "register",
        description: "créer un compte",
      },
      profile: { href: "/profile/user" },
      create: {
        href: "/login",
        method: "POST",
        title: "Se connecter",
        templated: false,
        description: "Permet de se connecter à son compte",
      },
    },
    message: "Bonjour, veuillez créer votre compte pour pouvoir réserver !",
  };

  res.render("login", {
    _links: halRepresentation._links,
    message: halRepresentation.message,
  });
  console.log('fin get');
});

router.post("/", async function (req, res, next) {
    const conn = await db.mysql.createConnection(db.dsn);
   
    const { pseudo, password } = req.body; // Utilisez pseudo au lieu de username
   
    console.log("req.body:", req.body);
    console.log("pseudo:", pseudo);
   
    if (!pseudo) {
      res.render("login", { error: "Veuillez fournir un pseudo" });
      return;
    }
   
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM User WHERE pseudo = ? AND password = ?`,
        [pseudo, password]
      );
      console.log("Rows:", rows);
        
      if (rows.length > 0) {
            if (rows[0].role === 1) {
            // Si le rôle est égal à 1, rediriger vers reservation.pug
            return res.redirect("/adminTerrain");
            }
        }

      if (rows.length > 0) {
        // res.redirect("/courts");
        // Redirige l'utilisateur vers la page d'accueil après la connexion
        res.render("login", {
          message: `vous êtes connecté ${pseudo}`,
        });
        console.log('fin post');
      } else {
        res.render("login", { error: "Pseudo ou mot de passe incorrect" });
      }
    } catch (error) {
      console.error("Erreur de connexion : " + error.stack);
      res.status(500).json({
        msg: "Nous rencontrons des difficultés, merci de réessayer plus tard.",
      });
    } finally {
      conn.end();
    }
});


//   router.get('/', (req, res) => {
//     if (req.session.pseudo) {
//       res.send(`Bienvenue sur votre profil, ${req.session.pseudo}!`);
//     } else {
//       res.redirect('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
//     }
//   });
  
  module.exports = router;
  