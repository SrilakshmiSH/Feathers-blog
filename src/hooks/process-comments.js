
module.exports = function (options = {}) { 
  return async context => {
    const { data } = context;

    // Throw an error if we didn't get a text
    if(!data.comm) {
      throw new Error('comments cannot be empty');
    }

    // The logged in user
    const { user } = context.params;

//the actual comment for the blog...

    const comm = data.comm;
    const blogId = data.blogId; // save the blog id as well.. needed to fetch from the view blog page login..

//update the new data
    context.data = {
      comm,
      blogId,
      userId: user._id,
      createdAt: new Date().getTime()
    };

    return context;
  };
};

