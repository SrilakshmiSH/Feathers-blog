
// This is the database adapter service class
const { Service } = require('feathers-nedb');
// We need this to create the MD5 hash
const crypto = require('crypto');

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60';
// Returns the Gravatar image for an email
const getGravatar = email => {
  // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  // Return the full avatar URL
  return `${gravatarUrl}/${hash}?${query}`;
};

exports.Users = class Users extends Service {
  //overriding the create method...
  create (data, params) {
    // This is the information we want from the user signup data..destructure data...
    const { firstname, lastname, email, password } = data;
    // Use the existing avatar image or return the Gravatar for the email
    const avatar = data.avatar || getGravatar(email);
    //if user already exists then return the avatar image or generate a new image..
    
    // The complete user
    const userData = {
      firstname,
      lastname,
      email,
      password,
      avatar
    };

    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }  
};


//use custom service to override create method..to add some custom logic into it...
// whenever user is created, automatically add an 'avatar' image to the user using 'gravatar' for this. 
