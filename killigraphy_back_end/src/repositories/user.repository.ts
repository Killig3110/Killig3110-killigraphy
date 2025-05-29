import Users from "../models/Users";

export const findUserById = (id: string) => Users.findById(id);
export const saveUser = (user: any) => user.save();