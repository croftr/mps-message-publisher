const logger = require('./logger');

import { createMpNode, createDivisionNode, setupNeo, createVotedForDivision, cleanUp, setupDataScience, getPartyMpCounts, createPartyNode, createParyRelationships } from "./neoManager";

export const createParties = async () => {

    logger.info("Creating party nodes")

    const result = await getPartyMpCounts(); 

    const allParties:any = [];
    for await (const record of  result.records) {

        const party = { 
            name: record._fields[0],
            mpsCount: record._fields[1].low,
        }

        allParties.push(party);

    }

    const otherParties = [
        "Sinn Fin",
        "Conservative",
        "Labour",
        "Liberal Democrat",
        "Renew",
        "Duma Polska  Polish Pride Deregistered 021019",
        "British National Party",
        "Scottish Socialist Party",
        "Scottish National Party",
        "Plaid Cymru",
        "People Before Profit",
        "UK Independence Party",
        "Green Party",
        "Ashfield Independents",
        "Communist Party of Britain",
        "Veterans and Peoples Party Deregistered 091123",
        "Womens Equality Party",
        "Cooperative Party",
        "Alliance  Alliance Party of Northern Ireland",
        "Aspire",
        "Yorkshire Party",
        "Ulster Unionist Party",
        "Advance Together Deregistered 011020",
        "Reform UK",
        "The Official Monster Raving Loony Party",
        "Scottish Green Party",
        "Scottish Libertarian Party Deregistered 111122",
        "The Independent Group for Change Deregistered 230720",
        "The Liberal Party",
        "The Reclaim Party",
        "The Radical Party Deregistered 191020",
        "Hersham Village Society",
        "Animal Welfare Party",
        "True  Fair Party",
        "Alba Party",
        "The Socialist Party of Great Britain",
        "London Real Party",
        "All For Unity Deregistered 060522",
        "Rejoin EU",
        "Scottish Family Party",
        "Traditional Unionist Voice  TUV",
        "Breakthrough Party",
        "British National Party Deregistered 080116",
        "ProLife Deregistered 241204",
        "Legalise Cannabis Alliance Deregistered 211106",
        "Christian Party",
        "The New Party Deregistered 010710",
        "The Peoples Alliance Deregistered 140704",
        "Forward Wales Deregistered 160310",
        "The Respect Party Deregistered 180816",
        "The Peace Party  Nonviolence Justice Environment",
        "Common Good",
        "Alliance For Green Socialism",
        "Veritas Deregistered 050516",
        "The Blah Party Deregistered 110908",
        "Mums Army Deregistered 130312",
        "mums4justice Deregistered 160511",
        "women4theworld Deregistered 080609",
        "Scottish Voice Deregistered 121115",
        "National Front Deregistered 011114",
        "Better Bedford Independent Party Deregistered 200911",
        "Left List Deregistered 200410",
        "The Buckinghamshire Campaign for Democracy Deregistered 010710",
        "East Herts People Deregistered 051113",
        "Mebyon Kernow  The Party for Cornwall",
        "No2EUYes to Democracy Deregistered 021110",
        "United Kingdom First Deregistered 120410",
        "Fair Pay Fair Trade Party Deregistered 270709",
        "Yes 2 Europe",
        "Pro Democracy Libertaseu Deregistered 021110",
        "Jury Team Deregistered 090511",
        "Trust Deregistered 120411",
        "Freedom and Responsibility Deregistered 070611",
        "Solihull and Meriden Residents Association",
        "Democracy 2015 Deregistered 011114",
        "Dont Cook Party Deregistered 200614",
        "Life",
        "We Demand A Referendum Now Deregistered 031116",
        "NO2EU Deregistered 011114",
        "Fulham Group Deregistered 041115",
        "All Peoples Party Deregistered 170420",
        "Socialist Alliance Deregistered 300622",
        "Tower Hamlets First Deregistered 290415",
        "Cannabis is Safer than Alcohol Deregistered 031116",
        "Both Unions Party of Northern Ireland",
    ]

    otherParties.forEach(i => {
        // @ts-ignore
        if (!allParties.find(o => o.name === i)) {
            allParties.push({ name: i, mpsCount: 0 })   
        }
    })

    for await (const party of allParties) {
        await createPartyNode(party);
    }

    logger.info(`Created ${allParties.length} pary nodes`);

    await createParyRelationships();

}
