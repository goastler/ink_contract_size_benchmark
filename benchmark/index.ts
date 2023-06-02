import { spawn } from 'child_process';
import fs from 'fs';

interface ExecOutput {
    stdout: string;
    stderr: string;
    code: number;
}

const exec = (command: string, options?: {
    printOnData?: boolean
}) : Promise<ExecOutput> => {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, { shell: true });
        
        let stdout: string[] = [];
        let stderr: string[] = [];

        proc.stdout.on('data', (data) => {
            stdout.push(data);
            if(options?.printOnData) process.stdout.write(data.toString());
        });

        proc.stderr.on('data', (data) => {
            stderr.push(data);
            if(options?.printOnData) process.stderr.write(data.toString());
        });

        proc.on('close', (code) => {
            resolve({
                stdout: stdout.join(''),
                stderr: stderr.join(''),
                code: code || 0,
            });
        });

        proc.on('error', (err) => {
            reject({
                stdout: stdout.join(''),
                stderr: stderr.join(''),
                code: -1,
                err
            })
        });
    });
}

const main = async () => {
    const contracts = fs.readdirSync(`${__dirname}/../contracts`);
    const modes = ['debug', 'release'];
    const codeSizes: string[] = [];
    const promises: Promise<ExecOutput>[] = [];
    for(let i = 0; i < modes.length; i++) {
        const mode = modes[i];
        let flag = '';
        if(mode === 'release') flag = '--release';
        else if(mode === 'debug') flag = '';
        else throw new Error(`unknown mode: ${mode}`);
        await Promise.all(promises);
        for(let j = 0; j < contracts.length; j++) {
            const contract = contracts[j];
            const promise = exec(`cd "${__dirname}/../contracts/${contract}" && cargo contract build ${flag}`, { printOnData: true });
            promises.push(promise);
        }
    }
    for(const promise of promises) {
        const output = await promise;
        const lines = output.stdout.split('\n');
        for(const line of lines) {
            if(line.startsWith('Original wasm size:')) {
                let parts = line.split(' ');
                let codeSize = parts[5];
                codeSize = codeSize.replace('K', '');
                codeSizes.push(codeSize);
                break;
            }
        }
    }
    for(const mode of modes) {
        const file = `output-${mode}.csv`;
        fs.writeFileSync(file, `contract,codeSize\n`);
        for(const contract of contracts) {
            fs.writeFileSync(file, `${contract},${codeSizes.shift()}\n`, { flag: 'a' });
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});