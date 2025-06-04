export interface IUpdateStrategy<TInput, TResult> {
    update(data: TInput): Promise<TResult>;
}