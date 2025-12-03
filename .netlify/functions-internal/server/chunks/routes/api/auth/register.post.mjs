import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import User from '@server/models/user';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import '#auth';
import '@server/utils/abilities';

const register_post = defineEventHandler(async (event) => {
  try {
    const { email, password, username, first_name, last_name } = await readBody(event);
    if (!email || !password || !username) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields"
      });
    }
    const U = User;
    const existingUser = await U.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        // Conflict
        statusMessage: "User with this email or username already exists."
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      first_name,
      last_name
    });
    await newUser.save();
    return { message: "User created successfully" };
  } catch (error) {
    const isErrorObject = error && typeof error === "object";
    const statusCode = isErrorObject ? error.statusCode : 500;
    const statusMessage = isErrorObject ? error.statusMessage : "An unexpected error occurred during registration.";
    throw createError({ statusCode, statusMessage });
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
