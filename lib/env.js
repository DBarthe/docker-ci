import fs from "fs";
import dotenv from "dotenv";

const envFile = './env/dev.env';
if (fs.existsSync(envFile)) {
  dotenv.config({path: envFile})
}
