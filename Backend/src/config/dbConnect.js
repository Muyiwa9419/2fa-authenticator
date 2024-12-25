import { connect } from "mongoose";

const dbConnect = async () => {
    try {
        // Check if the CONNECTION_STRING environment variable is set
        if (!process.env.CONNECTION_STRING) {
            console.error("Error: CONNECTION_STRING environment variable is not defined.");
            process.exit(1);
        }

        // Connect to the MongoDB database
        const mongoDbConnection = await connect(process.env.CONNECTION_STRING, {
           
            connectTimeoutMS: 30000, // Timeout after 30 seconds
        });

        console.log(`✅ Database connected: ${mongoDbConnection.connection.host}`);
    } catch (error) {
        console.error(`❌ Database connection failed: ${error.message}`);
        process.exit(1); // Exit the process with a failure code
    }
};

export default dbConnect;
