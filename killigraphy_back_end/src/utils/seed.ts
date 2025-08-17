import mongoose from "mongoose";
import User from "../models/Users";
import Post from "../models/Posts";
import { faker } from "@faker-js/faker";
import bcrypt from 'bcryptjs';

export async function seed() {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();
        if (userCount > 0 && postCount > 0) return;

        const usersData = Array.from({ length: 100 }).map(() => ({
            name: faker.person.fullName(),
            username: faker.internet.username(),
            accountId: faker.string.uuid(),
            email: faker.internet.email(),
            password: bcrypt.hashSync(faker.internet.password(), 10),
            imageUrl: faker.image.avatar(),
            bio: faker.lorem.sentence(),
        }));

        const users = await User.insertMany(usersData);
        console.log("Seeded users:", usersData.length);

        const postsData = Array.from({ length: 1000 }).map(() => {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            return {
                caption: faker.lorem.paragraph(),
                imageURL: faker.image.urlPicsumPhotos({ width: 600, height: 400 }),
                imageId: faker.string.uuid(),
                tags: faker.lorem.words(3).split(" "),
                location: faker.location.city(),
                creator: randomUser._id,
                createdAt: faker.date.recent({ days: 30 }),
            };
        });

        const posts = await Post.insertMany(postsData);
        console.log(`Seeded ${posts.length} posts`);
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}