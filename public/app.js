
const socket = io();
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(feathers.authentication());

// Login screen
const loginHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Healable - Login or signup</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
      <fieldset>
        <input class="block" type="firstname" name="firstname" placeholder="firstname">
      </fieldset>
      <fieldset>
        <input class="block" type="lastname" name="lastname" placeholder="lastname">
      </fieldset>
      <fieldset>
        <input class="block" type="email" name="email" placeholder="email">
      </fieldset>
      <fieldset>
        <input class="block" type="password" name="password" placeholder="password">
      </fieldset>
      <button type="button" id="login" class="button button-primary block signup">Log in</button>
      <button type="button" id="signup" class="button button-primary block signup">Sign up and log in</button>
      </form>
    </div>
  </div>
</main>`;

// blog homepage 
const chatHTML = `<main class="flex flex-column">
<header class="title-bar flex flex-row flex-center">
  <div class="title-wrapper block center-element">
    <h1 class="font-80">Healable Blogs Section</h1>
  </div>
</header>

<div class="flex flex-row flex-1 clear">
    <header class="flex flex-row flex-center">
      <h4 class="font-300 text-center">
        <span class="font-600"></span>
      </h4>
    </header>
    <ul class="flex flex-column text-center flex-2 list-unstyled user-list"></ul>

    <div class="col-6 col-6-tablet text-center">
      <a href="#" id="logout" class="button button-primary">Logout</a>
      <form class="form">
        <button type="button" id="createBlog" class="button button-primary signup">Create new blog post</button>
      </form>
    </div>
  
</div>
</div>
</main>`;

//create blog html view
const createblogHTML = `<main class="login container">
<div class="row">
  <div class="col-12 col-6-tablet push-3-tablet text-center heading">
    <h1 class="font-100">Healable - Create a new blog post</h1>
  </div>
</div>

<div class="flex flex-row flex-1 clear">
<div class="flex flex-column col col-9">
<main class="blog flex flex-column flex-1 clear"></main>

<form class="form" onsubmit="sendMessage(event.preventDefault())">
  <fieldset>
    <input class="flex flex-8" type="title-text" id="title-text" name="title-text" placeholder ="title-text">
  <fieldset>
  <fieldset>
    <input class="flex flex-8" type="blog-text" id="blog-text" name="blog-text" placeholder ="blog-text">
  <fieldset>
  <button class="button-primary" id="shareBlog" type="submit">Share blog</button>
</form>
</div>
</div>
</main>`;

// Add a new user to the list
const addUser = user => {
  const userList = document.querySelector('.user-list');

  if(userList) {
    // Update the count of number of users
    const userCount = document.querySelectorAll('.user-list li').length;
    
    document.querySelector('.online-count').innerHTML = userCount;
  }
};

// Renders a message to the page
const addMessage = message => {
  // The user that sent this message (added by the populate-user hook)
  const { user = {} } = message;
  const chat = document.querySelector('.user-list');
  // Escape HTML to prevent XSS attacks
  // const text = escape(message.text);

  const text = message.btitle;

  const id = message._id;

  if(chat) {
    chat.innerHTML += `<div class="message flex flex-row">
      <div class="message-wrapper">
        <p class="message-header">
        <a class="viewblg message-content font-300" href='../viewblog.html?_id=${id}'>${text}</a>
        </p>
        <p class="message-content font-300">${user.email}</p>
      </div>
    </div>`;

    // allow to scroll till the bottom of our message list
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};

// Show the login page
const showLogin = (error) => {
  if(document.querySelectorAll('.login').length && error) {
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

// Shows the chat page
const showChat = async () => {
  document.getElementById('app').innerHTML = chatHTML;

  // Find the latest messages
  const messages = await client.service('messages').find({
    query: {
      $sort: { createdAt: 1 }, 
      $limit: 1000
    }
  });

  // show the newest message last
  messages.data.reverse().forEach(addMessage);

};

// fetch the user details and return the object from the login/signup page
const getCredentials = () => {
  const user = {
    firstname: document.querySelector('[name="firstname"]').value,
    lastname: document.querySelector('[name="lastname"]').value,
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value
  };
  return user;
};

// Log in either using the given email/password or the token from storage
const login = async credentials => {
  try {
    if(!credentials) {
      await client.reAuthenticate();
    } else {
      await client.authenticate({
        strategy: 'local',
        ...credentials
      });
    }

    // If login is successful, show the blogs homepage page
    showChat();
  } catch(error) {
    //display the error
    showLogin(error);
  }
};

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

// Signup click handler
addEventListener('#signup', 'click', async () => {
  // For signup, create a new user and then log them in
  const credentials = getCredentials();
    
  //  create the user
  await client.service('users').create(credentials);
  // If successful log them in
  await login(credentials);
});

// "Login" button click handler
addEventListener('#login', 'click', async () => {
  const user = getCredentials();
  await login(user);
});

// "Logout" button click handler
addEventListener('#logout', 'click', async () => {
  await client.logout();
  document.getElementById('app').innerHTML = loginHTML;
});

// 'create blog' handler
addEventListener('#createBlog', 'click', async () => {  
  document.getElementById('app').innerHTML = createblogHTML;
});

// 'share blog' event handler
addEventListener('#shareBlog', 'click', async ev => { 
 
  // This is the message text input field
  const messageInput =  document.getElementById('title-text');
  const descInput =  document.getElementById('blog-text');

  // console.log(messageInput.value);
  // console.log(descInput.value);

  // create a new message/blog using the title and description
  await client.service('messages').create({
    btitle: messageInput.value,
    desc: descInput.value
  });

});

// to listen to created blogs  and add the new blog in real-time
client.service('messages').on('created', addMessage);

// to listen to created users and add the new users in real-time
client.service('users').on('created', addUser);

login();
