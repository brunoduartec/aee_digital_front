const NodeCache = require( "node-cache" );
module.exports = class Cache{
    constructor(){
        if(this.constructor.instance){
            return this.constructor.instance
        }
        this.constructor.instance = this;
        
        this.cache = new NodeCache();
    }
    set(key, value){

        this.cache.set(key,value)
    }
    get(key){
        return this.cache.get(key)
    }

    clear(key){
        this.cache.del(key)
    }

    clearGroup(groupName){
        let keys = this.cache.keys();

        keys.forEach(key => {
            if(key.includes(groupName)){
                this.clear(key)
            }
        });
    }
}