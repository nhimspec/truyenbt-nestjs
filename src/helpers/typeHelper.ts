export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type Paginate<T> = {
    items: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
};

export type JWTPayload = {
    _id: string;
    email: string;
    accessCountToken: string;
    createdAt: string;
    updatedAt: string;
};
