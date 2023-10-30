export interface ApiResponse<T> {
    data?: T
    error?: ApiError
}

export interface ApiError {
    code: string,
    message: string
}

export const unknownApiError: ApiResponse<void> = {
    error: {
        code: 'unknown_error',
        message: 'Oops. Something went wrong'
    }
}

export const apiError = (code: string, message: string): ApiResponse<void> => {
    return {
        error: {
            code: code,
            message: message
        }
    }
}

export const apiResponse = <T>(data: T): ApiResponse<T> => {
    return {
        data: data
    }
}