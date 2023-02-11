const axios = require('axios');

class BFFService {
    async getRegionalData(params) {
        try {
            const response = await axios.get(`http://localhost:3000/regional`, {
                params
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getCentroData(params) {
        try {
            const response = await axios.get(`http://localhost:3000/regional`, {
                params
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = BFFService;