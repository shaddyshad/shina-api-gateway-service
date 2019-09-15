function Logger(){
    this.logInfo = function(message){
        console.log(message);
    }
    this.logError = function(message){
        console.log(message);
    }
    this.logWarning = function(message){
        console.log(message);
    }
}

module.exports = new Logger();