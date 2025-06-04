// src/services/FeedService.ts

import { IFeedStrategy } from "../strategies/FeedStrategy/IFeedStrategy";

export class FeedService {
    constructor(private strategy: IFeedStrategy) { }

    async getFeed(userId: string) {
        return await this.strategy.generateFeed(userId);
    }
}
