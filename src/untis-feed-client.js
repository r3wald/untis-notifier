'use strict';

const axios = require('axios');

module.exports = class UntisFeedClient {

    constructor(baseUrl) {
        this.basePath = '/feed';
        this.client = new axios.create({
            baseURL: baseUrl,
            timeout: 1000,
            headers: {'X-Custom-Header': 'foobar'}
        });
    }

    async fetchItems(since = null) {
        let url = since ? `${this.basePath}?since=${since}` : this.basePath;
        let pending;
        let results = [];
        do {
            console.log('fetching ' + url);
            const response = await this.client.get(url);
            const data = response.data;
            pending = data.pending;
            url = data._links?.next?.href;
            results.push(...data.items);
        } while (pending > 0 && !!url);
        return results;
    }
}
