module.exports = function (options = {}) {
  return async context => {
    const { data } = context;

    // Throw an error if we didn't get a text
    if(!data.desc || !data.btitle) {
      throw new Error('A message must have a text');
    }

    // The logged in user
    const { user } = context.params;
    // The actual message text
    // Make sure that messages are no longer than 400 characters
    const btitle = data.btitle;
    const desc = data.desc;

    // Update the original data (so that people can't submit additional stuff beyond 400 characters..)
    context.data = {
      btitle,
      desc,
      // Set the user id
      userId: user._id,
      // Add the current date
      createdAt: new Date().getTime()
    };

    return context;
  };
};

