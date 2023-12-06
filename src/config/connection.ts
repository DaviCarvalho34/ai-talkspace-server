import dotenv from "dotenv";
import mongoose, { ConnectOptions } from "mongoose";

dotenv.config();

const connect = (): void => {
    const options: ConnectOptions = {
        useUnifiedTopology: true
    } as any;

    mongoose
        .connect(process.env.MONGO_URI as string, options)
        .then(() => {
            console.log('Database connected');
        })
        .catch((error) => {
            console.error("database error");
        });
};

export default connect;