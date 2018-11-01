! function () {
	var ws = new WebSocket('ws://localhost:3771');

	/*	on open  */

	ws.onopen = function () {
		console.log('connection established');
	};

	/*	on message  */

	ws.onmessage = function () {
		if (event.data !== 'init-chat') {
			var data = JSON.parse(event.data),
				$div = document.createElement('div'),
				$lastMsg = document.createElement('div');
			$lastMsg.id = 'last-msg';
			document.querySelector('#last-msg').remove();
			if (data.name == document.querySelector('#name').value) {
				console.log('user message');
				$div.classList = 'message user-message';
				} else {
					console.log('message');
					$div.className = 'message';
				}
			$div.innerHTML = `<div class="card">
					<div class="card-body">
						<div class="user">
							<img src="` + data.img + `" class="image"></div>
						<div class="post">
							<div class="name">` + data.name + ` <div class="time">
								<span class="badge badge-info">` + data.time + `</span>
							</div>
							</div>

							<div class="text">` + data.message + `</div>
							
						</div>
					</div>
				</div>`;
			document.querySelector('main').appendChild($div);
			document.querySelector('main').appendChild($lastMsg);
			document.querySelector('#last-msg').scrollIntoView();
		}
	};

	/*	on ready  */
	
	document.onreadystatechange = function () {
		if (document.readyState === "complete") {
			console.log('<f> doc ready');
			let modalInit = new Modal(document.getElementById('modalInit'));
			document.querySelector('.intro img').addEventListener('click', modalInit.show);
			var $img = document.querySelector('#avUrl'),
				$name = document.querySelector('#name'),
				$message = document.querySelector('#clientMsg');
			
			document.querySelector('#logIn').addEventListener('click', function () {
				if ($name.value !== '') {
					document.querySelector('.intro').style.display = 'none';
					document.querySelector('#modalInit .close').click();
					document.querySelector('#container').style.filter = 'none';
					document.querySelector('.fixed-bottom').style.display = 'flex';
					document.querySelector('.fixed-top').style.display = 'flex';
					} else {
						document.querySelector('#name').classList = 'form-control mr-sm-2 is-invalid';
					}
			})
			
			document.querySelector('#send').addEventListener('click', function () {
				/*if ($img.value !== '') {
					img = $img.value
				} else img = 'img/3.jpg';*/
				img = 'img/3.jpg';
				if ($message.value == '') return;
				var name = $name.value,
					message = $message.value,
					time = new Date().toLocaleTimeString();
				data = {
					name: name,
					img: img,
					message: message,
					time: time
				};
				ws.send(JSON.stringify(data));
				console.log(data);
				document.querySelector('#clientMsg').value = '';
			})
			
			document.querySelector('#clientMsg').addEventListener('keypress', function (event) {
				if (event.keyCode == 13) {
					document.querySelector('#send').click();
				}
			});
			
		}
	}

}()