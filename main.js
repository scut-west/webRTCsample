let socket = null;
let isInitiator = false;
let peerConnection = null;
const SERVERS = null;

$(document).ready(() => {
	socket = observeSignaling(io());
	socket.emit('join', (numberClients) => {
		isInitiator = numberClients === 2;
		console.log(isInitiator);

		peerConnection = createRTC();
		if(isInitiator) {
			initiateSignaling(socket, peerConnection);
		} else {
			prepareToReceiveOffer(socket, peerConnection);
		}
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

createRTC = function() {	//RTCPeerConnection constructor, can use third lib to create RTCPeerConnection object
	const peerConnection = coldBrewRTC(
		SERVERS,
		{ optional: [{RtcDataChannels: true }] }
	);
	return peerConnection;
}

initiateSignaling = function(socket, peerConnection) {
	peerConnection.createOffer((offer) => {
		peerConnection.setLocalDescription(offer, (success) => {
			if(success) console.log('success setLocalDescription');
		}, (err) => {
			if(err) throw err;
		});
		socket.emit('send_offer', offer);
	}, (err) => {
		if(err) throw err;
	});

	socket.on('receive_answer',(answer) => {
		console.log('receive_answer');
		peerConnection.setRemoteDescription(answer, (success) => {
			if(success) console.log('success setRemoteDescription');
		}, (err) => {
			if(err) throw err;
		});
	})
}

prepareToReceiveOffer = function(socket, peerConnection) {
	socket.on('receive_offer', (offer) => {
		console.log('receive_offer');
		peerConnection.setRemoteDescription(offer, (success) => {
			if(success) console.log('success setRemoteDescription');
		}, (err) => {
			if(err) throw err;
		});
		peerConnection.createAnswer((answer) => {
			peerConnection.setLocalDescription(answer, (success) => {
				if(success) console.log('success setLocalDescription');
			}, (err) => {
				if(err) throw err;
			});
			socket.emit('send_answer', answer);
		}, (err) => {
			if(err) throw err;
		});
	});
}