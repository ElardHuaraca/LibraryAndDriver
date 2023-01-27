class Library {
    constructor(name, ip, cot) {
        this.name = name
        this.ip = ip
        this.cot = cot
    }
}

Library.prototype.getName = function () { return this.name }

Library.prototype.getIp = function () { return this.ip }

Library.prototype.getCot = function () { return this.cot }

export default Library