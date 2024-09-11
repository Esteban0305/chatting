const ws      = new WebSocket('ws://localhost:7071');
// let session   = document.cookie.split('=')[1];
const user = {
  id: '',
  username: ''
};

const users       = new Map();
let current_chat  = '';
const messages    = new Map();

ws.onopen = () => {
  // if (session.trim() == '') {
  //   ws.send(JSON.stringify({action: 'register'}));
  // }

  // document.getElementById('loader').classList.toggle('d-none');
  // document.getElementById('register').classList.toggle('d-none');
}

ws.onmessage = (buffer) => {
  try {
    message = JSON.parse(buffer.data);
    console.log(message);
    switch(message.action) {
      case 'register':
        user.id       = message.user.id;
        user.username = message.user.username;

        message.users.forEach( (user) => {
          addUser(user);
        });

        // document.cookie = 'session=' + user.id;
        document.getElementById('register').classList.add('d-none');
        document.getElementById('clone').classList.remove('d-none');
        break;
      case 'new_user':
        addUser(message.user);
        break;
      case 'message':
        renderMessage(message.from, message.to, message.message, message.date);
        break;
      case 'close':
        removeUser(message.user);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

function register() {
  const username = document.getElementById('username').value.trim();
  
  if(username != '') {
    ws.send(JSON.stringify({
      'action': 'register',
      'username': username
    }));
  }
}

function addUser(user) {
  users.set(user.id, user);
  messages.set(user.id, []);
  const user_html = `<li class="list-group-item d-flex" onclick="selectUser('${user.id}')" id="#user_chat_id_${user.id}"><span>${user.username}</span><span class="ms-auto badge bg-danger d-none">0</span></li>`;
  document.getElementById('chat_list').innerHTML += user_html;
}

function removeUser(user) {
  document.getElementById('#user_chat_id_' + user).remove();

  users.delete(user);
  messages.delete(user);
}

function selectUser(user_id) {
  if (!users.has(user_id)) {
    return 0;
  }

  document.getElementById('no_chat').classList.add('d-none');
  document.getElementById('chat').classList.remove('d-none');

  const user = users.get(user_id);
  const messages_by_user = messages.get(user_id);
  current_chat = user_id;

  document.getElementById('current_username_chat').innerText = user.username;
  
  document.getElementById('chat_messages').innerHTML = '';
  document.getElementById('#user_chat_id_' + user_id).children[1].innerText = '0';
  document.getElementById('#user_chat_id_' + user_id).children[1].classList.add('d-none');
  messages_by_user.forEach( (message) => {
    renderMessage(message.from, message.to, message.message, message.date, false);
    console.log(message);
  });
}

function sendMessage() {
  const message = document.getElementById('message').value.trim();
  document.getElementById('message').value = '';

  if (message != '') {
    ws.send(JSON.stringify({
      action: 'message',
      from: user.id,
      to: current_chat,
      message: message
    }));
  }
}

function renderMessage(from, to, message, date, original = true) {
  const msg = {
    from: from,
    to: to,
    message: message,
    date: date
  }

  if (original) {
    if (from == user.id) {
      const msgs = messages.get(to);
      msgs.push(msg);
      messages.set(to, msgs);
    } else {
      const msgs = messages.get(from);
      msgs.push(msg);
      messages.set(from, msgs);
    }
  }

  let message_html = ''
  if (current_chat == from || current_chat == to) {
    if (from == user.id) {
      message_html = 
        '<div class="rounded-2 py-2 px-3 d-flex flex-column my-1 bg-primary ms-auto" style="width: fit-content;max-width: 75%;">' +
          '<p class="w-100 my-auto text-white text-end">' + message + '</p><small class="text-white text-end" style="font-size: 10pt;">' + date + '</small>' +
        '</div>';
    } else {
      message_html = 
        '<div class="border rounded-2 py-2 px-3 d-flex flex-column my-1" style="width: fit-content;max-width: 75%;">' +
          '<p class="w-100 my-auto">' + message + '</p><small class="text-muted" style="font-size: 10pt;">' + date + '</small>' +
        '</div>';
    }
  } else {
    let msg_count = parseInt(document.getElementById('#user_chat_id_' + from).children[1].innerText);
    msg_count++;
    document.getElementById('#user_chat_id_' + from).children[1].innerText = msg_count;
    document.getElementById('#user_chat_id_' + from).children[1].classList.remove('d-none');
  }

  const mss = document.getElementById('chat_messages').innerHTML
  document.getElementById('chat_messages').innerHTML = message_html + mss;
}

// EVENTS

document.getElementById('message').addEventListener('keyup', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
      sendMessage();
  }
});