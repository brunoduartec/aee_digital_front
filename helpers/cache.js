const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];
const redisConf = config.redis
const EventEmitter = require('events')

const logger = require("./logger");

const redis = require("redis")

module.exports = class Cache extends EventEmitter {
    constructor(){
        super()
        if(this.constructor.instance)
        return this.constructor.instance
        
        this.constructor.instance = this;
        // this.client = redis.createClient({ url: `redis://${redisConf.host}:${redisConf.port}` });
        this.cache = {}
        
    }

    async connect(){
        try {
            // await this.client.connect();
            this.emit('connected')
            // logger.info("Redis is connected")
            
        } catch (error) {
            logger.error(`Error Connecting to Redis: ${error}`)
            await setTimeout(connect, 5000);
        }
    }

    async get(key){
        try {
            // const value = await this.client.get(key);
            const value = this.cache[key] 
            // return value ?JSON.parse(value) : null;
            return value;
            
        } catch (error) {
            throw new Error(error)
        }
    }

    async set(key,value, expire = 24*60*60){
       try {
        //    await this.client.set(key,JSON.stringify(value), {
        //        EX: expire,
        //        NX: true
        //      });
           this.cache[key] = value
        
        } catch (error) {
            throw new Error(error)
        }
    }

    async keys(keyPattern){
        try {
            // const keys = await this.client.keys(keyPattern)

            const keys = Object.keys(this.cache) 
            const matches = keys.filter((k)=>{
                return k.includes(keyPattern)
            })
            return matches
            
        } catch (error) {
            throw new Error(error)
        }
    }

    async remove(pattern){
        try {

            
            let keys = await this.keys(pattern)
    
            for (const key of keys) {
                this.cache[key] = null;
                // this.client.expire(key,0);
            }
            // this.cache[k]
            
        } catch (error) {
            throw new Error(error)
        }
    }

}