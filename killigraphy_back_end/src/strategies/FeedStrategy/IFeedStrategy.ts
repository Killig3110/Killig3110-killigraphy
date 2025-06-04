export interface IFeedStrategy {
    generateFeed(userId: string): Promise<any[]>;
}
