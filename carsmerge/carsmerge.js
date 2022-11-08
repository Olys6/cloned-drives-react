const carsfolder = "./cars/"

const fs = require("fs");

async function mergeJson() {

    const carsData = [];
    const failedData = [];

    fs.readdir(carsfolder, (error, files) => {
        files.forEach((file, i) => {
            // if(i > 1) return;
            try {
                // console.log(file)
            const output = fs.readFileSync(`./cars/${file}`, { encoding: 'utf8'});
            const json = JSON.parse(output)
            
            const entry = {
                id: file,
                ...json,
            };


            if (entry) {
                // console.log(JSON.stringify(json))
                carsData.push(entry)
                // fs.writeFileSync(`combine.json`, JSON.stringify(output), { flag: "a" });
            }
        }
    catch (e) {
        failedData.push(file)
    }})
        const failedOutput = fs.createWriteStream("fail-output.txt", { flags: "a" })
        const successOutput = fs.createWriteStream("succes-output.txt", { flags: "a" })
        successOutput.write(`${JSON.stringify(carsData)}`)
        failedOutput.write("These failed -> ")
        failedData.forEach((fail) => failedOutput.write(fail + ", "))
    });

}

mergeJson();