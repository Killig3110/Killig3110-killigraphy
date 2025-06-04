import { IFeedStrategy } from './IFeedStrategy';

export class FeedContext {
    constructor(private strategy: IFeedStrategy) { }

    setStrategy(strategy: IFeedStrategy) {
        this.strategy = strategy;
    }

    async getFeed(userId: string) {
        return await this.strategy.generateFeed(userId);
    }
}
