import axios from 'axios';

class AddBill {
  static async post() {
    const resp = await axios.post('http://localhost:5678');
    return resp.data;
  }
}
export default AddBill;