const tracksfolder = "./tracks/"

const fs = require("fs");

async function mergeJson() {

    const tracksData = [];
    const failedData = [];

    fs.readdir(tracksfolder, (error, files) => {
        if (error) {
            console.error("Error reading tracks folder:", error);
            return;
        }

        files.forEach((file, i) => {
            // Only process .json files
            if (!file.endsWith('.json')) return;
            
            try {
                const output = fs.readFileSync(`./tracks/${file}`, { encoding: 'utf8'});
                const json = JSON.parse(output);
                
                // Add trackID from filename if not present
                const entry = {
                    trackID: file.slice(0, -5), // Remove .json extension
                    ...json,
                };

                if (entry) {
                    tracksData.push(entry);
                }
            }
            catch (e) {
                console.error(`Failed to process ${file}:`, e.message);
                failedData.push(file);
            }
        });

        // Sort tracks by trackID
        tracksData.sort((a, b) => a.trackID.localeCompare(b.trackID));

        // Write outputs as a proper JS module
        const successOutput = fs.createWriteStream("trackData.js", { flags: "w" });
        successOutput.write(`// Auto-generated track data - ${new Date().toISOString()}\n`);
        successOutput.write(`// Total tracks: ${tracksData.length}\n\n`);
        successOutput.write(`const trackData = ${JSON.stringify(tracksData, null, 2)};\n\n`);
        successOutput.write(`export default trackData;\n`);

        if (failedData.length > 0) {
            const failedOutput = fs.createWriteStream("tracks-fail-output.txt", { flags: "w" });
            failedOutput.write("These track files failed to process:\n");
            failedData.forEach((fail) => failedOutput.write("- " + fail + "\n"));
            console.log(`\nWarning: ${failedData.length} files failed to process. See tracks-fail-output.txt`);
        }

        console.log(`\nSuccessfully merged ${tracksData.length} tracks into trackData.js`);
    });
}

mergeJson();
