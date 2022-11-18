const phenomenas = [
    "SH",
    "TS",
    "DZ",
    "RA",
    "GS",
    "GR",
    "SN",
    "SG",
    "BR",
    "FG",
    "HZ",
    "FU",
    "VA",
    "DU",
    "SA",
    "SQ",
    "PO",
    "FC",
    "SS",
    "DS",
  ];
  const cloudTypes = ["CB", "TCU"];
  const cloudAmt = ["NSC", "SKC", "FEW", "SCT", "OVC", "BKN"];

function readTafFromFile(){
    var fs = require("fs");

    try {
        const rawTaf = fs.readFileSync('example-nzwn.txt', 'utf8');
        const splitTaf = rawTaf.split("\r\n");
        console.log("splitTaf: ");
        console.log(splitTaf);

        decodeSplitTaf(splitTaf);
    } catch(e) {
        console.log('There was an error parsing the TAF:', e.stack);
    }
}

function decodeSplitTaf(splitTaf){
    var result = {};
    
    // (1) - Obtain the header, location, issue time and validity.
    // Shift each element, peek at the first to know what we're getting.
    const firstLine = splitTaf[0];
    const splitByLine = firstLine.split(" ");
    if (splitByLine[0] !== "TAF"){
        console.error("String not well formed. Does not begin with TAF")
        return;
    }
    result.magic = splitByLine.shift();
    result.location = splitByLine.shift();
    result.issueTime = splitByLine.shift();

    // everything from this point on can be repeated
    result.forecast = parseVisibilityWxAndCloud(splitByLine);
    
    // (2) Parse significant changes (such as TEMPO, BECMG, PROB)

    let tempoChanges = [];

    for (var i = 1; i < splitTaf.length - 1; i++)
    {
        const splitNthLine = splitTaf[i].split(" ");        
        const firstCharacterOfLine = splitNthLine[0];
        if (firstCharacterOfLine !== "QNH") {
            tempoChanges.push(splitNthLine);
        } else {
            var qnh = splitNthLine.shift();
            var validity = splitNthLine.shift();
            splitNthLine.shift();
            var minimumQnh = splitNthLine.shift();
            splitNthLine.shift();
            var maximumQnh = splitNthLine.shift();
            result.qnh = {
                qnh,
                validity,
                minimumQnh,
                maximumQnh
            }
        }

    }

    result.tempos = tempoChanges;

    console.log(`result: ${JSON.stringify(result, null, 2)}`);
}

function parseVisibilityWxAndCloud(splitByLine){
    result = {}
    result.validity = splitByLine.shift();
    result.clouds = [];
    result.phenomena = [];

    while (splitByLine.length) {
        const token = splitByLine.shift();

        if (token.includes("/")){
            result.validity = token;
        } else if (token.includes("KT")){
            result.windAndDirection = token;
        } else if (token.includes("KM") || !isNaN(token)){
            result.visibility = token;
        } else if (cloudTypes.some(cloudToMatch => token.includes(cloudToMatch))){
            result.clouds.push(token);
        } else if (phenomenas.some(phenomena => token.includes(phenomena))){
            result.phenomena.push(token);
        } 
    }
    return result;
}

readTafFromFile();