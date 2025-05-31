import Users from "../models/Users";

export const findUserById = (id: string) =>
    Users.findById(id).select('-password -__v -createdAt -updatedAt'
    );
export const findUsersByIds = (ids: string[]) =>
    Users.find({ _id: { $in: ids } }).select('-password -__v -createdAt -updatedAt'
    );
export const findUsersNotIn = (excludedIds: string[], skip: number, limit: number) =>
    Users.find({ _id: { $nin: excludedIds } })
        .select('-password -__v -createdAt -updatedAt')
        .skip(skip)
        .limit(limit);
export const saveUser = (user: any) => user.save();
export const findByEmail = (email: string) => {
    return Users.findOne({ email })
        .select('-password -__v -createdAt -updatedAt');
};
export const findByEmailWithPassword = (email: string) => {
    return Users.findOne({ email }).select('+password');
};
export const createUser = (data: any) => {
    return Users.create({
        ...data,
        imageUrl: 'https://ik.imagekit.io/killigraphy/profile-placeholder.svg',
    });
};
export const findUserByIdWithFollowers = (id: string) =>
    Users.findById(id).populate('followers', '-password -__v');

export const findUserByIdWithFollowing = (id: string) =>
    Users.findById(id).populate('following', '-password -__v');

export const findUserByIdWithPassword = (id: string) =>
    Users.findById(id).select('+password');