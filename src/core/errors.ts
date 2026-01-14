export class SessionExpiredError extends Error {
    constructor() {
        super("Session expired or unauthenticated")
    }
}

export class NavigationError extends Error {
    constructor(message: string) {
        super(message)
    }
}