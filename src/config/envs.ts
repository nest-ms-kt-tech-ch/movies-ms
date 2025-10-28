import "dotenv/config";
import * as joi from "joi";

interface EnvVars {
  PORT: number;
  OMDB_API_KEY: string;
  OMDB_HOST: string;
}

const envSchema = joi.object({
  PORT: joi.number().default(3002),
  OMDB_API_KEY: joi.string().required(),
  OMDB_HOST: joi.string().uri().required(),
})
.unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = {
    PORT: value.PORT,
    OMDB_API_KEY: value.OMDB_API_KEY,
    OMDB_HOST: value.OMDB_HOST,
};