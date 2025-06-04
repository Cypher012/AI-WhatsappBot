import {ErrorContext} from "@better-fetch/fetch";

const ApiErrorFunc = (error: ErrorContext) => {
    const { status, statusText, message } = error.error || {};

    switch (status) {
        case 429:
            console.error("Rate limit exceeded. Please try again later.");
            break;
        case 401:
            console.error("Invalid credentials");
            break;
        case 403:
            console.error("Access denied");
            break;
        case 404:
            console.error("User not found");
            break;
        default:
            if (statusText === "BAD_REQUEST") {
                console.error(message);
            } else {
                console.error("An unexpected error occurred");
            }
    }
};

export default ApiErrorFunc;