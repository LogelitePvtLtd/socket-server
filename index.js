const http = require("http");
const express = require("express");
const cors = require("cors");
const path = require("path");
const socketIO = require("socket.io");
const { Console } = require("console");
const app = express();
const users = {}; // Store connected users
const hosts = {}; // Store connected hosts
require('events').EventEmitter.defaultMaxListeners = 0  
app.use(cors())
// Set up the views using the `ejs` template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files (if needed)
app.use(express.static(__dirname + '/public'));

// Route to render the view
app.get('/', (req, res) => {
  res.render('index');
});

const allMessages = [];
const server = http.createServer(app)
const port = 4500
const io = socketIO(server, {
    cors: {
      origin: '*',
    }
})
io.on('connection',(socket)=>{
    socket.on('joined',(user)=>{
          users[user.name] = socket.id
          hosts[user.name] = user.host
          io.to(users[user.name]).emit('welcome',{user:'Admin',from:users['Admin'],message:`Welcome to the chat, ${user.name} `})
          io.to(users['Admin']).emit('active-users',users)
         
          io.to(users['Admin']).emit('updateList','binod test ')
          
          
    })
    socket.on('typing start',(data)=>{
      io.to(users['Admin']).emit('typing start',data)
    });
    socket.on('hostName',()=>{
      io.to(users['Admin']).emit('host',hosts)
    });

    socket.on('typing stopped',(data)=>{
      io.to(users['Admin']).emit('typing stopped',data)
    });

    socket.on('bot typing start',(data)=>{
      io.to(users[data.name]).emit('bot typing start')
    });

    socket.on('bot typing stopped',(data)=>{
      console.log(data)
      console.log(data.name)
      io.to(users[data.name]).emit('bot typing stopped')
    });

    socket.on('message',(data)=>{
      console.log(users)
      io.to(users[data.user]).emit('sendMessage',{user:data.user,from:'Admin',message:`${data.message} `, to:data.to})
      io.to(users[data.to]).emit('sendMessage',{user:data.user,from:'Admin',message:`${data.message} `, to:data.to})
      io.to(users['Admin']).emit('sendMessageAdmin',{user:data.user,from:data.user,message:`${data.message}`,to:data.to,userId:data.senderId})
      io.to(users[data.user]).emit('sendMessageAdmin',{user:data.user,from:data.user,message:`${data.message}`,to:data.to,userId:data.senderId})
    })
 
    socket.on('disconnect',()=>{
          socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
    })
})

server.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`)
})

