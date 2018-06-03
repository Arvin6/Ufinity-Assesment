export default class UfinityError extends Error{
    constructor(message, status){
        super(message);
        if (Error.captureStackTrace){
            Error.captureStackTrace(this, UfinityError);
        }
        this.name = 'UfinityError';
        this.status = status || 400;
    }
}