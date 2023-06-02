import { spawn } from 'child_process';

interface ExecOutput {
    stdout: string;
    stderr: string;
    code: number;
}

const exec = (command: string, options?: {
    printOnData?: boolean
}) => {
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
                code
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
    let output = await exec(`cd ../contracts/empty && cargo contract build`, { printOnData: true });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});