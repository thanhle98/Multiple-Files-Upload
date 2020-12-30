// Generates unique ID for every new connection
exports.getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

exports.typesDef = {
  USER_JOIN: "user_join",
  USER_LEAVE: "user_leave",
  ADD_FILE: "add_file",
  UPLOAD_DONE: "upload_done",
};

exports.sendMessage = (json) => {
    // We are sending the current data to all connected clients
    Object.keys(global.clients).map((client) => {
      global.clients[client].sendUTF(json);
    });
  };