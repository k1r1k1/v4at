var chosenImg = '';

function checkImg(tiss) {
	document.querySelectorAll('.modal-body img').forEach(function (item) {
		if (tiss == item) {
			chosenImg = tiss.src;
			item.style = 'box-shadow: 0 0 0 .15rem rgba(0, 251, 0, .5); transition: .3s;'
		} else {
			item.style = 'hover: box-shadow: none;'
		}
	})
}

/*  on ready  */

document.onreadystatechange = function () {
	if (document.readyState === "complete") {
		console.log('<f> doc ready');
		let modalInit = new Modal(document.getElementById('modalInit'));
		document.querySelector('.enter-img').addEventListener('click', modalInit.show); // login button
		var $img = document.querySelector('#avUrl'),
			$name = document.querySelector('#name'),
			$message = document.querySelector('#clientMsg');

		/*  login  */

		document.querySelector('#logIn').addEventListener('click', function () {
			if ($name.value !== '') {

				var ws = new WebSocket('ws://localhost:4815');

				/*	on open  */

				ws.onopen = function () {
					console.log('WS connection established!', 'try to log in...');
					var loginData = {
						type: 'auth',
						name: $name.value,
						img: chosenImg
					};
					ws.send(JSON.stringify(loginData));
					console.log('loginData send...', JSON.stringify(loginData));
				}

				/*	on error  */

				ws.onerror = function (event) {
					console.log('Ошибка', event);
					alert('Сервер ' + event.target.url + ' не отвечает');
				}

				/*	on close  */

				ws.onclose = function (event) {
					console.log('Соединение прервано', event);
					alert('Соединение ' + event.target.url + ' прервано');
				}

				/*  on message  */

				ws.onmessage = function () {
					console.log('<incmgMSG> type:', JSON.parse(event.data).type);
					if (JSON.parse(event.data).type == 'message') {
						var data = JSON.parse(event.data),
							$div = document.createElement('div'),
							$lastMsg = document.createElement('div');
						$lastMsg.id = 'last-msg';
						document.querySelector('#last-msg').remove();
						if (data.name == document.querySelector('#name').value) {
							$div.classList = 'message user-message';
						} else {
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
					} else if (JSON.parse(event.data).type == 'auth') {
						if (JSON.parse(event.data).id == 'error') {
							document.getElementById('modalErr').querySelector('.modal-body').innerHTML = '<h4>Ошибка авторизации!</h4><label>Возможно пользователь с таким именем уже существует. Попробуйте войти с другим именем</label>';
							let modalErr = new Modal(document.getElementById('modalErr'));
							modalInit.hide();
							modalErr.show();
						} else {
							console.log('success auth!');
							document.querySelector('.intro').style.display = 'none';
							document.querySelector('#modalInit .close').click();
							document.querySelector('#container').style.filter = 'none';
							document.querySelector('.fixed-bottom').style.display = 'flex';
							document.querySelector('.fixed-top').style.display = 'flex';
						}
					}
				}
			} else {
				document.querySelector('#name').classList = 'form-control mr-sm-2 is-invalid';
			}
			document.querySelector('#send').addEventListener('click', function () {
				if (chosenImg == '') chosenImg = 'img/0.jpg';
				if ($message.value == '') return;
				data = {
					type: 'message',
					name: $name.value,
					img: chosenImg,
					message: $message.value,
					time: new Date().toLocaleTimeString()
				};
				$message.value = '';
				ws.send(JSON.stringify(data));
			})
			document.querySelector('#clientMsg').addEventListener('keypress', function (event) {
				if (event.keyCode == 13) {
					document.querySelector('#send').click();
				}
			})
		})
	}
}
