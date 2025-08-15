declare module "express";
declare module "bcrypt";
declare module "jsonwebtoken";
declare module "cors";
declare module "pg";

// Allow usage of process without errors
declare var process: {
  env: Record<string, string | undefined>;
};
