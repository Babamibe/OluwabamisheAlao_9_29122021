import axios from "axios";

export default class OldBills{
    static async all() {
        const resp = await axios.get('http://localhost:5678');
        return resp.data;
    }
}