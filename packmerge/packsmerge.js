const packsfolder = "./packs/"

const fs = require("fs");

async function mergeJson() {

    const packsData = [];
    const failedData = [];

    fs.readdir(packsfolder, (error, files) => {
        if (error) {
            console.error("Error reading packs folder:", error);
            return;
        }

        files.forEach((file, i) => {
            // Only process .json files
            if (!file.endsWith('.json')) return;
            
            try {
                const output = fs.readFileSync(`./packs/${file}`, { encoding: 'utf8'});
                const json = JSON.parse(output);
                
                // Add packID from filename if not present
                const entry = {
                    packID: file.slice(0, -5), // Remove .json extension
                    ...json,
                };

                if (entry) {
                    packsData.push(entry);
                }
            }
            catch (e) {
                console.error(`Failed to process ${file}:`, e.message);
                failedData.push(file);
            }
        });

        // Sort packs by packID
        packsData.sort((a, b) => a.packID.localeCompare(b.packID));

        // Write outputs
        const successOutput = fs.createWriteStream("packData.js", { flags: "w" });
        successOutput.write(`// Auto-generated pack data - ${new Date().toISOString()}\n`);
        successOutput.write(`// Total packs: ${packsData.length}\n\n`);
        successOutput.write(`const packData = ${JSON.stringify(packsData, null, 2)};\n\n`);
        successOutput.write(`export default packData;\n`);

        if (failedData.length > 0) {
            const failedOutput = fs.createWriteStream("packs-fail-output.txt", { flags: "w" });
            failedOutput.write("These pack files failed to process:\n");
            failedData.forEach((fail) => failedOutput.write("- " + fail + "\n"));
            console.log(`\nWarning: ${failedData.length} files failed to process. See packs-fail-output.txt`);
        }

        console.log(`\nSuccessfully merged ${packsData.length} packs into packData.js`);
    });
}

mergeJson();
