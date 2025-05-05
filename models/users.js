const users = [];

class User {
    constructor(id, fname, sname, password) {
        this.id = id;
        this.fname = fname;
        this.sname = sname;
        this.password = password;
        //this.role = role;
    }
}

module.exports = { User, users };
