# Starter pack: *RESTful* web API avec Node.js, Express.js, MySQL et Adminer

Un *starter pack* dockerisé d'une application web node.js pour développer une web API RESTful. L'API vient avec un service de base de données relationnelles (MySQL) et un client graphique (Adminer).

- [Starter pack: *RESTful* web API avec Node.js, Express.js, MySQL et Adminer](#starter-pack-restful-web-api-avec-nodejs-expressjs-mysql-et-adminer)

  - [Prérequis](#prérequis)
  - [Lancer le projet avec Compose](#lancer-le-projet-avec-compose)
  - [Tester](#tester)
    - [API](#api)
    - [Base de données](#base-de-données)
    - [Client graphique Adminer pour la base de données MySQL](#client-graphique-adminer-pour-la-base-de-données-mysql)
  - [Base de données](#base-de-données-1)
    - [ORM](#orm)
  - [Debuger lors du développement](#debuger-lors-du-développement)
    - [En ligne de commande avec docker](#en-ligne-de-commande-avec-docker)
  - [Documentation de l'API avec Swagger](#documentation-de-lapi-avec-swagger)
  - [Installer et servir de nouvelles dépendances](#installer-et-servir-de-nouvelles-dépendances)
  - [Arrêter le projet](#arrêter-le-projet)
  - [Conseils pour le développement](#conseils-pour-le-développement)
  - [Modules Node.Js notables](#modules-nodejs-notables)
  - [Ressources](#ressources)
    - [Docker](#docker)
    - [Express](#express)
    - [Swagger](#swagger)
    - [SGBDR](#sgbdr)
    - [Adminer](#adminer)
  -  [Api express TENNIS] (#)
  - [Requêttes CURL](CONCEPTION)
  - [Améliorations](#améliorations)


## Prérequis

- installer [node.js](https://nodejs.org/en)
- installer [Docker](https://www.docker.com/get-started/) et [Compose](https://docs.docker.com/compose/)
- clôner le dépôt et se placer à la racine du projet


## Lancer le projet avec Compose

Dupliquer le fichier `.env.dist`
Pour obtenir `.env`

~~~
cp .env.dist .env
~~~

> Vous pouvez modifier les variables d'environnement si vous le souhaitez (des valeurs par défaut sont fournies)

Installer les dépendances de l'application node et générer la doc swagger

~~~
pushd api
npm install
npm run swagger-autogen
popd
~~~

Démarrer le projet

~~~
docker-compose up -d
~~~

## Tester

### API

Se rendre à l'URL [localhost:5001](http://localhost:5001)
ou tester (avec [curl](https://curl.se/))

~~~
# Web humain (HTML)
curl --include localhost:5001
# API (JSON)
curl localhost:5001
~~~

### Base de données

Avec le client mysql (depuis la machine hôte) :

~~~bash
mysql -uroot -proot -Dmydb -h127.0.0.1 -P5002
~~~

Puis, dans le repl MySQL (session ouverte avec la commande précédente)

~~~SQL
-- Lister les utilisateurs MySQL
SELECT user FROM mysql.user;
-- Lister les users dans la base de départ
SELECT * FROM User;
~~~

Pour exécuter un script SQL en *Batch mode*

~~~bash
mysql -uroot -p -Dmydb -h127.0.0.1 -P5002 < script.sql
~~~

>Penser à modifier la valeur du port si vous l'avez changé dans le `.env`

>*Machine hôte* : la machine sur laquelle s’exécute les conteneurs Docker, *votre* machine

### Client graphique Adminer pour la base de données MySQL

Le starterpack vient avec [Adminer](https://www.adminer.org/), un gestionnaire de base de données à interface graphique, simple et puissant.

Se rendre sur l'URL [http://localhost:5003](http://localhost:5003) (par défaut) et se connecter avec les credentials *root* (login *root* et mot de passe *root* par défaut), ou ceux de l'utilisateur (`user` et `password` par défaut)

## Base de données

La base de données vient avec deux utilisateurs par défaut :

- `root` (administrateur), mot de passe : `root`
- `user` (utilisateur lambda), mot de passe : `password`

Pour accéder à la base de données :

- *Depuis* un autre conteneur (Node.js, Adminer) : `host` est `db`, le nom du service sur le réseau Docker
- *Depuis* la machine hôte (une application node, PHP exécutée sur votre machine, etc.) : `host` est `localhost` ou `127.0.0.1`. **Préférer utiliser l'adresse IP `127.0.0.1` plutôt que son alias `localhost`** pour faire référence à votre machine (interface réseau qui) afin éviter des potentiels conflits de configuration avec le fichier [socket](https://www.jetbrains.com/help/datagrip/how-to-connect-to-mysql-with-unix-sockets.html) (interface de connexion sous forme de fichier sur les systèmes UNIX) du serveur MySQL installé sur votre machine hôte (si c'est le cas).

### ORM

Pour interagir avec la base de données SQL, nous pouvons utiliser l'ORM [Sequelize](https://sequelize.org)

## Debuger lors du développement

Inspecter les *logs* du conteneur Docker qui contiennent tout ce qui est écrit sur la sortie standard (avec `console.log()`). Les sources de l'application Node.js sont *watchées*, donc à chaque modification d'un fichier source l'application redémarre pour les prendre en compte automatiquement

### En ligne de commande avec docker

~~~bash
#Suivi en temps réel des logs
docker logs -f demo-rest-api-api 
~~~


## Documentation de l'API avec Swagger

Générer automatiquement la documentation de vos routes avec le module Swagger

Placez-vous dans le dossier `api` puis

~~~
node swagger.js
~~~

ou

~~~
npm run swagger-autogen
~~~

Se rendre à l'URL `/doc` pour accéder à l'UI de Swagger

## Installer et servir de nouvelles dépendances

A la racine de l'application, installer les dépendances désirées *via* `npm`

~~~
pushd api
npm install <votre paquet>
popd
~~~

## Arrêter le projet

~~~
docker-compose down
~~~

## Améliorations

Il restes des choses à faire...

## Conseils pour le développement

- Ouvrez une connexion MySQL pendant votre développement pour tester vos requêtes *avant* de les intégrer dans voter code
- Utiliser cURL pour tester rapidement vos requêtes HTTP. Ouvrez par exemple deux terminaux, l'un avec cURL et l'autre avec les logs de l'API pour débuger facilement votre système
- Installer le module `dotenv` pour placer le DSN (informations de connexion à la base) en dehors du code
- Pour tester des enchaînements de requêtes, écrivez un script SQL capable de remettre la base dans un état initial et contenant les requêtes à tester et un autre script pour effectuer les requêtes HTTP, et exécuter le tout en *une commande*

## Modules Node.Js notables

- [bodyParser](https://www.npmjs.com/package/body-parser), un parser du corps de requête pour les applications node. On s'en sert pour parser les représentations envoyées par le client dans nos contrôleurs avec l'instruction `app.use(bodyParser.urlencoded({ extended: true }));`
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), une implémentation javascript du standard JSON Web Token, voir [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)
- [cors](https://www.npmjs.com/package/cors), un module middleware pour gérer la politique CORS (*Cross Origin Resource Sharing*)
- [mysql2](https://www.npmjs.com/package/mysql2), un client MySQL pour Node.js qui [utilise l'API des promesses](https://www.npmjs.com/package/mysql2#using-promise-wrapper) (contrairement à son prédécesseur [mysql](https://www.npmjs.com/package/mysql))



## Ressources

### Docker

- [Image Docker Node](https://hub.docker.com/_/node)
- [Image Docker MySQL](https://hub.docker.com/_/mysql)
- [Image Docker Adminer](https://hub.docker.com/_/adminer/)
- [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)

### Express

- [Générateur d’applications Express](https://expressjs.com/fr/starter/generator.html), générer un projet pour démarrer
- [Routage](https://expressjs.com/fr/guide/routing.html), la documentation sur le routage d'Express
- [Pug](https://pugjs.org/api/getting-started.html), moteur de templates javascript installé par défaut avec Express
- [API JSON Web Token Authentication (JWT) sur Express.js](https://etienner.github.io/api-json-web-token-authentication-jwt-sur-express-js/), un bon tutoriel pour mettre en place des routes protégées par Json Web Token

### Swagger

- [Swagger UI](https://github.com/swagger-api/swagger-ui), documenter une web API RESTful (même si elle devrait être *par définition* auto-documentée et *auto-descriptive*)
- [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express), module node.js pour générer la documentation de l'API avec Express
- [Swagger auto-gen](https://www.npmjs.com/package/swagger-autogen), module de génération *automatique* de la documentation de l'API dans une application node.js/Express. Voir notamment la documentation pour documenter automatiquement les endpoints (résumé, description, paramètres)
- [Swagger auto-gen: décrire des paramètres de formulaire POST](https://www.npmjs.com/package/swagger-autogen#parameters)
- [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification), un standard de description d'une web API comptabile avec REST

### SGBDR

- [MySQL Docker Image, quick reference](https://hub.docker.com/_/mysql/)
- [mysql2](https://www.npmjs.com/package/mysql2), le driver node.js pour le SGBDR MySQL qui implémente l'API des promesses (contrairement à [mysql](https://www.npmjs.com/package/mysql))
- [Sequelize, Getting Started](https://sequelize.org/docs/v6/getting-started/), Sequelize, un ORM pour Node.js



### Adminer
Pour la base de donnée:
- [Adminer](https://www.adminer.org/)

# Api-express.j : TENNIS

* Test des requêttes en CURL -> 
Nous devont faire nos test avec des requêtes CURL. 

### User : Voici différentes requêtte curl, pour effectuer des actions sur des USERS ->

## CURL - POST USER \\ EX-1
** Dans cet exemple, il suffit de définir de nouvelles données et de les exécuter pour obtenir un post en bdd

curl -X POST -H "Content-Type: application/json" -d '{
     "name": "Nouvel4 Utilisateur",
     "pseudo": "nouveau4_pseudo",
     "password": "nouveau_mot_de_passe"
   }' http://localhost:5001/user


## CURL - PUT USER \\ EX-2
Attention ! à la valeur de l'id défini dans l'url, il s'agit du user que vous modifier 

curl -X PUT -H "Content-Type: application/json" -d '{
    "name": "John",
    "pseudo": "Johny",
    "password": "JohnyPass"
  }' http://localhost:5001/user/1


## CURL - DELETE USER \\ EX-3
Attention ! à la valeur de l'id défini dans l'url, il s'agit du user qui sera supprimer

 curl -X DELETE http://localhost:5001/user/1   



### Terrain : Voici différentes requêtte curl, pour effectuer des actions sur des terrains ->
##CURL - POST TERRAINS \\ EX-1
Dans cet exemple, il suffit de définir de nouvelles données et de les exécuter pour obtenir un post en bdd

 curl -X POST -H "Content-Type: application/json" -d '{
   "name": "Y",
   "openingTime": "10:00:00",
   "closingTime": "22:00:00",
   "daysOff": "Dimanche",
   "dispo": 1
 }' http://localhost:5001/terrain


## CURL - PUT TERRAINS \\ EX-2
Ex : Attention ! value max "name" = 9 !!, la valeur défini dans l'id de l'url correspond au put : id que vous modifier

 curl -X PUT -H "Content-Type: application/json" -d '{
   "name": "X",
   "openingTime": "10:00:00",
   "closingTime": "22:00:00",
   "daysOff": "Dimanche",
   "dispo": 1
 }' http://localhost:5001/terrain/4



## CURL - DELETE TERRAIN \\ EX-3
Attention ! à la valeur de l'id défini dans l'url, il s'agit du terrain qui sera supprimer

curl -X DELETE http://localhost:5001/terrain/5 



## Reservation : Voici différentes requêtte curl, pour effectuer des actions sur des RESERVATIONS ->
Pour effectuer un POST pour une réservation, il vous faut respecter des critères:
- vérifier d'avoir les données nécessaires en bdd, [user, terrain] avant de faire une requête
- Impératif de réserver un crénaux horaire sur les heures d'ouverture de 10h - 22H.
- Vous devez absolument choisir un autre jour que le Dimanche, qui est le jour de fermeture.
- Pour empêcher deux réservations simultanées sur le même terrain, une vérification est effectuée pour s'assurer que l'heure de début de la nouvelle réservation n'entre pas en conflit avec l'heure de fin de la dernière réservation sur ce terrain. Si la nouvelle réservation commence avant la fin de la dernière réservation, elle est refusée pour assurer une allocation non simultanée du terrain.

Si cela n'est pas respecté ! aucune reservation de sera valider.

## CURL - POST RESERVATION \\ EX-1
Vous devez choisir un userId, une date de début, et la durée de 45min
Attention ! à la valeur de l'id définie dans l'url, il s'agit de l'id du terrain qui s'apprête à recevoir la réservation.

curl -X POST -H "Content-Type: application/json" -d '{"userId": 3, "dateTimeStart": "2023-01-02T17:00:00", "duration": 45}' http://localhost:5001/terrain/4/reservation


## CURL - PUT RESERVATION \\
Attention ! à la valeur de l'id définie dans l'url, il s'agit de l'id de la reservation qui s'apprête à recevoir la modification.
   curl -X PUT -H "Content-Type: application/json" -d '{
       "userId": 2,
       "terrainId": 1,
       "dateTimeStart": "2023-01-02 15:30:00",
       "duration": 45
  }' http://localhost:5001/reservation/2


## CURL -  DELETE RESERVATION \\ 
Attention ! à la valeur de l'id définie dans l'url, il s'agit de l'id de la reservation qui s'apprête à être supprimer.

curl -X DELETE http://localhost:5001/reservation/2



### Consommer les différentes ressources
La liste des users: http://localhost:5001/user
un user ciblée avec id : http://localhost:5001/user/1

La liste des terrains: http://localhost:5001/terrain
un terrain ciblée avec id : http://localhost:5001/terrain/2

La liste des Reservations: http://localhost:5001/reservation
une Reservation ciblée avec id : http://localhost:5001/reservation/3


### Gestion des rôles
L'administrateur est autorisé à effectuer des actions qui ne sont pas accessibles à un user standard.

### Login
Vérification des champs renseignés et validation ou non de la connexion, Pour l'administrateur, les identifiants sont dans l'énoncé du projet.


### Améliorations
Gestion de l'authentification reste à terminer
Seule un utilisateur authentifié peux réserver un terrain
Gestion de l'admin pour l'indisponibilité d'un terrain, les jours de pluie.
