import mysql, { Connection } from "mysql2/promise";

// Create a connection pool
let connection: Connection | null;

export const createConnect = async (): Promise<Connection> => {
    // if have a connection return old connection
    if (connection) return connection
    
    // if not have a connection create a new one
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    return connection;
};