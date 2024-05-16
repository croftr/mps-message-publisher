// @ts-nocheck
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const logger = require('./logger');

// Load your AWS credentials (replace placeholders with your actual values)
const s3Client = new S3Client({
    region: "eu-north-1"
});

export const putObject = async () => {

    const bucketName = "mps-metadata-europe";
    const key = "rundata.json";

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0'); 
    
    const formattedDate = `${year}-${month}-${day}`;    

    const newContent = {
        votesLastRunDate: formattedDate,        
    };

    logger.info(`Pushing to S3 ${JSON.stringify(newContent)}`);

    try {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: JSON.stringify(newContent)
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        logger.info("Object updated successfully.");
    } catch (err) {
        logger.info("error uploading to S3");
        throw err;
    }
}


export const getObject = async () => {

    const bucketName = "mps-metadata-europe";
    const key = "rundata.json";

    try {

        const params = { Bucket: bucketName, Key: key };
        const command = new GetObjectCommand(params);

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching object: ${response.status} ${response.statusText}`);
        }

        let data = await response.json();

        return data;


    } catch (err) {
        logger.info("error getting from S3");
        throw err;
    }
}

