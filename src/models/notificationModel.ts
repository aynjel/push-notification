export interface Notification {
    _id: string,// unique identifier of the notification
    appReceiver: string,// DOKi, RESi, PXi, etc.
    message: string,// message to be displayed
    messageType: string,// type of message
    recipientId: string,// unique identifier of the recipient
    status: number,// status of the notification
    dateTimeSend: string | null,// date and time when the notification was sent
    dateTimeRead: string | null,// date and time when the notification was read
    urlRedirect: string | null,// URL to redirect the user to
}

export interface NotificationPayload extends UserPayload {
    endpoint: string;// endpoint of the user's browser
    expirationTime: number;// expiration time of the subscription
    keys: {
        auth: string;// authentication key
        p256dh: string;// public key
    };
}

export interface UserPayload {
    app: string;// DOKi, RESi, PXi, etc.
    userId: string;// unique identifier of the user
}

export interface PublicKey {
    data: {
        publicKey: string;// public key that the server uses to encrypt data
    },
    message?: string;// message from the server
}

export interface PushSubscriptionPayload {
    endpoint: string;// endpoint of the user's browser
    expirationTime?: number;// expiration time of the subscription
    keys: {
        auth: string;// authentication key
        p256dh: string;// public key
    };
}

export interface SubscriptionPayload {
    message: string;// message from the server
    data: {
        endpoint: string;// endpoint of the user's browser
        expirationTime?: number;// expiration time of the subscription
        keys: {
            auth: string;// authentication key
            p256dh: string;// public key
        };
        timestamp: string;// timestamp of the subscription
    };
}