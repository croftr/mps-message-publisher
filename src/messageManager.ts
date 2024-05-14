import { MPMessage } from "./models/mps";
import { Division } from "./models/divisions";
const logger = require('./logger');

var AWS = require("aws-sdk");
AWS.config.update({ region: "eu-north-1" });

/**
 * Publish to mpsQueue 
 */
export const publishMpMessage = async (mp: MPMessage) => {

    console.log("publish ", mp.id, mp.name);

    const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

    try {

        var params = {
            DelaySeconds: 10,
            MessageAttributes: {
                Title: {
                    DataType: "String",
                    StringValue: mp.name,
                }
            },
            MessageBody: JSON.stringify(mp),
            QueueUrl: "https://sqs.eu-north-1.amazonaws.com/905418468533/mpsQueue",
        };

        await sqs.sendMessage(params).promise();
        logger.info(`MP message sent for ${mp.name}`);

    } catch (error) {
        logger.error(`Error sending message ${error}`);        
    }

}


/**
 * Publish to voteQueue 
 */
export const publishDivisionMessage = async (division: Division) => {
    
    const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

    try {

        var params = {
            DelaySeconds: 10,
            MessageAttributes: {
                Title: {
                    DataType: "String",
                    StringValue: division.Title,
                }
            },
            MessageBody: JSON.stringify({ id: division.DivisionId, title: division.Title, date: division.Date }),
            QueueUrl: "https://sqs.eu-north-1.amazonaws.com/905418468533/voteQueue",
        };

        await sqs.sendMessage(params).promise();
        logger.info(`Division message sent for ${division.DivisionId} ${division.Title} ${division.Date}`);

    } catch (error) {
        logger.error(`Error sending message ${error}`);        
    }

}