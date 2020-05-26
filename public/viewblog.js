
const socket = io();
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(feathers.authentication());

// fetch the blog id from the url
var url = window.location.href;
var idx = url.indexOf("?");
var blogid = idx != -1 ? url.substring(idx+5) : "";

// display the earlier comments for that blog
const addComments = c => {
  
  //fetch the current user logged in
    const { user = {} } = c;
   
    const chat1 = document.querySelector('.comms-list');

    if(chat1) {
        chat1.innerHTML += `<p class="message-content font-300">${c.comm}</p>`;
    }
};

const showBlogs = async () => {

    //fetch the blog title(message) based on the blog id using get method
    const messages = await client.service('messages').get(blogid);

    // console.log(messages.btitle);
    document.getElementById("mytext2").textContent = messages.btitle;

    // console.log(messages.desc);
    document.getElementById("mytext3").textContent = messages.desc;

    //show the existing comments for that blog id by using find method and querying based on the blog  id
    const comms = await client.service('comments').find({
        query: {
            blogId: blogid,
            $sort: { createdAt: -1 },
           $limit: 1000
        }
      });

     // add the comments to display  
    comms.data.forEach(addComments);
};

//login to the blog
const showLogin = (error) => {
    if(document.querySelectorAll('.login').length && error) {
      document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
    } else {
      document.getElementById('app').innerHTML = loginHTML;
    }
};

//helper for login function
const getCredentials = () => {
    const user = {
      firstname: document.querySelector('[name="firstname"]').value,
      lastname: document.querySelector('[name="lastname"]').value,
      email: document.querySelector('[name="email"]').value,
      password: document.querySelector('[name="password"]').value
    };
    return user;
};

//login fn to fetch the jwt of the current user logged in or create a new one
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
      //after successful login, open all blogs to add comments
      showBlogs();
    } catch(error) {
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

//add event listener to listen to click of 'add comments' button
addEventListener('#addcomment', 'click', async ev => { 
 
    const messageInput =  document.getElementById('comment-text');
  
    // console.log(messageInput.value);
    
    // create a new comment using create service
    //add the blog id as foriegn key
    await client.service('comments').create({
      comm: messageInput.value,
      blogId: blogid 
    });
  
    // reset the text field for comments
    document.getElementById('comment-text').value=''; 

});
    
//to load the comments from other users in real-time
client.service('comments').on('created', addComments);

login();
