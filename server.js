var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs'),
    mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
var Message;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console
        .log("we're connected!");

    // Définition du schéma de la table
    var chatSchema = mongoose.Schema({
        nickname: String,
        message: String,
        date: { type: Date, default: Date.now }
    });
    Message = mongoose.model('Message', chatSchema);
});

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/style.css',function (req,res) {
    res.sendfile(__dirname + '/style.css')
});

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);

        // On récupère tout les messages
        Message.find(function (err, messages) {
            if (err) return console.error(err);

            for (var i in messages) {
              val = messages[i];
              socket.emit('message', {pseudo: val.nickname, message: val.message});
            }
        });

        console.log(pseudo + ' a rejoint le chat!');
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});

        // Création du message à sauvegarder
        var first = new Message({
            nickname: socket.pseudo,
            message: message
        });

        // On sauvegarde le message
        first.save(function (err, first) {
            if (err) return console.error(err);
            console.log(first.message);
        });
    });
});

server.listen(8080);
