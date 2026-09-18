export class ApiResponse {
    statusCode;
    success;
    message;
    data;
    constructor(statusCode, data = null, message = 'Success') {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }
}
//# sourceMappingURL=ApiResponse.js.map