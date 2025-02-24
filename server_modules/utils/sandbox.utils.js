import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec, spawn } from 'child_process';

const syntaxCpp = async (code) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sandbox-'))
    const filePath = path.join(tempDir, 'temp.cpp')

    fs.writeFileSync(filePath, code)

    return new Promise((resolve, reject) => {
        exec(`g++ -fsyntax-only "${filePath}"`, (err, stdout, stderr) => {
            fs.rmSync(tempDir, { recursive: true, force: true })

            if (err || stderr) {
                const regex = /C:\\Users\\rabes\\AppData\\Local\\Temp\\[^:]+\\/g;
                
                
                // видаляємо шлях до файлу
                const result = err.message.replace(regex, ' ')
                const cleanedStr = result.replace('Command failed: g++ -fsyntax-only " temp.cpp"\n ', '');

                resolve({ status: false,  message: cleanedStr, data: null})
                //reject(new Error(result ))
            }
            resolve({ status: true, message: null, data: null})
        })
    })
}

const compileCpp = async (code) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sandbox-'));
    const filePath = path.join(tempDir, 'temp.cpp');
    const exePath = path.join(tempDir, 'temp.exe');

    fs.writeFileSync(filePath, code);

    return new Promise((resolve, reject) => {
        exec(`g++ "${filePath}" -o "${exePath}"`, (err, stdout, stderr) => {
            if (err || stderr) {
                const regex = /C:\\Users\\rabes\\AppData\\Local\\Temp\\[^:]+\\/g;


                // видаляємо шлях до файлу
                const result = err.message.replace(regex, ' ')
                const cleanedStr = result.replace('Command failed: g++ -fsyntax-only " temp.cpp"\n ', '');

                fs.rmSync(tempDir, { recursive: true, force: true });
                return reject(new Error(cleanedStr));
            }
            resolve({ exePath, tempDir });
        });
    });
};

const runExe = async (exePath, input, timelimit = 1000, memorylimit = 128) => {
    return new Promise((resolve, reject) => {
        let outputEx = '';
        let errorOutput = '';
        let timeoutExceeded = false;        

        const child = spawn(exePath, { stdio: ['pipe', 'pipe', 'pipe'] });
        // Замер времени начала выполнения процесса       
        const startTime = process.hrtime(); 
        let memoryUsage = 0;

        const timeout = setTimeout(() => {
            timeoutExceeded = true;
            child.kill();
            return reject(new Error("Перевищено ліміт виконання"));
        }, timelimit);

        
        child.stdin.write(input);
        child.stdin.end();

        child.stdout.on('data', (data) => {

            outputEx += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        

        child.on('close', (code) => {
            const endTime = process.hrtime(startTime); // возвращает массив: [секунды, наносекунды]
            const executionTimeInSeconds = endTime[0] + endTime[1] / 1e9; // Преобразуем время в секунды

            clearTimeout(timeout);
            if (timeoutExceeded) return;
            if (code !== 0) {
                return reject(new Error(`Execution error: ${errorOutput}`));
            }
            resolve({output:outputEx.trim(), time: executionTimeInSeconds});
        });
    });
};

const cleanup = (tempDir) => {
    fs.rmSync(tempDir, { recursive: true, force: true })
}

export   { compileCpp, syntaxCpp, runExe, cleanup };
