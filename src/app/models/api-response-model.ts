export interface ApiResponseModel<T> {
    responseCode: number;
    description: string;
    data?: T;
}
