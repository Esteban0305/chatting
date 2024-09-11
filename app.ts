import { WebSocketServer } from 'ws';
import { User } from './src/model/user';
import crypto from 'crypto';
// import * as express from 'express';
console.clear();

const wss = new WebSocketServer({ port: 7071 });

const users = new Map<string, User>();

wss.on('connection', function connection(ws : any) {
  const UUID = crypto.randomUUID().toUpperCase();
  // console.log('Connected', UUID);
  ws.on('error', console.error);

  ws.on('close', () => {
    removeUser(UUID);
    users.delete(UUID);
  });

  ws.on('message', function message(data : Buffer) {
    try {
      const message = JSON.parse(data.toString());
      const action = message.action;

      switch(action) {
        case 'register':
          registerUser(UUID, message, ws);
          break;
        case 'message':
          sendMessage(message.from, message.to, message.message)
          break;
      }

      console.log(message);
    } catch (err) {
      console.log(err);
    }
  });
});

function registerUser(UUID : string, message : any, ws : WebSocket) {
  const n_user = new User(UUID, message.username || 'no_username', ws);
  users.set(UUID, n_user);

  n_user.ws.send(JSON.stringify({
    action: 'register',
    user: {
      id: UUID,
      username: n_user.name
    },
    users: getUsers(UUID)
  }));
  newUser(n_user);
}

function removeUser(UUID : string) {
  users.delete(UUID);

  users.forEach( (user) => {
    user.ws.send(JSON.stringify({
      action: 'close',
      user: UUID
    }));
  });
}

function getUsers(me : string) {
  const users_r : any[] = [];
  Array.from(users.values()).forEach( (user) => {
    if (user.id != me) {
      users_r.push({id: user.id, username: user.name});
    }
  });

  return users_r;
}

function newUser(me : User) {
  users.forEach( (user) => {
    if (me.id != user.id) {
      user.ws.send(JSON.stringify({
        action: 'new_user',
        user: {
          id: me.id,
          username: me.name
        }
      }));
    }
  });
}

function sendMessage(from : string, to : string, message : string) {
  if (!users.has(from) || !users.has(to)) {
    return false;
  }
  const from_ws = users.get(from)?.ws;
  const to_ws   = users.get(to)?.ws;

  from_ws?.send(JSON.stringify({
    action: 'message',
    from: from,
    to: to,
    message: message,
    date: new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes())
  }));

  to_ws?.send(JSON.stringify({
    action: 'message',
    from: from,
    to: to,
    message: message,
    date: new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes())
  }));
}

// const app = express();

// app.use('/', express.static('./public/'));
// app.listen(3000, () => {
//   console.log('Running');
// });