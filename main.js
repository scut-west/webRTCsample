let socket = null;
let isInitiator = false;

$(document).ready(() => {
	socket = observeSignaling(io());
	socket.emit('join', (numberClients) => {
		isInitiator = numberClients === 2;
		console.log(isInitiator)
	});

	$(window).on('unload', () => {
		socket.emit('leave');
	});

	$('form').on('submit', (e) => {
		e.preventDefault();
	});

	$('#sendMessage').on('click', function () {
		const message = $(this).siblings()[0].value;
		handleIncomingMessage(message);
		$(this).siblings()[0].value = '';
	});
});

handleIncomingMessage = function(message) {
	const messageElement = $('<p></p>', { class: 'message'});
	messageElement.text(message);
	$('#chat-window').append(messageElement);
}