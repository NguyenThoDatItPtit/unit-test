export  interface DefaultResponse<T> {
    status : number,
    message? : string,
    error? : string
    data? : T
}

export default async function safeExecute<T>(fn: () => Promise<DefaultResponse<T>>): 
    Promise<DefaultResponse<T>> {
    try {
        const { status, data, message } = await fn();
        return {
            status,
            data,
            message
        }
    } catch (error: any) {
        console.error("safeExecute error:", error);
        return {
            status: 500,
            message: "Lỗi thực thi hàm",
            error: error.message,
        }
    }
}