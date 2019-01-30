let socket = null;
let isInitiator = false;
let dataChannel = null;
let peerConnection = null;
const SERVERS = null;

$(document).ready(() => {
	socket = observeSignaling(io());
	socket.emit('join', (numberClients) => {
		isInitiator = numberClients === 2;
		console.log(isInitiator);

		peerConnection = createRTC(socket);
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

		const data = JSON.stringify({ type:'message', message});
		dataChannel.send(data);
	});
});

handleIncomingMessage = function(message) {
	const messageElement = $('<p></p>', { class: 'message'});
	messageElement.text(message);
	$('#chat-window').append(messageElement);
}

createRTC = function(socket) {	//RTCPeerConnection constructor, can use third lib to create RTCPeerConnection object
	const peerConnection = coldBrewRTC(
		SERVERS,
		{ optional: [{RtcDataChannels: true }] }
	);

	peerConnection.onicecandidate = (e) => {
		if(e.candidate) {
			socket.emit('send_ice_candidate', e.candidate);
		}
	}

	socket.on('receive_ice_candidate', (candidate) => {
		peerConnection.addIceCandidate(candidate);
	});

	return peerConnection;
}

initiateSignaling = function(socket, peerConnection) {
	initiateDataChannel(peerConnection);

	peerConnection.createOffer((offer) => {
		peerConnection.setLocalDescription(offer);
		socket.emit('send_offer', offer);
	}, (err) => {
		if(err) throw err;
	});

	socket.on('receive_answer',(answer) => {
		console.log('receive_answer');
		peerConnection.setRemoteDescription(answer);
	});
}

prepareToReceiveOffer = function(socket, peerConnection) {
	peerConnection.ondatachannel = (e) => {
		dataChannel = e.channel;

		dataChannel.onmessage = (message) => {
			const data = JSON.parse(message.data);
			handleIncomingMessage(data.message);	
		}
	}
	socket.on('receive_offer', (offer) => {
		console.log('receive_offer');
		peerConnection.setRemoteDescription(offer);
		peerConnection.createAnswer((answer) => {
			peerConnection.setLocalDescription(answer);
			socket.emit('send_answer', answer);
		}, (err) => {
			if(err) throw err;
		});
	});
}

initiateDataChannel = function(peerConnection) {
	dataChannel = peerConnection.createDataChannel('messageChannel', { reliable: false});

	dataChannel.onopen = () => {
		dataChannel.onmessage = (message) => {
			const data = JSON.parse(message.data);
			handleIncomingMessage(data.message);	
		}
	}
}