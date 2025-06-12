// src/utils/ApiResponse.js
class ApiResponse {
  constructor(statusCode, data, message = "Success", meta = null) {
    //  <-- أضفت meta
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    if (meta) {
      //  <-- أضف meta إذا كانت موجودة
      this.meta = meta;
    }
  }
}
export default ApiResponse;
