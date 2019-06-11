window.$ = window.jQuery = require('jquery');
const io = require('socket.io-client')
var socket = io.connect('http://localhost:3000')

var user = {
	name: "park",
}

var state = {
	user: user,
	rooms: null,
	activeRoom: ["lobby"],
	chattingRoom: "lobby",
}

$(document).ready(function() {
	socket.emit('roomsReloadReq')
	console.log('request')
	socket.on('roomsReloadRes', function(data) {
		console.log('roomsreloadres')
		state.rooms = data
		//data = rooms{"lobby"{}, room1{}}
		$('.contacts').empty()
		for(var key in data) {
			$('.contacts').append("<li onclick=joinRoom(\""+key+"\")>"+key+"</li>")
		}
		// for (var roomname in data) {
		// 	var d = $('#roomdummy').clone(true)
		// 	if (state.activeRoom.includes(data[roomname].name)) {
		// 		$(d).addClass("active")
		// 	}
		// 	$(d).removeAttr('id style')
		// 	$(d).children('.roomname').val(data[roomname].name)
		// 	$('.contacts').append(d.show())
		// }
	})

	$('#roomsReload').click(function() {
		socket.emit('roomsReloadReq')
	})


	$('#createRoom').click(function(e) {
		e.preventDefault();
		socket.emit('createRoomReq', $('[name=roomName]').val())
		$('[name=roomName]').val('')
		socket.emit('roomsReloadReq')
		return false;
	})

	$('#leaveRoom').click(function() {
		console.log('leave room '+state.chattingRoom)
		socket.emit('leaveRoomReq', state.chattingRoom, state.user.name)
		state.activeRoom.splice(state.activeRoom.indexOf(state.chattingRoom), 1)
		state.chattingRoom = "lobby"
		$('.msg_card_body').empty()
		socket.emit('roomsReloadReq')
	})


	$('[name=messageSend]').submit(function(e) {
		e.preventDefault();
		socket.emit('chat message', user.name, $('#m').val(), state.chattingRoom);
		
		$('#m').val('');
		return false;
	})

	socket.on('chat message', function(userName, msg) {
		// var d
		// if (userName == state.user.name) {
		// 	d = $('#senddummy').clone(true)
		// 	$(d).children('.msg_container_send').text(msg)
		// }
		// else {
		// 	d = $('#chatdummy').clone(true)
		// 	$(d).children('.msg_container').text(msg)
		// }
		// d.removeAttr('id style')
		// $('.msg_card_body').append($(d));
		$('.msg_card_body').append($('<li>').text(userName+":"+msg));
	})



	socket.on('messages response', function(messages) {
		$('.msg_card_body').empty()
		console.log(messages)
		console.log($('.card-body'))
		// for (var i = 0; i < messages.length; i++) {
		// 	var d
		// 	if (userName == state.user.name) {
		// 		d = $('#senddummy').clone(true)
		// 		$(d).children('.msg_container_send').text(msg)
		// 	}
		// 	else {
		// 		d = $('#chatdummy').clone(true)
		// 		$(d).children('.msg_container').text(msg)
		// 	}
		// 	d.removeAttr('id style')
		// }
		for (var i = 0; i < messages.length; i++) {
			$('.msg_card_body').append($('<li>').text(messages[i].message))
		}
	})
})

//id=messages in li select!

function joinRoom(roomName) {
	if (state.chattingRoom !== roomName) {
		if (!(state.activeRoom.includes(roomName))) {
			console.log('join room '+roomName)
			socket.emit('joinRoomReq', roomName, state.user.name)
			state.activeRoom.push(roomName)
		}
		console.log('checkout '+roomName)
		state.chattingRoom = roomName
		socket.emit('messages request', roomName)
		$('#chattingroomname').empty()
		$('#chattingroomname').html('<p>'+roomName+'</p>')
	}
}



