
//request data from server, automatically populate the user data..
//call - after the data is ready from the database..

module.exports = function (options = {}) {
  return async context => {

    const { app, method, result, params } = context;
    // Function that adds the user to a single message object
    // take a message, query the user service for all for the user of the given messages...

    const addUser = async message => {
      // Get the user based on their id, pass the `params` along so
      // that we get a safe version of the user data
      const user = await app.service('users').get(message.userId, params);

//pass the id for the given user - from message.userid...

      // Merge the message content to include the `user` object
      return {
        ...message, // all the prop of message incl 'user'
        user
      };
    };
//attached user property to message..

    // In a find method we need to process the entire page
    if (method === 'find') {
      // Map all data to include the `user` information
      context.result.data = await Promise.all(result.data.map(addUser));
    } 
    
    //get message...
    else {
      // Otherwise just update the single result
      context.result = await addUser(result);
    }

//result-outgoing data

    return context;
  };
};

