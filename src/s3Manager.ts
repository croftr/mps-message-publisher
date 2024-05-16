// @ts-nocheck
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const logger = require('./logger');

// Load your AWS credentials (replace placeholders with your actual values)
const s3Client = new S3Client({
    region: "eu-north-1"
});

export const updateObject = async () => {

    logger.info("Start of update object");

    const bucketName = "mps-metadata-europe";
    const key = "rundata.json";
    const newContent = {
        votesLastRunDate: "2024-05-16",
        chips: "yes"
    };

    updateObject(bucketName, key, newContent);


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
        logger.error("Error updating object:", err);
    }
}

