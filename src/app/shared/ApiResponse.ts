export interface ApiResponse<T> {
    statusCode: number;
    success: boolean;
    data: T
}
export interface PaginationMetadata {
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
}