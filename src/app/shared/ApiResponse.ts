export interface ApiResponse<T>{
    statusCode: number;
    success: boolean;
    data: T
}
export interface PaginationMetadata {
    totalRecords: number;
    currentPage: number;
    fixedLimit: number;
    totalPages: number;
}