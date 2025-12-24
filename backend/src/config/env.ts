import "dotenv/config";
import { z } from "zod";


const EnvSchema = z.object({
    PORT : z.string().default("5000"),
    DB_HOST : z.string().default("localhost"),
    DB_PORT : z.string().default("6450"),
    DB_NAME : z.string().default("realtime_chat_and_thread"),
    DB_USER : z.string().default("postgres"),
    DB_PASSWORD : z.string().default("postgres123"),
    DATABASE_URL : z.string().default("postgresql://postgres.cdxbtuhrzsxizesbpyyy:Postgres123vs@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")
})

const parsed = EnvSchema.safeParse(process.env);

if(!parsed.success){
    process.exit(1);
}

export const env = parsed.data;