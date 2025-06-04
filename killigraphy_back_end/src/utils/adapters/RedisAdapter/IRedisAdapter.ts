export interface IRedisAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<'OK'>;
    setEx(key: string, seconds: number, value: string): Promise<'OK'>;
    del(key: string): Promise<number>;

    zAdd(key: string, score: number, member: string): Promise<number>;
    zCard(key: string): Promise<number>;
    zRevRange(key: string, start: number, stop: number): Promise<string[]>;

    expire(key: string, seconds: number): Promise<number>;
}
