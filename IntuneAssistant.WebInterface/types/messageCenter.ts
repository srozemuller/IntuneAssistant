export type MessageType = 0 | 1 | 2 | 3;

export interface MessageCenterItem {
    id: string;
    title: string;
    description: string;
    messageType: MessageType;
    messageTypeName: 'Information' | 'Warning' | 'Maintenance' | 'Feature';
    expirationDate: string | null;
    createdAt: string;
}

export interface MessageCenterResponse {
    status: 'Success' | 'Error' | 'Canceled';
    message: string;
    data: MessageCenterItem[];
}

