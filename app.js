var redis = require("redis"),
client = redis.createClient(6379, 'redis');

var server = require('http').createServer();
var io = require('socket.io')(server);

// Socket.io configuration
io.on('connection', function(socket){
  socket.on('subscribeToOrg', function (data) {
      socket.join(data.organization);
      client.subscribe(data.organization);
      client.subscribe(data.organization + '-pending');
      client.subscribe(data.organization + '-scheduled');
  });

  // Add unsubscribe later
});
server.listen(3000);

// Redis PubSub configuration
client.on('message', function(channel, message) {
  if (channel.indexOf('-') !== -1) {
    var splitChannel = channel.split('-');
    io.to(splitChannel[0]).emit(splitChannel[1], message);
  } else {
    if (message === 'new') {
      io.to(channel).emit(message);
    } else {
      io.to(channel).emit('update', {id: message});
    }
  }
});
