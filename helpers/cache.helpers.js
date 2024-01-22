const NodeCache = require( "node-cache" );
module.exports = class Cache{
    constructor(){
        if(this.constructor.instance){
            return this.constructor.instance
        }
        this.constructor.instance = this;
        
        this.cache = new NodeCache();
    }
    set(key, value, ttl=0){
        try {
            this.cache.set(key,JSON.stringify(value), ttl)
            
        } catch (error) {
            this.cache.set(key,value, ttl)
        }

    }
    get(key){

        const cacheValue = this.cache.get(key)
        try {
            return JSON.parse(cacheValue)
            
        } catch (error) {
            return cacheValue
        }
    }

    clear(key){
        this.cache.del(key)
    }

    getKeys(){
        return this.cache.keys();
    }

    clearGroup(groupName){
        let keys = this.cache.keys();

        keys.forEach(key => {
            if(key.includes(groupName)){
                this.clear(key)
            }
        });
    }
    flushAll(){
        this.cache.flushAll();
    }
}