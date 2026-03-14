const users = [];

class User {
  constructor(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
  }

  static findByUsername(username) {
    return users.find(u => u.username === username);
  }

  static create(user) {
    users.push(user);
    return user;
  }
}

module.exports = User;
