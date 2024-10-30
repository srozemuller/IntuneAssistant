export enum PaymentStatus {
    Failed = 'FAILED',
    Pending = 'PENDING',
    Processing = 'PROCESSING',
    Success = 'SUCCESS',
}

export interface Payment {
    id: string;
    amount: number;
    status: PaymentStatus;
    email: string;
}