let API_URL = "/api";

const apiRequest = async (method, path, body = null) => {
    let opts = {
        method: method,
        headers: {"Content-Type": "application/json"},
        body: (body !== null) ? JSON.stringify(body) : body
    };
    let res = await fetch(API_URL + path, opts);
    return res;
};

export default apiRequest;
