import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./db/db.js";
import { logger } from "./lib/logger.js";
import http from "node:http"



async function boostrap() {
    try {

        await connectDb();
        const app = createApp();
        const server = http.createServer(app);


        const port = Number(env.PORT) || 5000;

        server.listen(port , () => {
            logger.info(`Server is now listening on the port ${port}`)
        })

        
    } catch (error) {
        logger.error("Failed to start the server" , `${(error as Error).message}`)
        process.exit(1);
    }
    
}

boostrap();