import { getMps, getAllDivisions, getCommonsVotesAfterDate } from "./src/apicall";
import { createMpNode, createDivisionNode, setupNeo } from "./src/neoManager";
import { Mp, MPMessage } from "./src/models/mps";
import { Division } from "./src/models/divisions";
import { publishMpMessage, publishDivisionMessage } from "./src/messageManager";
import { getObject, putObject } from "./src/s3Manager";
import { exec } from "child_process";

const logger = require('./src/logger');

const CREATE_MPS = process.env.CREATE_MPS === "true" ? true : false;
const CREATE_DIVISIONS = process.env.CREATE_DIVISIONS === "true" ? true : false;
const JUST_PUBLISH_MESSAGES = process.env.JUST_PUBLISH_MESSAGES === "true" ? true : false;
const CREATE_ONLY_NEW_DIVISIONS = process.env.CREATE_ONLY_NEW_DIVISIONS === "true" ? true : false;

const endAndPrintTiming = (timingStart: number, timingName: string) => {
  // END timing
  let timingEnd = performance.now();
  logger.info(`<<TIMING>> ${timingName} in ${(timingEnd - timingStart) / 1000} seconds`);
}

/**
 * Order mps by name
 * @param a 
 * @param b 
 * @returns 
 */
const sortMps = (a: Mp, b: Mp) => {
  if (a.nameDisplayAs < b.nameDisplayAs) {
    return -1;
  }
  if (a.nameDisplayAs > b.nameDisplayAs) {
    return 1;
  }
  return 0;
}

const go = async () => {

  try {

    logger.info(`Node Creation plan`);
    logger.info(`Creating MPS: ${CREATE_MPS}`);
    logger.info(`Creating DIVISIONS ${CREATE_DIVISIONS}`);

    await setupNeo();

    const allMps: Array<Mp> = [];
    const allDivisions: Array<Division> = [];

    const MAX_LOOPS = 1000;
    let skip = 0;

    let neoCreateCount = 0;

    // Start timing
    const totalTimeStart = performance.now();
    let timingStart = performance.now();

    if (CREATE_DIVISIONS) {
      //create all the divisions     
      skip = 0;
      for (let i = 0; i < MAX_LOOPS; i++) {
        //get all the divisions from the API (25 at a time) and store them in memory        
        const divisions: Array<Division> = await getAllDivisions(skip, 25);
        skip += 25;
        let fetchCount = divisions.length;

        allDivisions.push(...divisions)

        if (fetchCount < 25) {
          break;
        }
      }

      logger.debug(`Created ${allDivisions.length} divisions in memory`);

      neoCreateCount = 0;
      for (let i of allDivisions) {
        //loop through all mps in memory and store them in database
        await createDivisionNode(i);
        neoCreateCount = neoCreateCount + 1;
      }

      logger.debug(`Created ${neoCreateCount} divisions in Neo4j`);

    } else if (CREATE_ONLY_NEW_DIVISIONS) {

      try {

        const object = await getObject();
        // @ts-ignore    
        const formattedFromDate = object.votesLastRunDate;

        logger.info(`Getting all house of commons votes since ${formattedFromDate}`)

        const votesSinceDate: Array<Division> = await getCommonsVotesAfterDate(formattedFromDate);

        for (let vote of votesSinceDate) {
          // @ts-ignore      
          await publishDivisionMessage(vote);
        }
      } catch (error) {
        logger.error("Error creating divisions")
        console.error("error ", error)
      }
    }

    // END timing
    endAndPrintTiming(timingStart, 'created divisions');

    // Start timing
    timingStart = performance.now();

    skip = 0;

    neoCreateCount = 0;

    for (let i = 0; i < Number(process.env.MP_LOOPS); i++) {

      const mps: Array<Mp> = await getMps(skip, Number(process.env.MP_TAKE_PER_LOOP));

      skip += 25;
      allMps.push(...mps);

      if (mps.length < 20) {
        break;
      }
    }

    allMps.sort(sortMps);
    logger.debug(`Created ${allMps.length} MPs in memory`);

    if (CREATE_MPS) {
      for (let i of allMps) {

        if (!JUST_PUBLISH_MESSAGES) {
          await createMpNode(i);
          neoCreateCount = neoCreateCount + 1;
        }

        //push mp to queue
        const message: MPMessage = { id: i.id, name: i.nameDisplayAs };
        await publishMpMessage(message);

      }
      logger.debug(`Created ${neoCreateCount} MPs in Neo4j`);
    }

    endAndPrintTiming(timingStart, 'created MPs');


    endAndPrintTiming(totalTimeStart, 'Workflow complete');

    await putObject();
    logger.info('THE END');

  } catch (error) {
    // @ts-ignore      
    logger.error(`An error has occured ${error.message}`);
    console.error("Error", error);

  } finally {
    exec('shutdown -h now', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing shutdown: ${error}`);
        return;
      }
      console.log(`Shutdown command executed successfully.`);
    });    
  }

}

go();


