var WebSocketServer = require('ws').Server,
	fs = require('fs'),
	usersOfTable1 = {},
	i,
	wss = new WebSocketServer({
		port: 4815
	});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	})
}

/*  on connection  */

wss.on('connection', function (ws) {
	ws.on('message', function incoming(message) {
		if (JSON.parse(message).type == 'auth') {
			var id = Math.random(), // ID generating
				trig = false; // search trigger
			usersOfTable1[id] = ws; // temp save new client as obj
			console.log('<newConnection> id:' + id);
			authData = { // preparing logIn obj
				type: 'auth',
				img: JSON.parse(message).img,
				name: toHtml(JSON.parse(message).name.toLowerCase()),
				id: id,
				//client: usersOfTable1[id], //user WS.obj
				time: new Date().toLocaleTimeString()
			};
			Object.keys(usersOfTable1).forEach(function (item) {
				if (authData.name == usersOfTable1[item].name) {
					console.log('<error> user "' + usersOfTable1[item].name + '" already connected');
					trig = true;
					return;
				}
			})
			if (!trig) {
				console.log(authData);
				usersOfTable1[id].send(JSON.stringify(authData)); // send logIn response to user
				usersOfTable1[id] = authData; // replace wsObj to responseObj
				showOnlineUsers() // debug logs start
				ws.on('close', function () { // on close ws connection
					console.log('<connection lost> ' + id);
					delete usersOfTable1[id];
					showOnlineUsers(); // debug logs start
				});
			} else {
				authData = { // preparing logIn obj
					type: 'auth',
					id: 'error'
				};
				usersOfTable1[id].send(JSON.stringify(authData)); // send logIn response to user
				usersOfTable1[id].close();
				delete usersOfTable1[id];
			}
		} else if (JSON.parse(message).type == 'message') {
			message = JSON.parse(message);
			message.message = toHtml(message.message);
			console.log('<newMsg>', message);
			wss.clients.forEach(function each(client) {
				client.send(JSON.stringify(message));
			})
		}
	})
})

function showOnlineUsers() { /*  logs  */
	console.log('');
	console.log('--------------users-table---------------');
	fs.appendFileSync('log.txt', '\r\n---------[' + new Date().toLocaleTimeString() + ']users-table---------', 'ascii');
	let i = 0;
	Object.keys(usersOfTable1).forEach(function (item) {
		i++;
		console.log('#' + i + ' | name: "' + usersOfTable1[item].name + '" | id: ' + usersOfTable1[item].id);
		fs.appendFileSync('log.txt', '\r\n#' + i + ' | name: "' + usersOfTable1[item].name + '" | id: ' + usersOfTable1[item].id, 'ascii');
	});
	console.log('----------------------------------------');
	fs.appendFileSync('log.txt', '\r\n----------------------------------------', 'ascii');
	console.log('');
}

function toHtml(string) {
	let entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	}
	return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	});
}
