# Créer une application web avec API et base de donnée

application Web à l'aide de la console Web AWS accessible directement depuis votre navigateur.

## Prérequis

1. Disposer d'un compte AWS
2. Disposer d'un code source hébergée sur Github

## Création d'une application Web

Déployer des ressources statiques pour votre application Web en utilisant la **console AWS Amplify**.
_5 minutes_

Se connecter à la [console AWS Amplify](https://us-west-2.console.aws.amazon.com/amplify/home?region=us-west-2&code=fb38754793d5688403e5#/create) et sélectionner son hébergeur de code source. _(ex: Github)_.

Sélectionner le bon repository et la branche `master` ou `main` etcliquer sur `Suivant`.

Vérifier que vos paramêtres de build aient bien été détectés puis télécharger le fichier amplify.yml et intégrer le à la racine du projet.

Vous pouvez également ajouter des variables d'environement dans les settings avancés de cette section.

Pousser le commit sur votre gestionnaire de code source et cliquer sur Suivant.

Vérifiez la configuration et cliquer sur `Enregistrer et déployer`. Patienter quelque minutes et aller vérifier l'URL de l'application.

## Création d'une fonction sans serveur

Créer une fonction sans serveur à l'aide d'**AWS Lambda**.
_5 minutes_

Se connecter à la console [AWS Lambda](https://eu-west-3.console.aws.amazon.com/lambda/home?region=eu-west-3#/functions) et cliquer sur `Créer une fonction`.

Donner un nom à la fonction que vous souhaitez créer _(ex: HelloWorldFunction)_.

Sélectionner le langage à utiliser entre NodeJs, Python et Ruby. _(ici Node.js 14)_ et cliquer sur le bouton `Créer une fonction`.

Une fois la fonction est créée, un éditeur en ligne va s'ouvrir. On y place le code de sa fonction.

Pour l'exemple, remplacer le code d'index.js par celui ci-dessous.

```js
// Define handler function, the entry point to our code for the Lambda service
// We receive the object that triggers the function as a parameter

exports.handler = async (event) => {
    // Extract values from event and format as strings
    let name = JSON.stringify(`Hello from Lambda, ${event.firstName} ${event.lastName}`);

    // Create a JSON object with our response and store it in a constant
    const response = {
        statusCode: 200,
        body: name
    };
    
    return response;
};
```

Enregistrer puis cliquer sur Test. Donner un nom à l'évènement puis remplacer le json par défault par celui-ci:

```json
{
"firstName": "Ada",
"lastName": "Lovelace"
}
```

Cliquer su `Créer` puis une fois créée cliquer sur `Deploy` et `Tester`.

> Rq: Veillez à noter le nom de la région dans laquelle vous créez votre fonction. Cette information est indiquée dans la partie supérieure de la page, en regard du nom de votre compte.

## Association de la fonction sans serveur à l'application Web

Déployer votre fonction sans serveur à l'aide d'**API Gateway**.
_5 minutes_

Se connecter et créer une nouvelle API sur la [console d'API Gateway](https://console.aws.amazon.com/apigateway/main/apis?region=us-east-1).

Sélectionner `Créer une API REST` et sélectionner le protocole `REST` puis `Créer une nouvelle API`, donner lui un nom _(ex: HelloWorldAPI)_, sélectionner `Optimisé pour la périphérie` et cliquer sur `Créer une API`.

### Créer une ressource et une méthode

Ressource > / > POST > Fonction Lambda > région de la fonction > nom de la fonction > Enregistrer.

Dans le menu Action sur POST nouvellement créé, sélectionner `Activer les CORS` et `Activer`.

### Déployer l'API

Dans le menu Action cliquer sur `Déployer l'API`. puis choisir `Nouvelle étape` et inscrire `dev` comme nom d'environnement et cliquer sur déployer.

Copier et enregistrer l'URL fournie.

### Validation de l'API

Dans la partie gauche, cliquer sur Ressources.

Les méthodes disponibles pour l'API s'affichent sur la droite. Cliquer sur POST.

Cliquer sur l'icône d'éclair bleu.

Coller les éléments suivants dans le champ Corps de la requête :

```json
{
    "firstName":"Grace",
    "lastName":"Hopper"
}
```

Cliquer sur le bouton Tester, de couleur bleue.

Sur la droite, une réponse comportant la mention Code 200 doit s'afficher.

Félicitations ! Vous avez créé et testé une API permettant d'appeler une fonction Lambda.

## Création d'une table de données

Conserver des données dans une table **Amazon DynamoDB**.
_10 minutes_

Se connecter à la [console Amazon DynamoDB](https://eu-west-3.console.aws.amazon.com/dynamodb/home?region=eu-west-3#gettingStarted:) et cliquer sur `Créer une table`, nommer la _(ex: HelloWorldDatabase)_, dans le champ Clé primaire, saisisser `ID` et cliquer sur `Créer`.

Copier l'Amazon Resource Name (ARN) de la table depuis la partie droite (vous en aurez besoin ultérieurement).

### Création et ajout d'une politique IAM à la fonction Lambda

Dans la console d'**AWS Lambda**, sélectionner la fonction _HelloWorldFunction_ créée précédement puis dans l'onglet configuration, sélectionner Autorisations. Cliquer sur le rôle approprié dans la section Rôle d'exécution. Un nouvel onglet va s'ouvrir.

Cliquer sur Ajouter une stratégie en ligne, à droite de Politiques d'autorisation, sélectionner l'onglet JSON et copier les éléments suivants dans la zone de texte, en prenant garde à remplacer l'ARN de votre table dans le champ Ressource.

```json
{
"Version": "2012-10-17",
"Statement": [
    {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": [
            "dynamodb:PutItem",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:UpdateItem"
        ],
        "Resource": "YOUR-TABLE-ARN"
    }
    ]
}
```

Cette autorisation permet à votre fonction Lambda de lire, modifier ou supprimer des éléments, mais uniquement dans la table que vous avez créée.

Cliquez sur le bouton Vérifier la politique, de couleur bleue.

Nommer la politique _(ex: HelloWorldDynamoPolicy)_ et cliquer sur `Créer la stratégie`.

### Modification de la fonction afin de pouvoir écrire dans une table

Remplacer le code de notre fonction Lambda par celui ci-dessous, déployer et tester

```js
const AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();
let date = new Date();
let now = date.toISOString();

exports.handler = async (event) => {
    let body = JSON.stringify(`Hello from Lambda, ${event.firstName} ${event.lastName}`);
    let name = event.firstName + ' ' + event.lastName

    // Create JSON object with parameters for DynamoDB and store in a variable
    let params = {
        TableName:'HelloWorldDatabase',
        Item: {
            'ID': name,
            'LatestGreetingTime': now
        }
    }
    // Using await, make sure object writes to DynamoDB table before continuing execution
    await dynamodb.put(params).promise();

    const response = {
        statusCode: 200,
        body: body
    };

    return response;
};
```

Si vous retournez sur votre table dans la console DynamoDB, les noms utilisés seront inscrits en tant qu'ID.

## Ajout de fonctionnalités d'interactivité à l'application Web

Modifier votre application Web afin d'invoquer votre API.
_5 minutes_

[lien](https://aws.amazon.com/fr/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/module-five/)

---

[Lien documentation officielle](https://aws.amazon.com/fr/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/?e=gs2020&p=fullstack)
